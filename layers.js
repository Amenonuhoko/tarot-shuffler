// ---- Scene layers ----
// Depth and life laid over the existing scene, back to front:
//
//   stars, nebula veil      far planes, barely move
//   charted constellations  the ones you've found (see the lens below)
//   the sigil's three wheels  rim, zodiac, planets on separate planes,
//                          so the flat chart reads as a 3D astrolabe
//   light                   beams falling onto the card
//   (the card and controls)
//   motes                   dust drifting in front of the card, and a
//                          few out-of-focus glows at the edges
//
// The planes shift by depth with the pointer, a phone's tilt or, left
// alone, a slow breath, so near things move more than far ones. Every
// reveal ticks the astrolabe on: the zodiac turns one sign, the planets
// one step of their heptagram (two of each for a Major).
//
// A lens opens wherever you drag across the sky (or hover, with a mouse)
// and shows a hidden star chart under the visible one. Holding it over
// one of its ten constellations charts it: from then on it stays faintly
// drawn in your sky.
//
// Like the rest of the scene: transform and opacity only, every moving
// part on its own layer, nothing touching layout per frame.
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motif = document.querySelector(".mystic-motif");
  const sigil = document.getElementById("motifSigil");
  const cardSlot = document.getElementById("cardSlot");
  if (!motif || !sigil || !cardSlot) {
    return;
  }

  const wheels = {
    rim: sigil.querySelector(".sigil-spin-rim"),
    zodiac: sigil.querySelector(".sigil-spin-zodiac"),
    planets: sigil.querySelector(".sigil-spin-planets")
  };

  // ---- New layers in the DOM ----

  const chartEl = document.createElement("div");
  chartEl.className = "layer-chart";
  chartEl.setAttribute("aria-hidden", "true");

  const raysEl = document.createElement("div");
  raysEl.className = "layer-rays";
  raysEl.setAttribute("aria-hidden", "true");
  raysEl.innerHTML = [
    [-21, 70, 9], [-11, 120, 13], [-3, 90, 11], [6, 140, 15], [15, 80, 10], [24, 110, 12]
  ].map(([angle, width, secs], i) =>
    `<span class="ray" style="--a: ${angle}deg; --w: ${width}px; --t: ${secs}s; --delay: ${-i * 2.3}s"></span>`
  ).join("") + '<span class="ray ray-flare" style="--a: 0deg; --w: 220px"></span>';

  const lensEl = document.createElement("div");
  lensEl.className = "layer-lens";
  lensEl.setAttribute("aria-hidden", "true");
  lensEl.innerHTML = '<div class="layer-lens-view"></div><span class="layer-lens-rim"></span>';
  const lensView = lensEl.querySelector(".layer-lens-view");

  const motesCanvas = document.createElement("canvas");
  motesCanvas.className = "layer-motes";
  motesCanvas.setAttribute("aria-hidden", "true");

  const toastEl = document.createElement("p");
  toastEl.className = "layer-toast";
  toastEl.setAttribute("role", "status");

  // Behind the table (same stacking level as the motif, later in order),
  // except the lens, motes and toast, which layers.css lifts in front.
  motif.after(chartEl, raysEl, lensEl);
  document.body.append(motesCanvas, toastEl);

  // ---- Depth ----

  const MAX_SHIFT = 22; // px a depth-1 plane travels at full deflection
  const planes = [
    [motif.querySelector(".motif-stars"), 0.12],
    [motif.querySelector(".motif-veil"), 0.24],
    [chartEl, 0.2],
    [wheels.rim, 0.36],
    [wheels.zodiac, 0.6],
    [wheels.planets, 0.92],
    [raysEl, 0.5],
    [document.getElementById("terminalRain"), 0.14]
  ].filter(([el]) => el);

  const target = { x: 0, y: 0 };
  const view = { x: 0, y: 0 };
  let lastInputAt = -Infinity;

  function aim(x, y) {
    target.x = Math.max(-1, Math.min(1, x));
    target.y = Math.max(-1, Math.min(1, y));
    lastInputAt = performance.now();
  }

  // Offset of a plane at `depth` for the current view. Planes move
  // against the pointer, like looking past them.
  function shiftFor(depth) {
    return { x: -view.x * depth * MAX_SHIFT, y: -view.y * depth * MAX_SHIFT };
  }

  let lastApplied = { x: NaN, y: NaN };

  function applyDepth() {
    if (Math.abs(view.x - lastApplied.x) < 0.002 && Math.abs(view.y - lastApplied.y) < 0.002) {
      return;
    }
    lastApplied = { x: view.x, y: view.y };
    planes.forEach(([el, depth]) => {
      const { x, y } = shiftFor(depth);
      el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
    });
  }

  // ---- The astrolabe ----

  const angles = { rim: 0, zodiac: 0, planets: 0 };

  function tickAstrolabe(major) {
    const steps = major ? 2 : 1;
    angles.rim += 15 * steps;
    angles.zodiac -= 30 * steps; // one sign of twelve
    angles.planets += (360 / 7) * steps; // one point of the heptagram
    Object.entries(wheels).forEach(([key, el]) => {
      if (el) el.style.rotate = `${angles[key].toFixed(3)}deg`;
    });
  }

  // ---- Light ----

  function placeRays() {
    const anchor = visibleAnchor();
    const rect = anchor.getBoundingClientRect();
    if (!rect.width) return;
    raysEl.style.left = `${rect.left + rect.width / 2}px`;
    raysEl.style.top = `${rect.top - rect.height * 0.5}px`;
    raysEl.style.setProperty("--ray-h", `${rect.height * 1.75}px`);
  }

  function visibleAnchor() {
    const dice = document.body.classList.contains("is-dice-mode") && document.getElementById("dice-stage");
    return dice || cardSlot;
  }

  function flareRays() {
    raysEl.classList.remove("is-flaring");
    void raysEl.offsetWidth;
    raysEl.classList.add("is-flaring");
  }

  // ---- Motes ----

  const motes = [];
  const motesCtx = motesCanvas.getContext("2d");
  let motesRatio = 1;
  let moteSprite = null;
  let burstUntil = 0;

  function makeSprite(color) {
    const size = 64;
    const sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    const ctx = sprite.getContext("2d");
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.18, color);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return sprite;
  }

  function themeColor() {
    return getComputedStyle(document.documentElement).getPropertyValue("--gold").trim() || "#d8b76a";
  }

  function sizeMotes() {
    motesRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    motesCanvas.width = Math.round(window.innerWidth * motesRatio);
    motesCanvas.height = Math.round(window.innerHeight * motesRatio);
    motesCtx.setTransform(motesRatio, 0, 0, motesRatio, 0, 0);
  }

  function seedMotes() {
    motes.length = 0;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const count = Math.round(Math.min(46, Math.max(26, (w * h) / 26000)));
    for (let i = 0; i < count; i++) {
      const depth = 0.4 + Math.random() * 1.6;
      motes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        depth,
        size: 1.6 + depth * 2.2,
        speed: 4 + depth * 7,
        sway: Math.random() * Math.PI * 2,
        alpha: 0.25 + Math.random() * 0.45,
        vx: 0,
        vy: 0
      });
    }
    // A few large out-of-focus glows near the edges: the nearest plane.
    for (let i = 0; i < 4; i++) {
      const left = i % 2 === 0;
      motes.push({
        x: left ? Math.random() * w * 0.18 : w * (0.82 + Math.random() * 0.18),
        y: Math.random() * h,
        depth: 2.6 + Math.random() * 0.8,
        size: 46 + Math.random() * 44,
        speed: 2,
        sway: Math.random() * Math.PI * 2,
        alpha: 0.05 + Math.random() * 0.04,
        vx: 0,
        vy: 0,
        bokeh: true
      });
    }
  }

  function burstMotes() {
    const rect = visibleAnchor().getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    motes.forEach((mote) => {
      if (mote.bokeh) return;
      const dx = mote.x - cx;
      const dy = mote.y - cy;
      const dist = Math.max(40, Math.hypot(dx, dy));
      const push = 9000 / dist;
      mote.vx += (dx / dist) * push * 0.02 * mote.depth;
      mote.vy += (dy / dist) * push * 0.02 * mote.depth - 6;
    });
    burstUntil = performance.now() + 1600;
  }

  function drawMotes(dt, now) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    motesCtx.clearRect(0, 0, w, h);
    if (!moteSprite) return;
    const glow = now < burstUntil ? 1 + (burstUntil - now) / 1600 : 1;
    motes.forEach((mote) => {
      mote.sway += dt * 0.5;
      mote.vx *= 0.95;
      mote.vy *= 0.95;
      mote.x += (Math.sin(mote.sway) * 3 + mote.vx) * dt;
      mote.y += (-mote.speed + mote.vy) * dt;
      if (mote.y < -mote.size * 2) {
        mote.y = h + mote.size * 2;
        mote.x = Math.random() * w;
      }
      if (mote.x < -mote.size * 2) mote.x = w + mote.size;
      if (mote.x > w + mote.size * 2) mote.x = -mote.size;
      const shift = shiftFor(mote.depth);
      const size = mote.size * (mote.bokeh ? 1 : glow * 0.5 + 0.5);
      motesCtx.globalAlpha = Math.min(1, mote.alpha * (mote.bokeh ? 1 : glow));
      motesCtx.drawImage(moteSprite, mote.x + shift.x - size, mote.y + shift.y - size, size * 2, size * 2);
    });
    motesCtx.globalAlpha = 1;
  }

  // ---- The hidden chart ----

  // Simplified figures of real constellations: stars in a unit box and
  // the lines between them. Latin names with V for U, like the rim's
  // inscription.
  const CONSTELLATIONS = [
    { name: "ORION", stars: [[0.25, 0.15], [0.72, 0.2], [0.42, 0.5], [0.5, 0.47], [0.58, 0.44], [0.33, 0.86], [0.76, 0.82], [0.48, 0.03]], lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 7], [7, 1]] },
    { name: "VRSA MAIOR", stars: [[0, 0.32], [0.22, 0.2], [0.4, 0.26], [0.56, 0.36], [0.6, 0.68], [0.92, 0.72], [0.96, 0.4]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
    { name: "CASSIOPEIA", stars: [[0, 0.3], [0.25, 0.72], [0.5, 0.42], [0.75, 0.78], [1, 0.22]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]] },
    { name: "CYGNVS", stars: [[0.5, 0], [0.5, 0.36], [0.5, 1], [0.08, 0.28], [0.92, 0.46], [0.3, 0.32], [0.7, 0.4]], lines: [[0, 1], [1, 2], [3, 5], [5, 1], [1, 6], [6, 4]] },
    { name: "LYRA", stars: [[0.5, 0], [0.4, 0.36], [0.62, 0.36], [0.34, 0.82], [0.68, 0.8]], lines: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4]] },
    { name: "SCORPIVS", stars: [[0.08, 0.04], [0.14, 0.2], [0.1, 0.36], [0.34, 0.42], [0.48, 0.56], [0.58, 0.72], [0.7, 0.86], [0.85, 0.92], [0.96, 0.8], [0.9, 0.68]], lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]] },
    { name: "LEO", stars: [[0.18, 0.5], [0.22, 0.32], [0.3, 0.16], [0.42, 0.12], [0.48, 0.26], [0.74, 0.3], [0.96, 0.42], [0.7, 0.54]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [6, 7], [7, 0]] },
    { name: "PLEIADES", stars: [[0.3, 0.3], [0.45, 0.22], [0.58, 0.34], [0.5, 0.48], [0.36, 0.5], [0.68, 0.5], [0.44, 0.66]], lines: [] },
    { name: "CRVX", stars: [[0.5, 0], [0.5, 1], [0.1, 0.45], [0.86, 0.4], [0.64, 0.66]], lines: [[0, 1], [2, 3]] },
    { name: "GEMINI", stars: [[0.22, 0], [0.5, 0.06], [0.16, 0.5], [0.1, 1], [0.48, 0.52], [0.54, 1], [0.32, 0.72]], lines: [[0, 2], [2, 3], [1, 4], [4, 5], [0, 1], [2, 6], [6, 4]] }
  ];

  // Where each figure sits, as a fraction of the viewport.
  const ANCHORS = [[0.2, 0.13], [0.76, 0.1], [0.1, 0.42], [0.88, 0.37], [0.26, 0.72], [0.8, 0.66], [0.52, 0.9], [0.5, 0.22], [0.12, 0.92], [0.88, 0.92]];

  const CHART_DEPTH = 0.2;
  const STORAGE_KEY = "tarotPullCharted";
  let charted = new Set();
  try {
    charted = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch (err) {
    // Storage unavailable: discoveries just won't persist.
  }

  let figures = [];

  function seeded(seed) {
    return function () {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  function layoutFigures() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const size = Math.max(96, Math.min(180, Math.min(w, h) * 0.3));
    figures = CONSTELLATIONS.map((c, i) => {
      const [ax, ay] = ANCHORS[i];
      const cx = ax * w;
      const cy = ay * h;
      return {
        ...c,
        cx,
        cy,
        points: c.stars.map(([x, y]) => [cx + (x - 0.5) * size, cy + (y - 0.5) * size])
      };
    });
  }

  function figureSvg(figure, found, withLabel) {
    const lines = figure.lines.map(([a, b]) => {
      const [x1, y1] = figure.points[a];
      const [x2, y2] = figure.points[b];
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }).join("");
    const stars = figure.points.map(([x, y], i) =>
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 0 ? 2.4 : 1.7}"/>`
    ).join("");
    const bottom = Math.max(...figure.points.map(([, y]) => y));
    const label = withLabel
      ? `<text x="${figure.cx.toFixed(1)}" y="${(bottom + 16).toFixed(1)}">${found ? "✦ " : ""}${figure.name}</text>`
      : "";
    return `<g class="figure${found ? " is-found" : ""}" data-name="${figure.name}">${lines}${stars}${label}</g>`;
  }

  function renderHiddenSky() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const random = seeded(1777);
    // Faint star-chart grid: circles of declination around a pole above
    // the screen, and hour lines out from it.
    const pole = [w / 2, -h * 0.35];
    const rings = Array.from({ length: 9 }, (_, i) =>
      `<circle class="grid" cx="${pole[0]}" cy="${pole[1]}" r="${(h * 0.45 + i * h * 0.16).toFixed(1)}"/>`
    ).join("");
    const hours = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r = Math.hypot(w, h) * 1.6;
      return `<line class="grid" x1="${pole[0]}" y1="${pole[1]}" x2="${(pole[0] + Math.cos(a) * r).toFixed(1)}" y2="${(pole[1] + Math.sin(a) * r).toFixed(1)}"/>`;
    }).join("");
    const dust = Array.from({ length: Math.round((w * h) / 2600) }, () =>
      `<circle class="dust" cx="${(random() * w).toFixed(1)}" cy="${(random() * h).toFixed(1)}" r="${(0.4 + random() * 1.1).toFixed(2)}"/>`
    ).join("");
    lensView.innerHTML = `<svg class="hidden-sky" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <g class="grid-lines">${rings}${hours}</g>${dust}
      ${figures.map((f) => figureSvg(f, charted.has(f.name), true)).join("")}
    </svg>`;
    renderChart();
  }

  // The figures you've found, drawn faintly into the sky for good.
  function renderChart() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    chartEl.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      ${figures.filter((f) => charted.has(f.name)).map((f) => figureSvg(f, true, true)).join("")}
    </svg>`;
  }

  // ---- The lens ----

  const lens = { on: false, x: 0, y: 0, size: 220, hideTimer: null, dwellName: null, dwellSince: 0 };
  let dragged = false;

  function lensSize() {
    return Math.round(Math.max(170, Math.min(260, Math.min(window.innerWidth, window.innerHeight) * 0.46)));
  }

  function isSkyTarget(target) {
    return !target.closest("#cardSlot, #diceTray, .bottom-group, .deck-selector-row, .spread-info-popover, .support-footer, .layer-toast, button, a, select, input, label");
  }

  function showLens(x, y) {
    lens.x = x;
    lens.y = y;
    if (!lens.on) {
      lens.on = true;
      lensEl.classList.add("is-on");
    }
    clearTimeout(lens.hideTimer);
  }

  function hideLens(delay = 0) {
    clearTimeout(lens.hideTimer);
    lens.hideTimer = setTimeout(() => {
      lens.on = false;
      lens.dwellName = null;
      lensEl.classList.remove("is-on");
    }, delay);
  }

  function placeLens() {
    const half = lens.size / 2;
    const shift = shiftFor(CHART_DEPTH);
    lensEl.style.transform = `translate(${lens.x.toFixed(1)}px, ${lens.y.toFixed(1)}px)`;
    // The chart inside stays put in the sky while the lens moves over it.
    lensView.style.transform = `translate(${(half - lens.x + shift.x).toFixed(1)}px, ${(half - lens.y + shift.y).toFixed(1)}px)`;
  }

  // Holding the lens over a figure for a moment charts it.
  function checkDiscovery(now) {
    if (!lens.on) return;
    const shift = shiftFor(CHART_DEPTH);
    const reach = lens.size * 0.32;
    const near = figures.find((f) => !charted.has(f.name) && Math.hypot(f.cx + shift.x - lens.x, f.cy + shift.y - lens.y) < reach);
    if (!near) {
      lens.dwellName = null;
      return;
    }
    if (lens.dwellName !== near.name) {
      lens.dwellName = near.name;
      lens.dwellSince = now;
      return;
    }
    if (now - lens.dwellSince > 650) {
      chart(near);
      lens.dwellName = null;
    }
  }

  function chart(figure) {
    charted.add(figure.name);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...charted]));
    } catch (err) {
      // Storage unavailable: it's charted for this visit only.
    }
    const group = lensView.querySelector(`.figure[data-name="${figure.name}"]`);
    if (group) {
      group.outerHTML = figureSvg(figure, true, true);
    }
    renderChart();
    toast(`✦ ${titleCase(figure.name)} charted · ${charted.size} of ${CONSTELLATIONS.length} hidden constellations`);
    if (navigator.vibrate && window.matchMedia("(pointer: coarse)").matches) {
      try {
        navigator.vibrate(18);
      } catch (err) {
        // Not allowed here.
      }
    }
  }

  function titleCase(name) {
    return name.toLowerCase().replace(/v/g, "u").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  let toastTimer = null;

  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 3200);
  }

  // Mouse: the view follows the pointer anywhere; the lens opens over
  // open sky and closes when the pointer rests or moves onto the card.
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    aim(event.clientX / window.innerWidth * 2 - 1, event.clientY / window.innerHeight * 2 - 1);
    if (isSkyTarget(event.target)) {
      showLens(event.clientX, event.clientY);
      hideLens(1600);
    } else if (lens.on) {
      hideLens(0);
    }
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => hideLens(0));

  // Touch: drag across open sky to look through the lens. A plain tap
  // still pulls a card (script.js asks consumeDrag() first).
  let touchStart = null;

  window.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (event.touches.length !== 1 || !isSkyTarget(event.target)) {
      touchStart = null;
      return;
    }
    touchStart = { x: touch.clientX, y: touch.clientY, moved: false };
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    if (!touchStart) return;
    const touch = event.touches[0];
    if (!touchStart.moved && Math.hypot(touch.clientX - touchStart.x, touch.clientY - touchStart.y) < 10) return;
    touchStart.moved = true;
    dragged = true;
    // Lift the lens a little above the finger so it isn't hidden under it.
    showLens(touch.clientX, touch.clientY - lens.size * 0.42);
    aim(touch.clientX / window.innerWidth * 2 - 1, touch.clientY / window.innerHeight * 2 - 1);
  }, { passive: true });

  function endTouch() {
    if (touchStart && touchStart.moved) {
      hideLens(500);
      // In case no click follows this drag, don't let it swallow a later one.
      setTimeout(() => {
        dragged = false;
      }, 400);
    }
    touchStart = null;
  }

  window.addEventListener("touchend", endTouch, { passive: true });
  window.addEventListener("touchcancel", endTouch, { passive: true });

  // A phone's tilt, where the browser gives it without a permission prompt.
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission !== "function") {
    let base = null;
    window.addEventListener("deviceorientation", (event) => {
      if (event.beta === null || event.gamma === null || reduceMotion.matches) return;
      if (!base) base = { beta: event.beta, gamma: event.gamma };
      aim((event.gamma - base.gamma) / 22, (event.beta - base.beta) / 22);
    });
  }

  // Teach the lens once, after a few draws, to people on touch screens
  // (a mouse finds it on its own).
  let revealCount = 0;

  function maybeTeachLens() {
    revealCount++;
    let taught = false;
    try {
      taught = localStorage.getItem("tarotPullLensTaught") === "1";
    } catch (err) {
      taught = true;
    }
    if (taught || revealCount !== 3 || !window.matchMedia("(pointer: coarse)").matches) return;
    setTimeout(() => toast("Drag across the sky to look closer ✦"), 2600);
    try {
      localStorage.setItem("tarotPullLensTaught", "1");
    } catch (err) {
      // Fine: it may be taught again next visit.
    }
  }

  // ---- The loop ----

  let rafId = null;
  let lastFrame = 0;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.05) : 0;
    lastFrame = now;

    // Left alone, the scene breathes on its own.
    if (now - lastInputAt > 2500 && !lens.on) {
      const t = now / 1000;
      target.x = Math.sin(t * 0.13) * 0.32;
      target.y = Math.cos(t * 0.097) * 0.22;
    }
    const ease = 1 - Math.pow(0.001, dt);
    view.x += (target.x - view.x) * ease * 0.9;
    view.y += (target.y - view.y) * ease * 0.9;

    applyDepth();
    if (lens.on) {
      lens.size = lensSize();
      placeLens();
      checkDiscovery(now);
    }
    drawMotes(dt, now);
  }

  function start() {
    if (rafId !== null || reduceMotion.matches) return;
    lastFrame = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) {
      stop();
      view.x = view.y = 0;
      applyDepth();
      motesCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    } else {
      start();
    }
  });

  // ---- Wiring ----

  function relayout() {
    sizeMotes();
    seedMotes();
    layoutFigures();
    renderHiddenSky();
    lens.size = lensSize();
    lensEl.style.setProperty("--lens", `${lens.size}px`);
    placeRays();
  }

  let relayoutTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(relayout, 150);
  });
  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(placeRays);
    observer.observe(cardSlot);
    const diceTray = document.getElementById("diceTray");
    if (diceTray) observer.observe(diceTray);
  }
  window.addEventListener("scroll", placeRays, { passive: true });

  // Re-tint the motes when the theme changes.
  new MutationObserver(() => {
    moteSprite = makeSprite(themeColor());
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  document.addEventListener("tarot:reveal", (event) => {
    const major = Boolean(event.detail && event.detail.major);
    tickAstrolabe(major);
    flareRays();
    if (!reduceMotion.matches) burstMotes();
    maybeTeachLens();
  });

  window.TarotLayers = {
    consumeDrag() {
      const was = dragged;
      dragged = false;
      return was;
    }
  };

  moteSprite = makeSprite(themeColor());
  relayout();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(placeRays);
  }
  start();
})();
