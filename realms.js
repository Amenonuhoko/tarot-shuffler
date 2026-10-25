// ---- Realms ----
// Each theme besides Mystic Violet is its own mystical tradition: a
// painted scene (realms/<theme>-portrait|landscape.webp) whose light runs
// live on top in a WebGL pass and answers each reveal, plus pieces built
// around the card:
//
//   Holographic Foil  The Seven Rays: light falls through a prism into
//                     the seven rays of the Theosophists; each card's ray
//                     colours the light and is named on reveal.
//   Glitch Terminal   Digital geomancy and chaos: a phosphor temple of
//                     figures under the Lorenz and logistic equations, and
//                     each reveal runs a real geomantic cast, seeded by the
//                     logistic map, in the card's art window.
//   Blood Moon        The Crimson Cathedral: the card stands in a stone
//                     arch under the rose window, briars hold its corners,
//                     and light through the glass floods it on reveal.
//   Art Deco Luxe     The Temple of Ra: a gilded gateway under the sun,
//                     whose rays flare on reveal.
//
// Every theme also gets its own emblem on the card back. Only the active
// theme's realm exists in the page; the rest are built when chosen.
(function () {
  "use strict";

  const DEG = Math.PI / 180;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motif = document.querySelector(".mystic-motif");
  const cardSlot = document.getElementById("cardSlot");
  const cardBack = document.getElementById("cardBack");
  const cardArt = document.getElementById("cardArt");
  const cardTitle = document.getElementById("cardTitle");
  if (!motif || !cardSlot) {
    return;
  }

  // Behind the table, like the motif; and a front layer for the few
  // things that sit over the card's edges.
  const back = document.createElement("div");
  back.className = "realm";
  back.setAttribute("aria-hidden", "true");
  const front = document.createElement("div");
  front.className = "realm realm-front";
  front.setAttribute("aria-hidden", "true");
  motif.after(back);
  document.body.append(front);

  function hashString(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function restart(el, className) {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }

  // ---- Holographic Foil: the Seven Rays ----

  const SEVEN_RAYS = [
    { name: "Will and Power", color: "#ff4b4b" },
    { name: "Love-Wisdom", color: "#4b8bff" },
    { name: "Active Intelligence", color: "#3ee09a" },
    { name: "Harmony through Conflict", color: "#ffd84b" },
    { name: "Concrete Knowledge", color: "#ff9a3b" },
    { name: "Devotion", color: "#ff6fbf" },
    { name: "Ceremonial Order", color: "#a86bff" }
  ];
  const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

  // Suits by temperament: Wands will, Cups devotion, Swords concrete
  // mind, Pentacles ceremonial order (spirit made matter). Majors walk
  // the rays in turn; any other card by its name.
  function rayFor(card) {
    if (!card) return 0;
    if (card.arcana === "Major Arcana") {
      const index = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"].indexOf(card.numeral);
      return Math.max(0, index) % 7;
    }
    const suits = { Wands: 0, Cups: 5, Swords: 4, Pentacles: 6 };
    const suit = Object.keys(suits).find((s) => card.name.endsWith(`of ${s}`));
    if (suit) return suits[suit];
    return hashString(card.name) % 7;
  }

  function spectrumStops() {
    return SEVEN_RAYS.map((ray, i) => `<stop offset="${(i / 6).toFixed(3)}" stop-color="${ray.color}"/>`).join("");
  }

  function metatronSvg(id, size = 80) {
    const d = size * 0.375;
    const r = size * 0.1875;
    const centers = [[0, 0]];
    [d, 2 * d].forEach((dist) => {
      for (let i = 0; i < 6; i++) {
        const a = (i * 60 - 90) * DEG;
        centers.push([Math.cos(a) * dist, Math.sin(a) * dist]);
      }
    });
    const lines = [];
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        lines.push(`M${centers[i][0].toFixed(2)},${centers[i][1].toFixed(2)}L${centers[j][0].toFixed(2)},${centers[j][1].toFixed(2)}`);
      }
    }
    const circles = centers.map(([x, y]) => `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}"/>`).join("");
    const outer = 2 * d + r;
    return `<svg viewBox="${-size - 6} ${-size - 6} ${2 * size + 12} ${2 * size + 12}" fill="none" stroke="url(#${id})">
      <defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${-size}" y1="${-size}" x2="${size}" y2="${size}">${spectrumStops()}</linearGradient></defs>
      <circle r="${(outer + size * 0.04).toFixed(2)}" stroke-width="0.6"/>
      <circle r="${(outer + size * 0.09).toFixed(2)}" stroke-width="0.35" stroke-dasharray="0.6 2.4"/>
      <path d="${lines.join("")}" stroke-width="0.35"/>
      <g stroke-width="0.6">${circles}</g>
    </svg>`;
  }

  const holo = {
    build() {
      back.innerHTML = '<p class="holo-caption"></p>';
    },
    reveal({ card }) {
      if (!card) return;
      const index = rayFor(card);
      const ray = SEVEN_RAYS[index];
      const caption = back.querySelector(".holo-caption");
      caption.textContent = `Ray ${NUMERALS[index]} · ${ray.name}`;
      caption.style.color = ray.color;
      // The card's art window takes on its ray (see realms.css).
      cardSlot.style.setProperty("--ray", ray.color);
      light.surgeColor = hexToRgb(ray.color);
      restart(back, "is-dispersing");
    },
    unmount() {
      cardSlot.style.removeProperty("--ray");
    }
  };

  // ---- Glitch Terminal: digital geomancy and chaos ----

  // Rows top to bottom; 1 is a single dot, 0 a pair.
  const FIGURES = [
    ["VIA", 0b1111], ["POPVLVS", 0b0000], ["CONIVNCTIO", 0b0110], ["CARCER", 0b1001],
    ["FORTVNA MAIOR", 0b0011], ["FORTVNA MINOR", 0b1100], ["ACQVISITIO", 0b0101], ["AMISSIO", 0b1010],
    ["LAETITIA", 0b1000], ["TRISTITIA", 0b0001], ["PVELLA", 0b1011], ["PVER", 0b1101],
    ["ALBVS", 0b0010], ["RVBEVS", 0b0100], ["CAPVT DRACONIS", 0b0111], ["CAVDA DRACONIS", 0b1110]
  ];
  const FIGURE_BY_BITS = Object.fromEntries(FIGURES.map(([name, bits]) => [bits, name]));

  // A real shield chart: four mothers from the chaos, daughters by
  // transposing them, nieces, witnesses and the judge by adding pairs
  // (odd + odd is even: XOR, with a single dot as 1).
  function castShield(seedText) {
    const h = hashString(seedText);
    const r = 3.9 + (h % 1000) / 10000; // deep in the chaotic regime
    let x = 0.1 + ((h >>> 10) % 8000) / 10000;
    const bits = [];
    for (let i = 0; i < 64; i++) x = r * x * (1 - x); // shake off the seed
    for (let i = 0; i < 22; i++) {
      x = r * x * (1 - x);
      bits.push(x > 0.5 ? 1 : 0);
    }
    const mothers = [0, 1, 2, 3].map((m) => (bits[m * 4] << 3) | (bits[m * 4 + 1] << 2) | (bits[m * 4 + 2] << 1) | bits[m * 4 + 3]);
    const daughters = [0, 1, 2, 3].map((row) =>
      mothers.reduce((acc, mother, m) => acc | (((mother >> (3 - row)) & 1) << (3 - m)), 0)
    );
    const nieces = [mothers[0] ^ mothers[1], mothers[2] ^ mothers[3], daughters[0] ^ daughters[1], daughters[2] ^ daughters[3]];
    const witnesses = [nieces[0] ^ nieces[1], nieces[2] ^ nieces[3]];
    const judge = witnesses[0] ^ witnesses[1];
    const hexagram = bits.slice(16, 22);
    return { r, x0: 0.1 + ((h >>> 10) % 8000) / 10000, mothers, judge, hexagram };
  }

  function figureSvg(bits, className) {
    const dots = [];
    for (let row = 0; row < 4; row++) {
      const y = 12 + row * 25;
      const single = (bits >> (3 - row)) & 1;
      (single ? [50] : [32, 68]).forEach((x) => dots.push(`<circle cx="${x}" cy="${y}" r="6"/>`));
    }
    return `<svg class="${className}" viewBox="0 0 100 100">${dots.join("")}</svg>`;
  }

  function hexagramSvg(lines) {
    return `<svg class="geo-hexagram" viewBox="0 0 60 60">${lines.map((whole, row) => {
      const y = 4 + row * 9.4;
      return whole
        ? `<rect x="4" y="${y}" width="52" height="5"/>`
        : `<rect x="4" y="${y}" width="22" height="5"/><rect x="34" y="${y}" width="22" height="5"/>`;
    }).join("")}</svg>`;
  }

  const terminal = {
    build() {
      back.innerHTML = `
        <pre class="geo-eq geo-eq-lorenz">dx/dt = σ(y − x)
dy/dt = x(ρ − z) − y
dz/dt = xy − βz
σ=10  ρ=28  β=8/3</pre>
        <pre class="geo-eq geo-eq-logistic">xₙ₊₁ = r·xₙ(1 − xₙ)
δ = 4.669201609…</pre>`;
    },
    unmount() {
      clearTimeout(this.castTimer);
      clearInterval(this.scrambleTimer);
    },
    reveal({ card }) {
      if (!card || !geoScreen) return;
      const cast = castShield(card.name);
      const lines = [
        `> seed ← chaos  r=${cast.r.toFixed(4)}  x₀=${cast.x0.toFixed(4)}`,
        "> iterate xₙ₊₁ = r·xₙ(1−xₙ) ×64",
        `> mothers: ${cast.mothers.map((m) => FIGURE_BY_BITS[m]).join(" · ")}`,
        "> daughters → nieces → witnesses",
        `> IVDEX: ${FIGURE_BY_BITS[cast.judge]}`
      ];
      clearTimeout(this.castTimer);
      geoScreen.classList.remove("is-judged");
      geoScreen.innerHTML = '<pre class="geo-log"></pre>';
      const log = geoScreen.querySelector(".geo-log");
      const instant = reduceMotion.matches;
      let i = 0;
      const typeLine = () => {
        log.textContent += (i ? "\n" : "") + lines[i];
        i++;
        if (i < lines.length && !instant) {
          this.castTimer = setTimeout(typeLine, 300);
        } else {
          if (instant) log.textContent = lines.join("\n");
          this.castTimer = setTimeout(() => {
            geoScreen.innerHTML = `
              <p class="geo-head">┌ SCVTVM ┐</p>
              <div class="geo-mothers">${cast.mothers.map((m, k) =>
                `<span class="geo-mother">${figureSvg(m, "geo-mini")}<small>${["I", "II", "III", "IV"][k]}</small></span>`
              ).join("")}</div>
              ${figureSvg(cast.judge, "geo-judge")}
              <p class="geo-judge-name"><small>IVDEX</small>${FIGURE_BY_BITS[cast.judge]}</p>
              <div class="geo-foot">${hexagramSvg(cast.hexagram)}<code>${cast.hexagram.join("")}</code></div>`;
            geoScreen.classList.add("is-judged");
          }, instant ? 0 : 700);
        }
      };
      typeLine();
      this.decryptTitle();
    },
    // The name comes out of the noise letter by letter.
    decryptTitle() {
      if (!cardTitle || reduceMotion.matches) return;
      const finalText = cardTitle.textContent;
      const noise = "▓▒░#%&*+=<>/\\|01";
      const start = performance.now();
      const duration = 650;
      clearInterval(this.scrambleTimer);
      this.scrambleTimer = setInterval(() => {
        const t = Math.min((performance.now() - start) / duration, 1);
        const locked = Math.floor(finalText.length * t);
        cardTitle.textContent = finalText.split("").map((ch, k) =>
          k < locked || ch === " " ? ch : noise[Math.floor(Math.random() * noise.length)]
        ).join("");
        if (t >= 1) {
          clearInterval(this.scrambleTimer);
          cardTitle.textContent = finalText;
        }
      }, 40);
    }
  };

  // The cast plays in the card's own art window.
  let geoScreen = null;
  if (cardArt) {
    geoScreen = document.createElement("div");
    geoScreen.className = "geo-screen";
    geoScreen.setAttribute("aria-hidden", "true");
    cardArt.appendChild(geoScreen);
  }

  // ---- Blood Moon: the Crimson Cathedral ----

  // Mostly deep reds, with the blues and violets real rose windows set
  // among them.
  const GLASS = ["#6e0a18", "#8e0f1f", "#4a0612", "#a8162e", "#2e0510", "#5c0a1c", "#7d0d22", "#3a0814"];
  const JEWELS = ["#101a3d", "#2a1240", "#c99a3a", "#18234f"];

  function polar(r, a) {
    return [Math.cos((a - 90) * DEG) * r, Math.sin((a - 90) * DEG) * r];
  }

  function pt([x, y]) {
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }

  // A pointed (lancet) pane from radius r0 to a tip at r1, `half` degrees
  // either side of angle a.
  function lancet(r0, r1, a, half) {
    const shoulder = r0 + (r1 - r0) * 0.62;
    return `M${pt(polar(r0, a - half * 0.82))} L${pt(polar(shoulder, a - half))} Q${pt(polar(r1 - (r1 - r0) * 0.12, a - half * 0.55))} ${pt(polar(r1, a))} Q${pt(polar(r1 - (r1 - r0) * 0.12, a + half * 0.55))} ${pt(polar(shoulder, a + half))} L${pt(polar(r0, a + half * 0.82))} Z`;
  }

  function roseWindowSvg(id, detail = true) {
    const panes = [];
    const tracery = [];
    // Outer ring: twelve arches, each split by a mullion under a small
    // oculus, with jewel roundels between them.
    for (let i = 0; i < 12; i++) {
      const a = i * 30;
      panes.push(`<path d="${lancet(70, 90, a, 11.5)}" fill="${GLASS[i % GLASS.length]}"/>`);
      if (detail) {
        tracery.push(`M${pt(polar(70, a))} L${pt(polar(82, a))}`);
        const [ox, oy] = polar(84.5, a);
        panes.push(`<circle cx="${ox.toFixed(2)}" cy="${oy.toFixed(2)}" r="2.6" fill="${JEWELS[i % JEWELS.length]}"/>`);
        const [x, y] = polar(85, a + 15);
        panes.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.8" fill="${JEWELS[(i + 1) % JEWELS.length]}"/>`);
      }
    }
    // Middle ring: twelve long petals, each with an inner lancet and a
    // roundel between it and the next.
    for (let i = 0; i < 12; i++) {
      const a = i * 30 + 15;
      panes.push(`<path d="${lancet(32, 68, a, 10)}" fill="${GLASS[(i + 3) % GLASS.length]}"/>`);
      if (detail) {
        panes.push(`<path d="${lancet(40, 61, a, 5.2)}" fill="${i % 4 === 0 ? JEWELS[1] : GLASS[(i + 5) % GLASS.length]}"/>`);
        tracery.push(`M${pt(polar(32, a))} L${pt(polar(40, a))}`);
        const [x, y] = polar(62, a + 15);
        panes.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.4" fill="${i % 2 ? JEWELS[0] : GLASS[(i + 6) % GLASS.length]}"/>`);
      }
    }
    // A ring of small roundels just inside the frame.
    if (detail) {
      for (let i = 0; i < 36; i++) {
        const [x, y] = polar(93.5, i * 10 + 5);
        panes.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.5" fill="${i % 3 ? "#5c0a1c" : "#c99a3a"}"/>`);
      }
    }
    // The heart: eight petals round a quatrefoil.
    for (let i = 0; i < 8; i++) {
      panes.push(`<path d="${lancet(10, 29, i * 45, 17)}" fill="${GLASS[(i + 1) % GLASS.length]}"/>`);
    }
    // The heart of the window is the blood moon itself, half in shadow.
    const quatrefoil = `
      <circle r="9.4" fill="url(#${id}-moon)"/>
      <path d="M2.6,-8.9 A9.4,9.4 0 0 1 2.6,8.9 A7.2,9.4 0 0 0 2.6,-8.9 Z" fill="#1a0306" fill-opacity="0.55"/>
      <circle cx="-3" cy="-2.4" r="1.6" fill="#5a0a10" fill-opacity="0.6"/>
      <circle cx="1.2" cy="3.2" r="1.1" fill="#5a0a10" fill-opacity="0.5"/>`;
    return `<svg viewBox="-100 -100 200 200">
      <defs>
        <radialGradient id="${id}-moon" cx="0.4" cy="0.38"><stop offset="0" stop-color="#ff8a5a"/><stop offset="0.55" stop-color="#b3202a"/><stop offset="1" stop-color="#4a0610"/></radialGradient>
        <radialGradient id="${id}-light"><stop offset="0" stop-color="#fff2e0" stop-opacity="0.38"/><stop offset="0.45" stop-color="#ff6a5a" stop-opacity="0.12"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></radialGradient>
      </defs>
      <circle r="98" fill="#0b0305"/>
      <g class="rose-glass" stroke="#0d0204" stroke-width="1.6" stroke-linejoin="round" fill-opacity="0.9">
        ${panes.join("")}${quatrefoil}
      </g>
      <path d="${tracery.join("")}" stroke="#0d0204" stroke-width="1.4" fill="none"/>
      <circle r="97" fill="url(#${id}-light)"/>
      <g fill="none" stroke="#241a1c">
        <circle r="97" stroke-width="5"/><circle r="91" stroke-width="1.8"/>
        <circle r="70" stroke-width="2.2"/><circle r="31" stroke-width="2.2"/><circle r="10" stroke-width="1.6"/>
      </g>
    </svg>`;
  }

  // A thorned briar curling round one corner, with a dark rose.
  function briarSvg() {
    const thorns = [[16, 78, 200], [11, 60, 190], [12, 42, 170], [20, 28, 150], [33, 18, 125], [50, 12, 110], [68, 9, 100], [86, 7, 95]]
      .map(([x, y, a]) => `<path d="M0,0 L9,-2.6 L0,3 Z" transform="translate(${x} ${y}) rotate(${a})"/>`).join("");
    return `<svg viewBox="0 0 100 100" fill="none">
      <path d="M2,99 C8,80 6,64 12,48 C18,32 30,20 48,13 C64,8 82,7 99,5" stroke="#3a0d14" stroke-width="4.4" stroke-linecap="round"/>
      <path d="M12,48 C2,40 4,30 12,28" stroke="#3a0d14" stroke-width="2" stroke-linecap="round"/>
      <path d="M48,13 C44,4 52,0 58,3" stroke="#3a0d14" stroke-width="2" stroke-linecap="round"/>
      <g fill="#3a0d14">${thorns}</g>
      <g transform="translate(24 30)">
        <circle r="11" fill="#7a0b1c"/>
        <path d="M0,-6 C5,-6 7,-1 4,3 C1,6 -5,5 -6,0 C-6,-4 -2,-6 1,-4 C4,-2 3,2 0,2" stroke="#2a0409" stroke-width="1.3"/>
      </g>
      <path d="M33,23 C38,18 44,20 42,26 C38,27 35,26 33,23 Z" fill="#2c1012"/>
    </svg>`;
  }

  // A pointed stone arch the card stands in, like a lancet niche under
  // the rose window. Stretched to the card, so its strokes don't scale.
  function archSvg() {
    const outer = "M3,610 L3,190 C3,96 70,34 152,4 C234,34 301,96 301,190 L301,610";
    const inner = "M17,610 L17,196 C17,110 78,56 152,26 C226,56 287,110 287,196 L287,610";
    return `<svg viewBox="0 0 304 612" preserveAspectRatio="none">
      <path d="${outer} Z" fill="rgba(8, 3, 5, 0.62)"/>
      <path d="${outer}" fill="none" stroke="#2b2124" stroke-width="9" vector-effect="non-scaling-stroke"/>
      <path d="${outer}" fill="none" stroke="#4a3d41" stroke-width="2" vector-effect="non-scaling-stroke"/>
      <path d="${inner}" fill="none" stroke="#9a9ca6" stroke-width="1" stroke-opacity="0.6" vector-effect="non-scaling-stroke"/>
    </svg>`;
  }

  const bloodmoon = {
    build() {
      back.innerHTML = `<div class="gothic-arch">${archSvg()}</div>`;
      front.innerHTML = `
        ${["tl", "tr", "bl", "br"].map((corner) => `<div class="briar briar-${corner}">${briarSvg()}</div>`).join("")}
        <div class="rose-cast">
          <span style="--x: 18%; --y: 8%; --w: 34%; --h: 46%; --c: #ff2a46; --r: -8deg"></span>
          <span style="--x: 54%; --y: 4%; --w: 30%; --h: 40%; --c: #9a3cff; --r: 6deg"></span>
          <span style="--x: 36%; --y: 38%; --w: 36%; --h: 44%; --c: #ff5a3a; --r: 2deg"></span>
          <span style="--x: 8%; --y: 52%; --w: 26%; --h: 34%; --c: #ffbf4a; --r: -4deg"></span>
          <span style="--x: 66%; --y: 50%; --w: 28%; --h: 38%; --c: #d8203c; --r: 9deg"></span>
        </div>`;
    },
    reveal() {
      restart(back, "is-flooding");
      restart(front, "is-flooding");
    }
  };

  // ---- Art Deco Luxe: the Temple of Ra ----

  // The gate, the winged sun and the sunburst are all in the painting; the
  // sun's light (see the scene below) answers the reveal.
  const deco = {
    build() {}
  };

  // ---- Card-back emblems ----

  function eyeOfHorusSvg() {
    return `<svg viewBox="0 0 100 160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <rect x="20" y="26" width="60" height="104" rx="30" stroke-width="1.6"/>
      <rect x="24" y="30" width="52" height="96" rx="26" stroke-width="0.6"/>
      <path d="M16,136 L84,136" stroke-width="2.4"/>
      <path d="M30,66 Q50,57 72,64" stroke-width="3"/>
      <path d="M28,80 Q50,66 72,79 Q50,90 28,80 Z" stroke-width="1.6"/>
      <circle cx="50" cy="78.5" r="6" fill="currentColor" stroke="none"/>
      <path d="M72,79 L80,79" stroke-width="1.6"/>
      <path d="M45,86 L42,104" stroke-width="2"/>
      <path d="M55,86 Q59,100 66,101 Q72,100 70,94 Q67,90 63,93" stroke-width="1.6"/>
      <path d="M50,40 L46,48 L54,48 Z M50,116 L46,108 L54,108 Z" fill="currentColor" stroke="none"/>
    </svg>`;
  }

  function terminalEmblemSvg() {
    const corner = (bits, x, y) => {
      const dots = [];
      for (let row = 0; row < 4; row++) {
        const single = (bits >> (3 - row)) & 1;
        (single ? [0] : [-3.4, 3.4]).forEach((dx) => dots.push(`<circle cx="${x + dx}" cy="${y + row * 6}" r="1.4"/>`));
      }
      return dots.join("");
    };
    const hex = [1, 0, 1, 1, 0, 1].map((whole, row) => {
      const y = 62 + row * 7.4;
      return whole ? `<rect x="32" y="${y}" width="36" height="3.6"/>` : `<rect x="32" y="${y}" width="15" height="3.6"/><rect x="53" y="${y}" width="15" height="3.6"/>`;
    }).join("");
    return `<svg viewBox="0 0 100 160" fill="currentColor">
      <rect x="8" y="8" width="84" height="144" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 2"/>
      ${corner(0b1000, 22, 20)}${corner(0b0011, 78, 20)}${corner(0b0110, 22, 122)}${corner(0b1101, 78, 122)}
      <circle cx="50" cy="80" r="30" fill="none" stroke="currentColor" stroke-width="0.8"/>
      ${hex}
      <text x="50" y="140" font-family="Space Mono, monospace" font-size="7" text-anchor="middle">&gt; CAST_</text>
    </svg>`;
  }

  if (cardBack) {
    const emblems = {
      holo: `<div class="realm-emblem-spin">${metatronSvg("holoEmblemSpectrum", 80)}</div>`,
      terminal: terminalEmblemSvg(),
      bloodmoon: roseWindowSvg("roseEmblem", false),
      deco: eyeOfHorusSvg()
    };
    Object.entries(emblems).forEach(([theme, svg]) => {
      const el = document.createElement("div");
      el.className = "realm-emblem";
      el.dataset.realm = theme;
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = svg;
      cardBack.insertBefore(el, cardBack.querySelector(".foil-glare"));
    });
  }

  // ---- Painted scenes and their light ----
  // Light sources are fractions of each painting (x across, y down), so
  // they're placed on the painting however the screen crops it.

  const SCENES = {
    bloodmoon: { mode: 0, color: [0.95, 0.16, 0.2], portrait: { src: [0.5, 0.115], aux: [0.055, 0.47] }, landscape: { src: [0.5, 0.17], aux: [0.085, 0.37] } },
    deco: { mode: 1, color: [1, 0.74, 0.36], portrait: { src: [0.5, 0.166], aux: [0, 0] }, landscape: { src: [0.5, 0.29], aux: [0, 0] } },
    holo: { mode: 2, color: [1, 1, 1], portrait: { src: [0.5, 0.12], aux: [0.12, 0] }, landscape: { src: [0.52, 0.26], aux: [0.16, 0] } },
    terminal: { mode: 3, flare: 0.45, color: [0.13, 1, 0.5], portrait: { src: [0.5, 0.1], aux: [0, 0] }, landscape: { src: [0.5, 0.2], aux: [0, 0] } }
  };
  const PAINTING_SIZE = { portrait: [1152, 2048], landscape: [2048, 1152] };
  const portraitQuery = window.matchMedia("(orientation: portrait)");

  const scene = document.createElement("div");
  scene.className = "realm-scene";
  scene.setAttribute("aria-hidden", "true");
  scene.innerHTML = '<div class="realm-painting"></div><canvas class="realm-light"></canvas><span class="realm-scrim"></span>';
  document.body.prepend(scene);
  const painting = scene.querySelector(".realm-painting");

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function orientation() {
    return portraitQuery.matches ? "portrait" : "landscape";
  }

  // Shows the painting for the active theme and orientation, fading it in
  // once it has loaded rather than letting it pop in.
  let paintingUrl = "";
  function showPainting() {
    if (!activeKey || !SCENES[activeKey]) return;
    const url = `realms/${activeKey}-${orientation()}.webp`;
    if (url === paintingUrl) return;
    paintingUrl = url;
    scene.classList.remove("is-loaded");
    const img = new Image();
    img.onload = () => {
      if (paintingUrl !== url) return;
      painting.style.backgroundImage = `url("${url}")`;
      scene.classList.add("is-loaded");
    };
    img.src = url;
  }

  const VERTEX_SHADER = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`;

  // One pass per frame, modes per realm. It outputs light only (premultiplied,
  // alpha = brightness), so the painting shows through everywhere else.
  const FRAGMENT_SHADER = `
    precision mediump float;
    varying vec2 vUv;
    uniform vec2 uRes;
    uniform float uTime;
    uniform float uMode;
    uniform float uSurge;
    uniform vec2 uSrc;
    uniform vec2 uAux;
    uniform vec3 uColor;
    uniform vec3 uSurgeColor;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.03 + 1.7;
        a *= 0.5;
      }
      return v;
    }

    // Twinkling points on a jittered grid; density is the share of cells lit.
    float twinkles(vec2 p, float scale, float density, float speed) {
      vec2 g = p * scale;
      vec2 id = floor(g);
      vec2 f = fract(g) - 0.5;
      float h = hash(id);
      if (h > density) return 0.0;
      vec2 o = (vec2(hash(id + 3.7), hash(id + 9.1)) - 0.5) * 0.6;
      float d = length(f - o);
      float tw = pow(0.5 + 0.5 * sin(uTime * speed * (0.6 + h * 2.0) + h * 61.0), 8.0);
      return exp(-d * d * 160.0) * tw;
    }

    vec3 spectrum(float x) {
      x = clamp(x, 0.0, 1.0) * 0.85;
      return clamp(vec3(abs(x * 6.0 - 3.0) - 1.0, 2.0 - abs(x * 6.0 - 2.0), 2.0 - abs(x * 6.0 - 4.0)), 0.0, 1.0);
    }

    void main() {
      float aspect = uRes.x / uRes.y;
      vec2 p = vec2(vUv.x * aspect, vUv.y);
      vec2 s = vec2(uSrc.x * aspect, uSrc.y);
      vec2 d = p - s;
      float r = length(d);
      float a = atan(d.y, d.x);
      float t = uTime;
      vec3 col = vec3(0.0);

      if (uMode < 0.5) {
        // Cathedral: shafts of red light fall from the rose window through
        // incense haze, motes drift in them, candles breathe at the sides.
        float down = smoothstep(0.05, 0.6, -d.y / max(r, 0.001));
        float n = noise(vec2(a * 9.0, t * 0.1)) * 0.65 + noise(vec2(a * 23.0 + 3.1, -t * 0.07)) * 0.35;
        float shafts = smoothstep(0.42, 0.85, n) * down * exp(-r * 1.2);
        shafts *= 0.55 + 0.45 * fbm(p * 2.5 + vec2(t * 0.02, -t * 0.035));
        float motes = twinkles(p + vec2(sin(t * 0.07) * 0.02, t * 0.006), 60.0, 0.12, 1.3) * smoothstep(0.02, 0.2, shafts);
        float window = exp(-r * r * 26.0) * (0.55 + 0.12 * sin(t * 0.6));
        vec2 c1 = vec2(uAux.x * aspect, uAux.y);
        vec2 c2 = vec2((1.0 - uAux.x) * aspect, uAux.y);
        float candles = exp(-dot(p - c1, p - c1) * 120.0) * (0.7 + 0.3 * noise(vec2(t * 7.0, 0.0)))
                      + exp(-dot(p - c2, p - c2) * 120.0) * (0.7 + 0.3 * noise(vec2(t * 6.3, 4.0)));
        col = uColor * (shafts * 0.5 + window * 0.4) * (1.0 + uSurge * 2.2)
            + vec3(1.0, 0.62, 0.32) * candles * 0.28
            + vec3(1.0, 0.7, 0.62) * motes * 0.7;
      } else if (uMode < 1.5) {
        // Temple: the sun disc breathes, its rays turn slowly, gold leaf glints.
        float spokes = pow(0.5 + 0.5 * sin(a * 24.0 + t * 0.12), 7.0) * exp(-r * 1.5);
        float glow = exp(-r * r * 40.0) * (0.75 + 0.2 * sin(t * 0.8));
        float halo = exp(-r * 2.6) * 0.25;
        float glints = twinkles(p, 38.0, 0.16, 1.1) + twinkles(p + 7.3, 64.0, 0.1, 1.7) * 0.7;
        col = uColor * (spokes * 0.32 + glow * 0.55 + halo) * (1.0 + uSurge * 2.4)
            + vec3(1.0, 0.9, 0.62) * glints * 0.85;
      } else if (uMode < 2.5) {
        // Seven Rays: pulses of white light run down the beam into the prism,
        // the spectrum fans out shimmering, glass shards catch the colours.
        vec2 b0 = vec2(uAux.x * aspect, uAux.y);
        vec2 dir = normalize(s - b0);
        vec2 bp = p - b0;
        float along = clamp(dot(bp, dir), 0.0, length(s - b0));
        float off = length(bp - dir * along);
        float pulse = pow(0.5 + 0.5 * sin(along * 22.0 - t * 2.4), 10.0);
        float beam = exp(-off * off * 3000.0) * (0.25 + 0.9 * pulse);
        float base = atan(dir.y, dir.x);
        float da = mod(a - base + 3.14159, 6.28318) - 3.14159;
        float spread = 0.42;
        float inFan = smoothstep(-0.05, 0.03, da + spread * 0.5) * (1.0 - smoothstep(-0.03, 0.05, da - spread * 0.5));
        float flow = 0.55 + 0.45 * pow(0.5 + 0.5 * sin(r * 16.0 - t * 1.8), 3.0);
        float fan = inFan * flow * exp(-r * 1.1) * step(0.0, dot(d, dir));
        vec3 rainbow = spectrum((da + spread * 0.5) / spread) * fan;
        float prism = exp(-r * r * 90.0) * (0.7 + 0.3 * sin(t * 1.4));
        float shard = twinkles(p, 30.0, 0.14, 1.2);
        vec3 sparkle = spectrum(fract(hash(floor(p * 30.0)) + t * 0.05)) * shard;
        col = vec3(1.0) * (beam * 0.6 + prism * 0.6) * (1.0 + uSurge * 2.0)
            + rainbow * 0.38 * (1.0 + uSurge * 1.5)
            + uSurgeColor * prism * uSurge * 1.4
            + sparkle * 0.7;
      } else {
        // Geomancy: the attractor's phosphor breathes, a scan band rolls down,
        // data fog drifts along the floor, the tube flickers.
        float glow = exp(-r * r * 7.0) * (0.35 + 0.2 * sin(t * 1.1));
        float band = exp(-pow((vUv.y - (1.0 - fract(t * 0.05))) * 14.0, 2.0)) * 0.1;
        float fog = fbm(vec2(p.x * 3.0 + t * 0.05, p.y * 6.0 - t * 0.08)) * smoothstep(0.45, 0.0, vUv.y) * 0.16;
        float flicker = 1.0 + 0.05 * (noise(vec2(t * 24.0, 0.0)) - 0.5);
        float bits = twinkles(p + vec2(0.0, -t * 0.03), 48.0, 0.08, 2.4) * 0.5;
        col = uColor * (glow + band + fog + bits) * flicker * (1.0 + uSurge * 2.2);
      }

      col = clamp(col, 0.0, 1.0);
      gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
    }`;

  // Drawn at half resolution (light is soft, and that quarters the fill
  // cost on a phone), paused while the page is hidden, a still frame for
  // reduced motion.
  const light = {
    canvas: scene.querySelector(".realm-light"),
    gl: null,
    u: {},
    frame: null,
    surge: 0,
    surgeColor: [1, 1, 1],
    lastAt: 0,
    failed: false,
    src: [0.5, 0.2],
    aux: [0, 0],

    init() {
      if (this.gl || this.failed) return Boolean(this.gl);
      const gl = this.canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
      if (!gl) {
        this.failed = true;
        return false;
      }
      const compile = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
      };
      const program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        this.failed = true;
        return false;
      }
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(program, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      ["uRes", "uTime", "uMode", "uSurge", "uSrc", "uAux", "uColor", "uSurgeColor"].forEach((name) => {
        this.u[name] = gl.getUniformLocation(program, name);
      });
      this.canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        this.stop();
        this.gl = null;
        this.failed = true;
      });
      this.gl = gl;
      return true;
    },

    // Light positions follow the painting through background-size: cover.
    place() {
      const config = SCENES[activeKey];
      if (!config) return;
      const orient = orientation();
      const [iw, ih] = PAINTING_SIZE[orient];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.max(vw / iw, vh / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const toUv = ([u, v]) => [((vw - dw) / 2 + u * dw) / vw, 1 - ((vh - dh) / 2 + v * dh) / vh];
      this.src = toUv(config[orient].src);
      this.aux = toUv(config[orient].aux);
      const ratio = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      this.canvas.width = Math.max(1, Math.round(vw * ratio));
      this.canvas.height = Math.max(1, Math.round(vh * ratio));
    },

    draw(now) {
      const gl = this.gl;
      const config = SCENES[activeKey];
      if (!gl || !config) return;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.uniform2f(this.u.uRes, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.u.uTime, now / 1000);
      gl.uniform1f(this.u.uMode, config.mode);
      gl.uniform1f(this.u.uSurge, this.surge);
      gl.uniform2f(this.u.uSrc, this.src[0], this.src[1]);
      gl.uniform2f(this.u.uAux, this.aux[0], this.aux[1]);
      gl.uniform3fv(this.u.uColor, config.color);
      gl.uniform3fv(this.u.uSurgeColor, this.surgeColor);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },

    start() {
      if (!this.init() || !SCENES[activeKey]) return;
      this.place();
      if (reduceMotion.matches) {
        this.draw(20000);
        return;
      }
      if (this.frame) return;
      this.lastAt = 0;
      const step = (now) => {
        this.frame = requestAnimationFrame(step);
        const dt = this.lastAt ? Math.min((now - this.lastAt) / 1000, 0.1) : 0;
        this.lastAt = now;
        this.surge *= Math.exp(-dt / 1.1);
        this.draw(now);
      };
      this.frame = requestAnimationFrame(step);
    },

    stop() {
      if (this.frame) cancelAnimationFrame(this.frame);
      this.frame = null;
    },

    flare(strength) {
      const scale = (SCENES[activeKey] && SCENES[activeKey].flare) || 1;
      this.surge = Math.min(1.6, this.surge + strength * scale);
    }
  };

  // ---- Mounting and anchoring ----

  const REALMS = { holo, terminal, bloodmoon, deco };
  let active = null;
  let activeKey = "";

  function anchorEl() {
    const dice = document.body.classList.contains("is-dice-mode") && document.getElementById("dice-stage");
    return dice || cardSlot;
  }

  function anchor() {
    const rect = anchorEl().getBoundingClientRect();
    if (!rect.width) return;
    [back, front].forEach((layer) => {
      layer.style.setProperty("--cx", `${(rect.left + rect.width / 2).toFixed(1)}px`);
      layer.style.setProperty("--cy", `${(rect.top + rect.height / 2).toFixed(1)}px`);
      layer.style.setProperty("--cw", `${rect.width.toFixed(1)}px`);
      layer.style.setProperty("--ch", `${rect.height.toFixed(1)}px`);
      layer.style.setProperty("--top", `${rect.top.toFixed(1)}px`);
      layer.style.setProperty("--left", `${rect.left.toFixed(1)}px`);
    });
  }

  function mount() {
    const key = root.getAttribute("data-theme") || "";
    if (key === activeKey && active) return;
    if (active && active.unmount) active.unmount();
    back.innerHTML = "";
    front.innerHTML = "";
    back.className = "realm";
    front.className = "realm realm-front";
    activeKey = key;
    active = REALMS[key] || null;
    scene.dataset.scene = active ? key : "";
    if (!active) {
      light.stop();
      painting.style.backgroundImage = "";
      paintingUrl = "";
      scene.classList.remove("is-loaded");
      return;
    }
    back.classList.add(`realm-${key}`);
    front.classList.add(`realm-${key}`);
    anchor();
    active.build();
    light.surgeColor = [1, 1, 1];
    showPainting();
    light.start();
  }

  let relayoutTimer = null;
  function relayout() {
    anchor();
    clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(() => {
      if (!active) return;
      showPainting();
      light.place();
      if (reduceMotion.matches) light.start();
    }, 200);
  }

  window.addEventListener("resize", relayout);
  window.addEventListener("scroll", anchor, { passive: true });
  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(anchor);
    observer.observe(cardSlot);
    const diceTray = document.getElementById("diceTray");
    if (diceTray) observer.observe(diceTray);
    observer.observe(document.body);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(anchor);
  }

  new MutationObserver(mount).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  document.addEventListener("tarot:reveal", (event) => {
    const detail = event.detail || {};
    if (active && active.reveal) active.reveal(detail);
    if (active) light.flare(detail.major ? 1.3 : 0.9);
  });

  document.addEventListener("visibilitychange", () => {
    if (!active) return;
    if (document.hidden) light.stop();
    else light.start();
  });

  mount();
})();
