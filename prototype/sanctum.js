// Sanctum prototype: Tarot Pull as a place under the real night sky.
//
// - The sky (three.js r128) is tonight's: real moon phase, time-of-day
//   colours, a slow-turning field of stars.
// - Each deck is a constellation; every card is one star in it. Drawing a
//   card you've never met lights its star for good, so your sky fills in
//   as you use the app (the grimoire, stored in localStorage).
// - The hub keeps one-tap drawing: tonight's card waits on the altar.
// - Reveals are staged: the room dims, a tell glows in the card's colour,
//   it turns (pausing edge-on), bursts, and a spark flies up to its star.
//
// Uses the deck data from data.js (DECKS) and nothing from the main app.
(function () {
  "use strict";

  const DEG = Math.PI / 180;
  const SKY_RADIUS = 300;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ---- Small utilities ----

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Storage unavailable: progress just won't persist.
    }
  }

  function hashString(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seededRandom(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dateKey(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function lighten(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c) => Math.round(c + (255 - c) * amount);
    const r = mix((n >> 16) & 255);
    const g = mix((n >> 8) & 255);
    const b = mix(n & 255);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // ---- Tonight's sky: moon phase and time of day ----

  // Moon-sun elongation from low-precision ephemerides (about 15 minutes
  // accuracy on the phase): 0 = new, 180 = full.
  function moonElongation(date) {
    const norm = (x) => ((x % 360) + 360) % 360;
    const d = date.getTime() / 86400000 - 10957.5; // days since J2000
    const Ms = 357.529 + 0.98560028 * d;
    const ls = 280.459 + 0.98564736 * d + 1.915 * Math.sin(Ms * DEG) + 0.02 * Math.sin(2 * Ms * DEG);
    const Lm = 218.316 + 13.176396 * d;
    const Mm = 134.963 + 13.064993 * d;
    const D = 297.85 + 12.190749 * d;
    const lm = Lm + 6.289 * Math.sin(Mm * DEG) + 1.274 * Math.sin((2 * D - Mm) * DEG) + 0.658 * Math.sin(2 * D * DEG)
      - 0.186 * Math.sin(Ms * DEG) - 0.059 * Math.sin((2 * D - 2 * Mm) * DEG) - 0.057 * Math.sin((2 * D - Ms - Mm) * DEG);
    return norm(lm - ls);
  }

  const PHASES = [
    { upTo: 6, name: "New Moon", blurb: "A dark sky for beginnings. Draw for what you want to plant." },
    { upTo: 84, name: "Waxing Crescent", blurb: "Intentions take root. Draw for the first step." },
    { upTo: 96, name: "First Quarter", blurb: "Half lit, half hidden. Draw for what stands in the way." },
    { upTo: 174, name: "Waxing Gibbous", blurb: "Almost full. Draw for what still needs refining." },
    { upTo: 186, name: "Full Moon", blurb: "Everything is lit. Draw for what's ready to be seen." },
    { upTo: 264, name: "Waning Gibbous", blurb: "The light pours back out. Draw for what to share." },
    { upTo: 276, name: "Last Quarter", blurb: "Half the moon let go. Draw for what to release." },
    { upTo: 354, name: "Waning Crescent", blurb: "A thin light before rest. Draw for what to put down." },
    { upTo: 361, name: "New Moon", blurb: "A dark sky for beginnings. Draw for what you want to plant." }
  ];

  function moonInfo(date) {
    const elongation = moonElongation(date);
    const phase = PHASES.find((p) => elongation < p.upTo);
    return {
      elongation,
      illumination: (1 - Math.cos(elongation * DEG)) / 2,
      waxing: elongation < 180,
      name: phase.name,
      blurb: phase.blurb
    };
  }

  // Next time the elongation passes `target` (0 new, 180 full), to the hour.
  function nextMoonAt(target, from) {
    const remaining = (date) => (((target - moonElongation(date)) % 360) + 360) % 360;
    let previous = remaining(from);
    for (let h = 1; h <= 24 * 31; h++) {
      const date = new Date(from.getTime() + h * 3600000);
      const left = remaining(date);
      if (left > previous + 180) return date;
      previous = left;
    }
    return null;
  }

  // The sanctum's sky never goes to daylight blue (that just hides the
  // stars); the hour only shifts how far toward dusk the horizon glows.
  const SKY_MOODS = {
    night: { top: "#02020a", mid: "#080920", horizon: "#1b1440", stars: 1, greeting: "Good evening" },
    dawn: { top: "#03041a", mid: "#12163f", horizon: "#4a2c5c", stars: 0.85, greeting: "Good morning" },
    day: { top: "#040822", mid: "#0f1642", horizon: "#2a2b62", stars: 0.78, greeting: "Good afternoon" },
    dusk: { top: "#030418", mid: "#17123c", horizon: "#552a52", stars: 0.9, greeting: "Good evening" }
  };

  function skyMood(date) {
    const h = date.getHours() + date.getMinutes() / 60;
    if (h < 5 || h >= 21) return SKY_MOODS.night;
    if (h < 8) return SKY_MOODS.dawn;
    if (h < 17) return SKY_MOODS.day;
    return SKY_MOODS.dusk;
  }

  // ---- Places and their constellations ----

  // Each deck sits in its own patch of sky. u/v are degrees right/up of
  // the patch's centre; `links` are constellation lines between card
  // indexes.
  const REGION_PITCH = 17;
  const REGION_HALF = 11.5;

  function tarotLayout(cards) {
    const stars = [];
    const links = [];
    cards.forEach((card, i) => {
      if (i === 0) {
        stars.push({ u: 0, v: 0, size: 1.5 }); // The Fool at the hub of the wheel
      } else if (i < 22) {
        const a = (90 - (i - 1) * (360 / 21)) * DEG;
        stars.push({ u: 6 * Math.cos(a), v: 6 * Math.sin(a), size: 1.25 });
        links.push([i, i === 21 ? 1 : i + 1]);
      } else {
        const suit = Math.floor((i - 22) / 14);
        const rank = (i - 22) % 14;
        const a = (45 + suit * 90 - 32 + rank * (64 / 13)) * DEG;
        stars.push({ u: 10.5 * Math.cos(a), v: 10.5 * Math.sin(a), size: rank >= 10 ? 1 : 0.8 });
        if (rank < 13) links.push([i, i + 1]);
      }
    });
    links.push([0, 1], [0, 21]);
    return { stars, links };
  }

  function oracleLayout(cards) {
    const stars = cards.map((card, i) => {
      const r = 1.42 * Math.sqrt(i + 0.5);
      const a = i * 137.508 * DEG;
      return { u: r * Math.cos(a), v: r * Math.sin(a), size: card.arcana === "Custom Arcana" ? 1.15 : 0.9 };
    });
    const links = [];
    for (let i = 0; i + 13 < cards.length; i++) links.push([i, i + 13]);
    return { stars, links };
  }

  function archetypesLayout(cards) {
    const groups = [];
    cards.forEach((card, i) => {
      let group = groups.find((g) => g.type === card.type);
      if (!group) {
        group = { type: card.type, indexes: [] };
        groups.push(group);
      }
      group.indexes.push(i);
    });
    const stars = new Array(cards.length);
    const links = [];
    groups.forEach((group, g) => {
      const n = group.indexes.length;
      group.indexes.forEach((cardIndex, k) => {
        const t = n > 1 ? k / (n - 1) : 0;
        const r = 2.2 + 9.3 * t;
        const a = (90 - g * 90 - 110 * t) * DEG;
        stars[cardIndex] = { u: r * Math.cos(a), v: r * Math.sin(a), size: group.type === "Initiations" ? 1.2 : 0.95 };
        if (k > 0) links.push([group.indexes[k - 1], cardIndex]);
      });
    });
    return { stars, links };
  }

  const PLACES = {
    tarot: { name: "Tarot Wheel", deck: DECKS.classical, yaw: -64, layout: tarotLayout, tint: "#f4d58d", reversible: true },
    oracle: { name: "Oracle Spiral", deck: DECKS.custom, yaw: 64, layout: oracleLayout, tint: "#9fe6d8" },
    archetypes: { name: "Archetype Gate", deck: DECKS.archetypes, yaw: 180, layout: archetypesLayout, tint: "#f3aecd" }
  };

  function directionFor(yawDeg, pitchDeg) {
    const yaw = yawDeg * DEG;
    const pitch = pitchDeg * DEG;
    return [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
  }

  // Every card in every deck as a star, with its sky direction.
  const STARS = [];
  const STAR_BY_SLUG = {};
  Object.entries(PLACES).forEach(([key, place]) => {
    const { stars, links } = place.layout(place.deck.cards);
    place.offset = STARS.length;
    place.layoutStars = stars;
    place.links = links.map(([a, b]) => [a + place.offset, b + place.offset]);
    place.deck.cards.forEach((card, i) => {
      const { u, v, size } = stars[i];
      const pitch = REGION_PITCH + v;
      const yaw = place.yaw + u / Math.cos(REGION_PITCH * DEG);
      const star = { key, card, size, dir: directionFor(yaw, pitch), index: STARS.length };
      STAR_BY_SLUG[card.slug] = star;
      STARS.push(star);
    });
  });

  // ---- Persistent state ----

  const now = new Date();
  const todayKey = dateKey(now);
  const grimoire = load("sanctumGrimoire", {}); // slug -> { n, first }
  const nights = load("sanctumNights", { count: 0, last: null });
  const returningToday = nights.last === todayKey;
  const awayBefore = nights.last && nights.last !== todayKey;
  if (!returningToday) {
    nights.count += 1;
    nights.last = todayKey;
    save("sanctumNights", nights);
  }

  const OFFERINGS = [
    "A moth left a pressed violet. Whatever you're carrying today, you can set some of it down.",
    "A fortune slip, folded twice: the door you keep walking past is not locked.",
    "A single silver feather. Be lighter with yourself this week.",
    "A small stone, still warm. You're steadier than you feel.",
    "A thread of red wool. Follow the thing that keeps tugging at you.",
    "Three dried petals in a row. Something is quietly finishing; let it.",
    "A candle stub and a note: rest is part of the work.",
    "An acorn. Plant something small and forget about it for a while.",
    "A key with no lock. Not every answer is for opening things.",
    "A star chart with one star circled. Someone is thinking of you."
  ];
  let offering = load("sanctumOffering", null);
  if (awayBefore && (!offering || offering.date !== todayKey)) {
    const pick = seededRandom(hashString(todayKey + "offering"))();
    offering = { date: todayKey, text: OFFERINGS[Math.floor(pick * OFFERINGS.length)], opened: false };
    save("sanctumOffering", offering);
  }

  function metCount(key) {
    return PLACES[key].deck.cards.filter((card) => grimoire[card.slug]).length;
  }

  function totalMet() {
    return Object.keys(grimoire).filter((slug) => STAR_BY_SLUG[slug]).length;
  }

  // Tonight's card: the same for everyone on the same date, like a daily
  // puzzle, from the classical deck.
  function dailyPick() {
    const random = seededRandom(hashString(todayKey + "daily"));
    const cards = PLACES.tarot.deck.cards;
    return { card: cards[Math.floor(random() * cards.length)], reversed: random() < 0.35 };
  }

  function dailyRevealed() {
    const daily = load("sanctumDaily", null);
    return daily && daily.date === todayKey;
  }

  // ---- The sky renderer ----

  const cam = { yaw: 0, pitch: -28, fov: baseFov(), tween: null };
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
  let renderer = null;
  let scene = null;
  let camera = null;
  let pixelRatio = 1;
  const uniforms = {
    uTime: { value: 0 },
    uPx: { value: 1 },
    uStarAlpha: { value: 1 },
    uFocus: { value: 0 }
  };
  let litAttr = null;
  let flareAttr = null;
  let lineLitAttr = null;
  let rafId = null;
  const clock = () => performance.now() / 1000;

  function baseFov() {
    return window.innerWidth < window.innerHeight ? 70 : 58;
  }

  function hubCamera() {
    return { yaw: 0, pitch: 4, fov: baseFov() };
  }

  // Looks a little below the place's constellation, so the stars fill the
  // top of the screen and the card sits under them.
  function placeCamera(key) {
    const fov = baseFov();
    return { yaw: PLACES[key].yaw, pitch: REGION_PITCH + REGION_HALF + 3 - fov / 2, fov };
  }

  function skyCamera(key) {
    return { yaw: PLACES[key].yaw, pitch: REGION_PITCH, fov: window.innerWidth < window.innerHeight ? 62 : 46 };
  }

  const STAR_VERTEX = `
    attribute float size;
    attribute float seed;
    attribute float alpha;
    attribute vec3 tint;
    uniform float uTime;
    uniform float uPx;
    uniform float uStarAlpha;
    uniform float uFocus;
    varying vec3 vTint;
    varying float vAlpha;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      float twinkle = 0.68 + 0.32 * sin(uTime * (0.45 + seed * 2.1) + seed * 61.0);
      vAlpha = alpha * uStarAlpha * mix(1.0, twinkle, step(size, 6.0)) * (1.0 - 0.55 * uFocus);
      vTint = tint;
      gl_PointSize = size * uPx;
    }`;

  const STAR_FRAGMENT = `
    varying vec3 vTint;
    varying float vAlpha;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = dot(c, c) * 4.0;
      float a = exp(-d * 5.5);
      gl_FragColor = vec4(vTint, a * vAlpha);
    }`;

  const GRIMOIRE_VERTEX = `
    attribute float size;
    attribute float seed;
    attribute float lit;
    attribute float flare;
    attribute vec3 tint;
    uniform float uTime;
    uniform float uPx;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vLit;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      float f = clamp(1.0 - (uTime - flare) / 2.8, 0.0, 1.0);
      f = f * f * f;
      float twinkle = 0.86 + 0.14 * sin(uTime * 1.3 + seed * 47.0);
      vLit = lit;
      vColor = mix(vec3(0.62, 0.67, 0.92), tint, lit);
      vAlpha = mix(0.55, 1.0, lit) * twinkle + f * 1.6;
      gl_PointSize = size * uPx * mix(6.5, 12.0, lit) * (1.0 + 3.2 * f);
    }`;

  const GRIMOIRE_FRAGMENT = `
    varying vec3 vColor;
    varying float vAlpha;
    varying float vLit;
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      float d = dot(c, c) * 4.0;
      float core = exp(-d * 16.0);
      float halo = exp(-d * 3.5) * 0.4 * (0.25 + vLit);
      gl_FragColor = vec4(vColor, (core + halo) * vAlpha);
    }`;

  const LINE_VERTEX = `
    attribute float lit;
    attribute vec3 tint;
    varying float vLit;
    varying vec3 vTint;
    void main() {
      vLit = lit;
      vTint = tint;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;

  const LINE_FRAGMENT = `
    varying float vLit;
    varying vec3 vTint;
    void main() {
      gl_FragColor = vec4(mix(vec3(0.55, 0.6, 0.85), vTint, vLit), mix(0.13, 0.6, vLit));
    }`;

  function makeStarMaterial() {
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: STAR_VERTEX,
      fragmentShader: STAR_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }

  function buildSkyDome(mood) {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTop: { value: new THREE.Color(mood.top) },
        uMid: { value: new THREE.Color(mood.mid) },
        uHorizon: { value: new THREE.Color(mood.horizon) }
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uHorizon;
        varying vec3 vDir;
        void main() {
          float h = normalize(vDir).y;
          vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.28, h));
          col = mix(col, uTop, smoothstep(0.28, 0.95, h));
          col = mix(col, uTop * 0.55, smoothstep(0.0, -0.45, h));
          gl_FragColor = vec4(col, 1.0);
        }`,
      side: THREE.BackSide,
      depthWrite: false
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 20), material);
    dome.renderOrder = -2;
    return dome;
  }

  function buildBackgroundStars() {
    const count = window.innerWidth * window.innerHeight > 900000 ? 7000 : 5200;
    const hazeCount = 700;
    const total = count + hazeCount;
    const positions = new Float32Array(total * 3);
    const sizes = new Float32Array(total);
    const seeds = new Float32Array(total);
    const alphas = new Float32Array(total);
    const tints = new Float32Array(total * 3);
    const random = seededRandom(7);
    // The band of the galaxy: a tilted great circle that a third of the
    // stars and all of the haze crowd around.
    const normal = new THREE.Vector3(0.35, 0.86, 0.37).normalize();
    const e1 = new THREE.Vector3(1, 0, 0).cross(normal).normalize();
    const e2 = normal.clone().cross(e1).normalize();
    const v = new THREE.Vector3();
    const gauss = () => (random() + random() + random() - 1.5) / 1.5;
    for (let i = 0; i < total; i++) {
      const haze = i >= count;
      if (haze || random() < 0.34) {
        const theta = random() * Math.PI * 2;
        v.copy(e1).multiplyScalar(Math.cos(theta)).addScaledVector(e2, Math.sin(theta))
          .addScaledVector(normal, gauss() * (haze ? 0.16 : 0.12)).normalize();
      } else {
        const z = random() * 2 - 1;
        const phi = random() * Math.PI * 2;
        const r = Math.sqrt(1 - z * z);
        v.set(r * Math.cos(phi), z, r * Math.sin(phi));
      }
      v.multiplyScalar(SKY_RADIUS * 1.3);
      positions.set([v.x, v.y, v.z], i * 3);
      seeds[i] = random();
      if (haze) {
        sizes[i] = 18 + random() * 26;
        alphas[i] = 0.022 + random() * 0.02;
        const warm = random();
        tints.set([0.55 + 0.25 * warm, 0.5 + 0.1 * warm, 0.95 - 0.2 * warm], i * 3);
      } else {
        sizes[i] = 0.9 + 3.2 * Math.pow(random(), 7);
        alphas[i] = 0.45 + 0.55 * random();
        const t = random();
        tints.set(t < 0.15 ? [1, 0.86, 0.72] : t < 0.4 ? [0.78, 0.86, 1] : [1, 1, 1], i * 3);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute("tint", new THREE.BufferAttribute(tints, 3));
    const points = new THREE.Points(geometry, makeStarMaterial());
    points.renderOrder = -1;
    return points;
  }

  function buildGrimoireStars() {
    const n = STARS.length;
    const positions = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const seeds = new Float32Array(n);
    const lit = new Float32Array(n);
    const flare = new Float32Array(n).fill(-100);
    const tints = new Float32Array(n * 3);
    const color = new THREE.Color();
    STARS.forEach((star, i) => {
      positions.set(star.dir.map((c) => c * SKY_RADIUS), i * 3);
      sizes[i] = star.size;
      seeds[i] = (hashString(star.card.slug) % 1000) / 1000;
      const isMajor = star.card.arcana === "Major Arcana";
      color.set(isMajor ? "#ffe2a0" : PLACES[star.key].tint);
      tints.set([color.r, color.g, color.b], i * 3);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
    litAttr = new THREE.BufferAttribute(lit, 1);
    flareAttr = new THREE.BufferAttribute(flare, 1);
    geometry.setAttribute("lit", litAttr);
    geometry.setAttribute("flare", flareAttr);
    geometry.setAttribute("tint", new THREE.BufferAttribute(tints, 3));
    const points = new THREE.Points(geometry, new THREE.ShaderMaterial({
      uniforms,
      vertexShader: GRIMOIRE_VERTEX,
      fragmentShader: GRIMOIRE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));

    const links = Object.values(PLACES).flatMap((place) => place.links);
    const linePositions = new Float32Array(links.length * 6);
    const lineTints = new Float32Array(links.length * 6);
    links.forEach(([a, b], i) => {
      linePositions.set(STARS[a].dir.map((c) => c * SKY_RADIUS), i * 6);
      linePositions.set(STARS[b].dir.map((c) => c * SKY_RADIUS), i * 6 + 3);
      color.set(PLACES[STARS[a].key].tint);
      lineTints.set([color.r, color.g, color.b, color.r, color.g, color.b], i * 6);
    });
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineLitAttr = new THREE.BufferAttribute(new Float32Array(links.length * 2), 1);
    lineGeometry.setAttribute("lit", lineLitAttr);
    lineGeometry.setAttribute("tint", new THREE.BufferAttribute(lineTints, 3));
    lineGeometry.userData.links = links;
    const lines = new THREE.LineSegments(lineGeometry, new THREE.ShaderMaterial({
      vertexShader: LINE_VERTEX,
      fragmentShader: LINE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    return { points, lines };
  }

  let lineLinks = [];

  function refreshLitStars() {
    if (!litAttr) return;
    STARS.forEach((star, i) => {
      litAttr.array[i] = grimoire[star.card.slug] ? 1 : 0;
    });
    litAttr.needsUpdate = true;
    lineLinks.forEach(([a, b], i) => {
      lineLitAttr.array[i * 2] = litAttr.array[a];
      lineLitAttr.array[i * 2 + 1] = litAttr.array[b];
    });
    lineLitAttr.needsUpdate = true;
  }

  function flareStar(star) {
    if (!flareAttr) return;
    flareAttr.array[star.index] = clock();
    flareAttr.needsUpdate = true;
  }

  function buildMoon(info) {
    const group = new THREE.Group();
    const dir = directionFor(15, 25);
    const position = new THREE.Vector3(...dir).multiplyScalar(SKY_RADIUS * 0.95);
    const disc = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.ShaderMaterial({
      uniforms: { uPhase: { value: info.elongation * DEG } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform float uPhase;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r2 = dot(p, p);
          if (r2 > 1.0) discard;
          vec3 n = vec3(p, sqrt(1.0 - r2));
          vec3 sun = vec3(sin(uPhase), 0.0, -cos(uPhase));
          float lit = smoothstep(-0.05, 0.07, dot(n, sun));
          float maria = 1.0 + 0.03 * sin(p.x * 6.3 + 1.7) * sin(p.y * 5.1 + 0.6)
                      - 0.09 * smoothstep(0.34, 0.05, length(p - vec2(-0.28, 0.22)))
                      - 0.06 * smoothstep(0.26, 0.04, length(p - vec2(0.2, -0.1)))
                      - 0.05 * smoothstep(0.2, 0.03, length(p - vec2(0.05, 0.42)));
          float limb = 0.86 + 0.14 * n.z;
          vec3 litColor = vec3(1.0, 0.97, 0.9) * maria * limb;
          vec3 earthshine = vec3(0.06, 0.07, 0.12) * limb;
          float edge = smoothstep(1.0, 0.95, r2);
          gl_FragColor = vec4(mix(earthshine, litColor, lit), edge);
        }`,
      transparent: true,
      depthWrite: false
    }));
    disc.position.copy(position);
    disc.lookAt(0, 0, 0);
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.ShaderMaterial({
      uniforms: { uStrength: { value: 0.18 + 0.62 * info.illumination } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform float uStrength;
        varying vec2 vUv;
        void main() {
          float d = length(vUv * 2.0 - 1.0);
          float a = exp(-d * d * 9.0) * uStrength;
          gl_FragColor = vec4(vec3(0.85, 0.82, 1.0), a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    halo.position.copy(position).multiplyScalar(1.01);
    halo.lookAt(0, 0, 0);
    group.add(halo, disc);
    return group;
  }

  function initSky(info, mood) {
    if (typeof THREE === "undefined") throw new Error("three.js missing");
    renderer = new THREE.WebGLRenderer({ canvas: $("sky"), antialias: false, powerPreference: "high-performance" });
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    uniforms.uPx.value = pixelRatio;
    uniforms.uStarAlpha.value = mood.stars;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(cam.fov, window.innerWidth / window.innerHeight, 1, 1000);
    camera.rotation.order = "YXZ";
    const grimoireStars = buildGrimoireStars();
    lineLinks = grimoireStars.lines.geometry.userData.links;
    scene.add(buildSkyDome(mood), buildBackgroundStars(), buildMoon(info), grimoireStars.lines, grimoireStars.points);
    refreshLitStars();
    $("sky").addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      document.body.classList.add("no-webgl");
    });
  }

  function flyTo(target, ms) {
    if (cam.tween) cam.tween.resolve();
    if (reduceMotion || !ms) {
      Object.assign(cam, target, { tween: null });
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const shortestYaw = (((target.yaw - cam.yaw) % 360) + 540) % 360 - 180;
      cam.tween = {
        from: { yaw: cam.yaw, pitch: cam.pitch, fov: cam.fov },
        delta: { yaw: shortestYaw, pitch: target.pitch - cam.pitch, fov: target.fov - cam.fov },
        start: performance.now(),
        ms,
        resolve
      };
    });
  }

  function stepCamera(nowMs) {
    const tween = cam.tween;
    if (tween) {
      const t = Math.min((nowMs - tween.start) / tween.ms, 1);
      const e = easeInOutCubic(t);
      cam.yaw = tween.from.yaw + tween.delta.yaw * e;
      cam.pitch = tween.from.pitch + tween.delta.pitch * e;
      cam.fov = tween.from.fov + tween.delta.fov * e;
      if (t >= 1) {
        cam.tween = null;
        tween.resolve();
      }
    }
    parallax.x += (parallax.tx - parallax.x) * 0.06;
    parallax.y += (parallax.ty - parallax.y) * 0.06;
    if (!camera) return;
    // A slow drift, so the sky is never quite still.
    const drift = Math.sin(nowMs / 23000) * 0.6;
    camera.rotation.set((cam.pitch + parallax.y) * DEG, -(cam.yaw + parallax.x + drift) * DEG, 0);
    if (Math.abs(camera.fov - cam.fov) > 0.01) {
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
    }
  }

  const projected = new (typeof THREE !== "undefined" ? THREE.Vector3 : Object)();

  function toScreen(dir) {
    if (!camera) return { x: window.innerWidth / 2, y: window.innerHeight * 0.18, visible: true };
    camera.updateMatrixWorld();
    projected.set(dir[0], dir[1], dir[2]).multiplyScalar(SKY_RADIUS).project(camera);
    return {
      x: ((projected.x + 1) / 2) * window.innerWidth,
      y: ((1 - projected.y) / 2) * window.innerHeight,
      visible: projected.z < 1 && Math.abs(projected.x) < 1.1 && Math.abs(projected.y) < 1.1
    };
  }

  let frameSamples = 0;
  let frameTotal = 0;
  let lastFrame = 0;

  function frame(nowMs) {
    rafId = requestAnimationFrame(frame);
    uniforms.uTime.value = nowMs / 1000;
    stepCamera(nowMs);
    document.body.style.setProperty("--px", parallax.x.toFixed(3));
    document.body.style.setProperty("--py", parallax.y.toFixed(3));
    if (view === "sky") positionStarLabels();
    if (renderer) {
      renderer.render(scene, camera);
      // Adaptive quality: a phone that can't hold ~45fps over the first
      // couple of seconds drops to a 1x pixel ratio.
      if (lastFrame && frameSamples < 120) {
        frameTotal += nowMs - lastFrame;
        frameSamples++;
        if (frameSamples === 120 && frameTotal / 120 > 22 && pixelRatio > 1) {
          pixelRatio = 1;
          renderer.setPixelRatio(1);
          renderer.setSize(window.innerWidth, window.innerHeight, false);
          uniforms.uPx.value = 1;
        }
      }
      lastFrame = nowMs;
    }
  }

  function startLoop() {
    if (rafId === null) rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    lastFrame = 0;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLoop();
      if (sound.ctx) sound.ctx.suspend();
    } else {
      startLoop();
      if (sound.ctx && sound.on) sound.ctx.resume();
    }
  });

  window.addEventListener("resize", () => {
    if (renderer) {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    const target = view === "place" && currentPlace ? placeCamera(currentPlace)
      : view === "sky" ? skyCamera(skyTab) : hubCamera();
    flyTo(target, 0);
    sizeFx();
  });

  // Parallax: the pointer on desktop; the phone's tilt where the browser
  // gives it without a permission prompt.
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    parallax.tx = (event.clientX / window.innerWidth - 0.5) * 3;
    parallax.ty = -(event.clientY / window.innerHeight - 0.5) * 2;
  });
  if (!reduceMotion && typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission !== "function") {
    let base = null;
    window.addEventListener("deviceorientation", (event) => {
      if (event.beta === null || event.gamma === null) return;
      if (!base) base = { beta: event.beta, gamma: event.gamma };
      parallax.tx = Math.max(-3, Math.min(3, (event.gamma - base.gamma) * 0.12));
      parallax.ty = Math.max(-2, Math.min(2, -(event.beta - base.beta) * 0.08));
    });
  }

  // ---- Effects layer: bursts and the spark that flies to a star ----

  const fxCanvas = $("fx");
  const fx = fxCanvas.getContext("2d");
  const particles = [];
  const sparks = [];
  let fxRunning = false;

  function sizeFx() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    fxCanvas.width = window.innerWidth * ratio;
    fxCanvas.height = window.innerHeight * ratio;
    fx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  sizeFx();

  function burst(x, y, color, count) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 220;
      particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 40,
        life: 0.9 + Math.random() * 0.9,
        age: 0,
        size: 1 + Math.random() * 2.4,
        color
      });
    }
    runFx();
  }

  function flySpark(from, to, color, ms) {
    if (reduceMotion) return Promise.resolve();
    return new Promise((resolve) => {
      const side = to.x > from.x ? 1 : -1;
      sparks.push({
        from, to, color, ms, start: performance.now(), resolve,
        control: { x: (from.x + to.x) / 2 - side * 90, y: Math.min(from.y, to.y) - 60 }
      });
      runFx();
    });
  }

  function runFx() {
    if (fxRunning) return;
    fxRunning = true;
    let last = performance.now();
    const step = (nowMs) => {
      const dt = Math.min((nowMs - last) / 1000, 0.05);
      last = nowMs;
      fx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      fx.globalCompositeOperation = "lighter";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        const t = Math.min((nowMs - s.start) / s.ms, 1);
        const e = easeInOutCubic(t);
        const u = 1 - e;
        const x = u * u * s.from.x + 2 * u * e * s.control.x + e * e * s.to.x;
        const y = u * u * s.from.y + 2 * u * e * s.control.y + e * e * s.to.y;
        particles.push({ x, y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, life: 0.5, age: 0, size: 1.6, color: s.color });
        const glow = fx.createRadialGradient(x, y, 0, x, y, 14);
        glow.addColorStop(0, "#ffffff");
        glow.addColorStop(0.25, s.color);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        fx.fillStyle = glow;
        fx.fillRect(x - 14, y - 14, 28, 28);
        if (t >= 1) {
          sparks.splice(i, 1);
          s.resolve();
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life) {
          particles.splice(i, 1);
          continue;
        }
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 - 12 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        fx.globalAlpha = 1 - p.age / p.life;
        fx.fillStyle = p.color;
        fx.beginPath();
        fx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fx.fill();
      }
      fx.globalAlpha = 1;
      if (particles.length || sparks.length) {
        requestAnimationFrame(step);
      } else {
        fx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        fxRunning = false;
      }
    };
    requestAnimationFrame(step);
  }

  // ---- Sound: a generated drone and chimes, off until asked for ----

  const sound = { ctx: null, master: null, on: load("sanctumSound", false) };
  const CHIMES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

  function ensureAudio() {
    if (sound.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    filter.connect(master);
    [[110, 0.5], [110.7, 0.4], [164.8, 0.18], [55, 0.3]].forEach(([freq, gain]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = freq;
      g.gain.value = gain;
      osc.connect(g).connect(filter);
      osc.start();
    });
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    sound.ctx = ctx;
    sound.master = master;
  }

  function setSound(on) {
    sound.on = on;
    save("sanctumSound", on);
    const btn = $("soundBtn");
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
    if (!on && !sound.ctx) return;
    ensureAudio();
    if (!sound.ctx) return;
    sound.ctx.resume();
    sound.master.gain.setTargetAtTime(on ? 0.11 : 0, sound.ctx.currentTime, 0.7);
  }

  // Sound left on from an earlier visit can only start after a gesture.
  window.addEventListener("pointerdown", () => {
    if (sound.on && sound.ctx) sound.ctx.resume();
  }, { once: true });

  function chime(step, volume = 0.16, duration = 2.2) {
    if (!sound.on || !sound.ctx) return;
    const ctx = sound.ctx;
    const t = ctx.currentTime;
    const freq = CHIMES[Math.max(0, Math.min(CHIMES.length - 1, step))];
    [[freq, "triangle", volume], [freq * 2, "sine", volume * 0.35]].forEach(([f, type, v]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration + 0.1);
    });
  }

  // ---- Views ----

  let view = "intro";
  let currentPlace = null;
  let skyTab = "tarot";
  const viewEls = { hub: $("hub"), place: $("place"), sky: $("skyView") };

  function setView(next) {
    view = next;
    document.body.classList.remove("view-intro", "view-hub", "view-place", "view-sky");
    document.body.classList.add(`view-${next}`);
    Object.entries(viewEls).forEach(([key, el]) => {
      el.hidden = false;
      el.inert = key !== next;
    });
  }

  function moonIconPath(info) {
    const r = 8;
    const rx = r * Math.abs(Math.cos(info.elongation * DEG));
    const crescent = info.illumination < 0.5;
    if (info.waxing) {
      return `M0,${-r} A${r},${r} 0 0 1 0,${r} A${rx},${r} 0 0 ${crescent ? 0 : 1} 0,${-r}Z`;
    }
    return `M0,${-r} A${r},${r} 0 0 0 0,${r} A${rx},${r} 0 0 ${crescent ? 1 : 0} 0,${-r}Z`;
  }

  function renderMoonChip(info) {
    const pct = Math.round(info.illumination * 100);
    $("moonIcon").innerHTML = `<circle r="8" class="moon-dark"/><path d="${moonIconPath(info)}" class="moon-lit"/>`;
    $("moonLabel").textContent = `${info.name} · ${pct}%`;
    $("moonCardTitle").textContent = `${info.name}, ${pct}% lit`;
    $("moonCardBlurb").textContent = info.blurb;
    const fmt = (date) => date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const days = (date) => Math.max(0, Math.round((date - now) / 86400000));
    const full = nextMoonAt(180, now);
    const fresh = nextMoonAt(0, now);
    const parts = [];
    if (full) parts.push(`Full moon ${fmt(full)} (in ${days(full)} days)`);
    if (fresh) parts.push(`New moon ${fmt(fresh)} (in ${days(fresh)} days)`);
    $("moonCardNext").textContent = parts.join(" · ");
  }

  function renderPortalMap(svg, key) {
    const place = PLACES[key];
    svg.innerHTML = place.layoutStars.map((star, i) => {
      const lit = grimoire[place.deck.cards[i].slug];
      return `<circle cx="${star.u.toFixed(2)}" cy="${(-star.v).toFixed(2)}" r="${lit ? 0.75 : 0.42}" class="${lit ? "is-lit" : ""}"/>`;
    }).join("");
  }

  function renderHub() {
    const mood = skyMood(new Date());
    $("greeting").textContent = `${mood.greeting} · night ${nights.count} under this sky`;
    document.querySelectorAll(".portal[data-place]").forEach((portal) => {
      const key = portal.dataset.place;
      const met = metCount(key);
      const total = PLACES[key].deck.cards.length;
      portal.querySelector(".portal-count").textContent = `${met} / ${total} stars`;
      portal.querySelector(".portal-ring-fill").style.strokeDashoffset = String(116.24 * (1 - met / total));
      renderPortalMap(portal.querySelector(".portal-map"), key);
    });
    const revealed = dailyRevealed();
    const mini = $("altarMini");
    mini.classList.toggle("is-revealed", Boolean(revealed));
    if (revealed) {
      const { card, reversed } = dailyPick();
      mini.innerHTML = `<span class="mini-name">${card.name}</span>`;
      mini.style.setProperty("--tone", toneFor(card));
      $("altarLabel").textContent = `Tonight: ${card.name}${reversed ? ", reversed" : ""}`;
    } else {
      mini.innerHTML = "";
      $("altarLabel").textContent = "Tonight's card · tap to turn it";
    }
    $("offering").hidden = !(offering && offering.date === todayKey && !offering.opened);
  }

  async function goHub() {
    if (busy) return;
    setView("hub");
    renderHub();
    await flyTo(hubCamera(), 1500);
  }

  // ---- Cards ----

  function toneFor(card) {
    if (card.arcana === "Major Arcana") return "#ffd98a";
    const suitTones = { Wands: "#ff9f5a", Cups: "#7cc0ff", Swords: "#d6ddff", Pentacles: "#97e08f" };
    const suit = Object.keys(suitTones).find((s) => card.name.endsWith(`of ${s}`));
    if (suit) return suitTones[suit];
    return lighten(card.color || "#c9a6ff", 0.35);
  }

  function isMajorCard(card) {
    return card.arcana === "Major Arcana" || card.arcana === "Custom Arcana" || card.type === "Initiations";
  }

  // Each card's "art" is its own small constellation, drawn from its name,
  // so a card and its star in the sky share one figure.
  function cardArt(card) {
    const random = seededRandom(hashString(card.slug));
    const major = isMajorCard(card);
    const count = major ? 8 : 6;
    const points = [];
    while (points.length < count) {
      const a = random() * Math.PI * 2;
      const r = 8 + random() * 26;
      const p = { x: Math.cos(a) * r, y: Math.sin(a) * r };
      if (points.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 11)) points.push(p);
    }
    // Chain them nearest-first into a figure.
    const order = [points.shift()];
    while (points.length) {
      const last = order[order.length - 1];
      points.sort((p, q) => Math.hypot(p.x - last.x, p.y - last.y) - Math.hypot(q.x - last.x, q.y - last.y));
      order.push(points.shift());
    }
    const path = order.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const ticks = major
      ? Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const r1 = i % 2 ? 43 : 41;
        return `<line x1="${(Math.cos(a) * r1).toFixed(1)}" y1="${(Math.sin(a) * r1).toFixed(1)}" x2="${(Math.cos(a) * 45).toFixed(1)}" y2="${(Math.sin(a) * 45).toFixed(1)}"/>`;
      }).join("")
      : "";
    const stars = order.map((p, i) => `<circle class="art-star" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${i === 0 ? 2.6 : 1.6}"/>`).join("");
    return `<svg class="cf-art" viewBox="-50 -50 100 100" aria-hidden="true">
      <circle class="art-ring" r="${major ? 38 : 40}"/>${major ? '<circle class="art-ring art-ring-inner" r="34"/>' : ""}
      <g class="art-ticks">${ticks}</g>
      <path class="art-line" d="${path}"/>${stars}
    </svg>`;
  }

  function cardLabel(card) {
    if (card.arcana === "Major Arcana") return `Major Arcana · ${card.numeral}`;
    if (card.arcana === "Minor Arcana") return `${card.name.split(" of ")[1]} · ${card.numeral}`;
    if (card.arcana === "Archetypes") return card.type;
    return card.arcana === "Custom Arcana" ? "Oracle · Symbol" : `Oracle · ${card.type}`;
  }

  function renderFront(card, reversed) {
    const front = $("cardFront");
    front.classList.toggle("is-reversed", reversed);
    front.innerHTML = `
      <p class="cf-label">${cardLabel(card)}</p>
      ${cardArt(card)}
      <p class="cf-name">${card.name}</p>
      <p class="cf-orient">${reversed ? "Reversed" : ""}</p>`;
  }

  let busy = false;
  let skipping = false;
  let beatTimer = null;
  let beatResolve = null;

  function beat(ms) {
    if (skipping || reduceMotion) return Promise.resolve();
    return new Promise((resolve) => {
      beatResolve = resolve;
      beatTimer = setTimeout(() => {
        beatResolve = null;
        resolve();
      }, ms);
    });
  }

  function skipRitual() {
    if (!busy || !load("sanctumSeenRitual", false)) return;
    skipping = true;
    $("card").classList.add("is-instant");
    if (beatResolve) {
      clearTimeout(beatTimer);
      const resolve = beatResolve;
      beatResolve = null;
      resolve();
    }
  }

  function drawFrom(key) {
    const place = PLACES[key];
    const cards = place.deck.cards;
    const card = cards[Math.floor(Math.random() * cards.length)];
    return { card, reversed: Boolean(place.reversible) && Math.random() < 0.35 };
  }

  // The reveal, beat by beat: invitation, tell, turn, bloom, settle.
  async function revealCard({ card, reversed }, { daily = false, quiet = false } = {}) {
    busy = true;
    skipping = quiet;
    const cardEl = $("card");
    const reading = $("reading");
    const star = STAR_BY_SLUG[card.slug];
    const major = isMajorCard(card);
    const tone = toneFor(card);

    if (cardEl.classList.contains("is-face-up")) {
      cardEl.classList.add("is-leaving");
      reading.classList.remove("is-shown");
      await wait(skipping ? 0 : 320);
    }
    cardEl.className = "card3d";
    cardEl.classList.toggle("is-instant", skipping);
    $("stage").classList.add("has-card");
    cardEl.style.setProperty("--tone", tone);
    renderFront(card, reversed);
    $("placeHint").textContent = "";
    void cardEl.offsetWidth;

    // 1. Invitation: the room dims and the card lifts off the deck.
    document.body.classList.add("is-drawing");
    uniforms.uFocus.value = 1;
    chime(0, 0.08, 3);
    cardEl.classList.add("is-lifting");
    await beat(480);

    // 2. The tell: a glow in the card's colour, stronger for a Major.
    cardEl.classList.add("is-telling");
    if (major) {
      cardEl.classList.add("is-major");
      document.body.classList.add("is-major-tell");
      chime(1, 0.1, 3);
    }
    await beat(major ? 1000 : 650);

    // 3. The turn, pausing for a breath edge-on.
    cardEl.classList.add("is-turning");
    await beat(major ? 1050 : 800);
    cardEl.classList.add("is-face-up");
    document.body.classList.remove("is-major-tell");

    // 4. The bloom, and its star lights up overhead.
    const first = !grimoire[card.slug];
    if (!quiet) {
      const record = grimoire[card.slug] || { n: 0, first: todayKey };
      record.n += 1;
      grimoire[card.slug] = record;
      save("sanctumGrimoire", grimoire);
    }
    const rect = cardEl.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.42 };
    if (!skipping) {
      burst(center.x, center.y, tone, major ? 110 : 60);
      chime(major ? 5 : 3);
    }
    if (star && !quiet) {
      const target = toScreen(star.dir);
      if (!skipping) await flySpark(center, target, tone, first ? 1000 : 750);
      flareStar(star);
      refreshLitStars();
      if (!skipping) chime(first ? 4 : 2, 0.12);
    }

    // 5. Settle: the card makes room and the reading arrives line by line.
    cardEl.classList.add("is-settled");
    fillReading(card, reversed, { daily, first: first && !quiet });
    reading.classList.add("is-shown");
    document.body.classList.remove("is-drawing");
    uniforms.uFocus.value = 0;
    updatePlaceCount();
    $("placeHint").textContent = daily ? "" : "Tap again to draw another";
    if (daily) save("sanctumDaily", { date: todayKey, slug: card.slug, reversed });
    save("sanctumSeenRitual", true);
    cardEl.classList.remove("is-instant");
    skipping = false;
    busy = false;
  }

  function fillReading(card, reversed, { daily, first }) {
    const key = STAR_BY_SLUG[card.slug].key;
    const place = PLACES[key];
    $("rKicker").textContent = daily ? "Tonight's card" : cardLabel(card);
    $("rName").textContent = card.name;
    let orient = "";
    let meaning = card.meaning || "";
    if (card.meanings) {
      orient = reversed ? "Reversed" : "Upright";
      meaning = card.meanings[reversed ? 1 : 0];
    } else if (card.subtitle) {
      orient = card.subtitle;
    }
    $("rOrient").textContent = orient;
    $("rMeaning").textContent = meaning;
    const record = grimoire[card.slug];
    const met = metCount(key);
    const total = place.deck.cards.length;
    if (first) {
      $("rGrimoire").textContent = `✦ First meeting. A new star in your ${place.name}: ${met} of ${total}.`;
    } else if (record) {
      const firstDate = new Date(`${record.first}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      $("rGrimoire").textContent = `Met ${record.n} ${record.n === 1 ? "time" : "times"} · first on ${firstDate}`;
    } else {
      $("rGrimoire").textContent = "";
    }
  }

  function updatePlaceCount() {
    if (!currentPlace) return;
    $("placeCount").textContent = `${metCount(currentPlace)} / ${PLACES[currentPlace].deck.cards.length}`;
  }

  async function openPlace(key, { daily = false } = {}) {
    if (busy) return;
    currentPlace = key;
    $("placeName").textContent = daily ? "Tonight's card" : PLACES[key].name;
    updatePlaceCount();
    const cardEl = $("card");
    cardEl.className = "card3d";
    $("stage").classList.remove("has-card");
    $("reading").classList.remove("is-shown");
    $("placeHint").textContent = daily ? "" : "Tap the deck to draw";
    setView("place");
    chime(2, 0.06, 3);
    await flyTo(placeCamera(key), 1700);
    if (daily) {
      const pick = dailyPick();
      await revealCard(pick, { daily: true, quiet: dailyRevealed() });
    }
  }

  // ---- Your sky ----

  let labelEls = [];

  function buildStarLabels(key) {
    const container = $("starLabels");
    container.innerHTML = "";
    labelEls = STARS.filter((star) => star.key === key && grimoire[star.card.slug]).map((star) => {
      const el = document.createElement("span");
      el.className = "star-label";
      el.textContent = star.card.name;
      container.appendChild(el);
      return { el, star };
    });
  }

  function positionStarLabels() {
    labelEls.forEach(({ el, star }) => {
      const p = toScreen(star.dir);
      // Near the right edge the name hangs to the star's left instead.
      const flip = p.x > window.innerWidth * 0.62;
      el.classList.toggle("is-left", flip);
      el.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)${flip ? " translateX(-100%)" : ""}`;
      el.style.opacity = p.visible ? "" : "0";
    });
  }

  async function selectSkyTab(key) {
    skyTab = key;
    document.querySelectorAll("[data-sky-tab]").forEach((tab) => {
      tab.setAttribute("aria-selected", String(tab.dataset.skyTab === key));
    });
    buildStarLabels(key);
    await flyTo(skyCamera(key), 1500);
  }

  function openSky() {
    if (busy) return;
    const lit = totalMet();
    $("skySummary").textContent = lit
      ? `${lit} ${lit === 1 ? "star" : "stars"} lit across ${nights.count} ${nights.count === 1 ? "night" : "nights"}`
      : "No stars lit yet. Every card you meet becomes one.";
    setView("sky");
    selectSkyTab(currentPlace || skyTab);
  }

  // ---- Arrival ----

  async function runIntro(info) {
    const shortIntro = load("sanctumIntro", "") === todayKey;
    $("introPhase").textContent = `${info.name} · ${Math.round(info.illumination * 100)}% lit`;
    const intro = $("intro");
    let entered = false;
    const enter = () => {
      if (entered) return;
      entered = true;
      save("sanctumIntro", todayKey);
      intro.classList.add("is-leaving");
      setTimeout(() => intro.remove(), 900);
      setView("hub");
      renderHub();
      if (cam.tween) flyTo(hubCamera(), 900);
    };
    intro.addEventListener("click", enter);
    window.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") enter();
    }, { once: true });
    const lines = intro.querySelectorAll(".intro-line");
    flyTo(hubCamera(), shortIntro ? 1600 : 4600);
    if (shortIntro || reduceMotion) {
      lines.forEach((line) => line.classList.add("is-on"));
      await wait(reduceMotion ? 300 : 1400);
      enter();
      return;
    }
    const times = [500, 1500, 2900, 4300];
    for (let i = 0; i < lines.length && !entered; i++) {
      await wait(i ? times[i] - times[i - 1] : times[0]);
      lines[i].classList.add("is-on");
      if (i === 2) chime(2, 0.08, 4);
    }
  }

  // ---- Wiring ----

  document.querySelectorAll(".portal[data-place]").forEach((portal) => {
    portal.addEventListener("click", () => openPlace(portal.dataset.place));
  });
  $("askBallPortal").addEventListener("click", () => {
    try {
      localStorage.setItem("tarotPullDeck", "dice");
    } catch (err) {
      // The link still opens the app, just on its last deck.
    }
  });
  $("altarCard").addEventListener("click", () => openPlace("tarot", { daily: true }));
  $("stage").addEventListener("click", () => {
    if (busy) {
      skipRitual();
      return;
    }
    if (view === "place" && !$("placeName").textContent.startsWith("Tonight")) revealCard(drawFrom(currentPlace));
  });
  document.querySelectorAll("[data-back]").forEach((btn) => btn.addEventListener("click", goHub));
  document.querySelectorAll("[data-sky-tab]").forEach((tab) => {
    tab.addEventListener("click", () => selectSkyTab(tab.dataset.skyTab));
  });
  $("skyBtn").addEventListener("click", () => (view === "sky" ? goHub() : openSky()));
  $("soundBtn").addEventListener("click", () => setSound(!sound.on));
  $("moonChip").addEventListener("click", (event) => {
    event.stopPropagation();
    const card = $("moonCard");
    card.hidden = !card.hidden;
    $("moonChip").setAttribute("aria-expanded", String(!card.hidden));
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#moonCard, #moonChip")) {
      $("moonCard").hidden = true;
      $("moonChip").setAttribute("aria-expanded", "false");
    }
  });
  $("offering").addEventListener("click", () => {
    $("slipText").textContent = offering.text;
    $("slip").hidden = false;
    chime(4, 0.1, 3);
  });
  $("slipClose").addEventListener("click", () => {
    $("slip").hidden = true;
    offering.opened = true;
    save("sanctumOffering", offering);
    renderHub();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && (view === "place" || view === "sky")) goHub();
  });

  // ---- Boot ----

  const info = moonInfo(now);
  const mood = skyMood(now);
  renderMoonChip(info);
  setSound(sound.on);
  try {
    initSky(info, mood);
  } catch (err) {
    document.body.classList.add("no-webgl");
  }
  startLoop();
  setView("intro");
  runIntro(info);
})();
