// ---- Realms ----
// Each theme besides Mystic Violet is its own mystical tradition, built
// around the card:
//
//   Holographic Foil  The Seven Rays: an iridescent Metatron's cube turns
//                     behind the card, which disperses light into the
//                     seven rays of the Theosophists; each card's ray is
//                     named on reveal.
//   Glitch Terminal   Digital geomancy and chaos: a Lorenz attractor
//                     traces itself behind the card over the logistic
//                     map's bifurcation, and each reveal runs a real
//                     geomantic cast, seeded by the logistic map, in the
//                     card's art window.
//   Blood Moon        The Crimson Cathedral: a gothic rose window glows
//                     behind the card, briars hold its corners, and red
//                     light floods through the glass on reveal.
//   Art Deco Luxe     The Temple of Ra: a gilded pylon gateway frames the
//                     card under a winged sun disc that spreads its wings
//                     on reveal while the gate lights tier by tier.
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
      back.innerHTML = `
        <div class="holo-cube holo-cube-outer">${metatronSvg("holoSpectrumA", 80)}</div>
        <div class="holo-cube holo-cube-inner">${metatronSvg("holoSpectrumB", 80)}</div>
        <span class="holo-beam"></span>
        ${SEVEN_RAYS.map((ray, i) => `<span class="holo-ray" style="--i: ${i}; --ray: ${ray.color}; --a: ${20 + i * 4}deg"></span>`).join("")}
        <p class="holo-caption"></p>`;
    },
    reveal({ card }) {
      if (!card) return;
      const index = rayFor(card);
      const ray = SEVEN_RAYS[index];
      back.querySelectorAll(".holo-ray").forEach((el, i) => el.classList.toggle("is-chosen", i === index));
      const caption = back.querySelector(".holo-caption");
      caption.textContent = `Ray ${NUMERALS[index]} · ${ray.name}`;
      caption.style.color = ray.color;
      restart(back, "is-dispersing");
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

  function lorenzPoints(steps) {
    let x = 0.1;
    let y = 0;
    let z = 0;
    const dt = 0.005;
    const points = [];
    for (let i = 0; i < steps + 300; i++) {
      const dx = 10 * (y - x);
      const dy = x * (28 - z) - y;
      const dz = x * y - (8 / 3) * z;
      x += dx * dt;
      y += dy * dt;
      z += dz * dt;
      if (i >= 300) points.push([x, z]);
    }
    return points;
  }

  const terminal = {
    frame: null,
    build() {
      back.innerHTML = `
        <canvas class="geo-bifurcation"></canvas>
        <canvas class="geo-attractor"></canvas>
        <canvas class="geo-attractor-head"></canvas>
        <pre class="geo-eq geo-eq-lorenz">dx/dt = σ(y − x)
dy/dt = x(ρ − z) − y
dz/dt = xy − βz
σ=10  ρ=28  β=8/3</pre>
        <pre class="geo-eq geo-eq-logistic">xₙ₊₁ = r·xₙ(1 − xₙ)
δ = 4.669201609…</pre>`;
      this.draw();
      this.start();
    },
    draw() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      // The bifurcation of the logistic map, along the foot of the screen.
      const bif = back.querySelector(".geo-bifurcation");
      const bw = Math.round(window.innerWidth * ratio);
      const bh = Math.round(window.innerHeight * 0.3 * ratio);
      bif.width = bw;
      bif.height = bh;
      const bctx = bif.getContext("2d");
      const image = bctx.createImageData(bw, bh);
      for (let px = 0; px < bw; px++) {
        const r = 2.8 + (1.2 * px) / bw;
        let x = 0.5;
        for (let i = 0; i < 200; i++) x = r * x * (1 - x);
        for (let i = 0; i < 140; i++) {
          x = r * x * (1 - x);
          const py = Math.round((1 - x) * (bh - 1));
          const o = (py * bw + px) * 4;
          image.data[o] = 34;
          image.data[o + 1] = 255;
          image.data[o + 2] = 127;
          image.data[o + 3] = Math.min(255, image.data[o + 3] + 70);
        }
      }
      bctx.putImageData(image, 0, 0);

      // The Lorenz attractor, drawn once; a live point traces it on top.
      const att = back.querySelector(".geo-attractor");
      const head = back.querySelector(".geo-attractor-head");
      const size = att.getBoundingClientRect();
      [att, head].forEach((c) => {
        c.width = Math.round(size.width * ratio);
        c.height = Math.round(size.height * ratio);
      });
      const actx = att.getContext("2d");
      this.project = ([x, z]) => [
        att.width / 2 + (x / 22) * (att.width * 0.46),
        att.height * 0.96 - (z / 52) * (att.height * 0.9)
      ];
      actx.strokeStyle = "rgba(34, 255, 127, 0.3)";
      actx.lineWidth = 0.8 * ratio;
      actx.beginPath();
      lorenzPoints(16000).forEach((p, i) => {
        const [px, py] = this.project(p);
        if (i) actx.lineTo(px, py);
        else actx.moveTo(px, py);
      });
      actx.stroke();
      this.headCtx = head.getContext("2d");
      this.headCanvas = head;
      this.state = { x: 1, y: 1, z: 1 };
      this.trail = [];
      this.ratio = ratio;
    },
    start() {
      if (reduceMotion.matches || this.frame) return;
      const step = () => {
        this.frame = requestAnimationFrame(step);
        const s = this.state;
        for (let k = 0; k < 4; k++) {
          const dt = 0.004;
          const dx = 10 * (s.y - s.x);
          const dy = s.x * (28 - s.z) - s.y;
          const dz = s.x * s.y - (8 / 3) * s.z;
          s.x += dx * dt;
          s.y += dy * dt;
          s.z += dz * dt;
          this.trail.push(this.project([s.x, s.z]));
        }
        if (this.trail.length > 160) this.trail.splice(0, this.trail.length - 160);
        const ctx = this.headCtx;
        ctx.clearRect(0, 0, this.headCanvas.width, this.headCanvas.height);
        ctx.lineWidth = 1.4 * this.ratio;
        for (let i = 1; i < this.trail.length; i++) {
          ctx.strokeStyle = `rgba(160, 255, 200, ${(i / this.trail.length) * 0.8})`;
          ctx.beginPath();
          ctx.moveTo(this.trail[i - 1][0], this.trail[i - 1][1]);
          ctx.lineTo(this.trail[i][0], this.trail[i][1]);
          ctx.stroke();
        }
        const [hx, hy] = this.trail[this.trail.length - 1];
        ctx.fillStyle = "rgba(220, 255, 235, 0.95)";
        ctx.beginPath();
        ctx.arc(hx, hy, 2.4 * this.ratio, 0, Math.PI * 2);
        ctx.fill();
      };
      this.frame = requestAnimationFrame(step);
    },
    stop() {
      if (this.frame) cancelAnimationFrame(this.frame);
      this.frame = null;
    },
    unmount() {
      this.stop();
      clearTimeout(this.castTimer);
      clearInterval(this.scrambleTimer);
    },
    relayout() {
      this.stop();
      this.draw();
      this.start();
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
              ${figureSvg(cast.judge, "geo-judge")}
              <p class="geo-judge-name">${FIGURE_BY_BITS[cast.judge]}</p>
              ${hexagramSvg(cast.hexagram)}`;
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
    const quatrefoil = [0, 90, 180, 270].map((a) => {
      const [x, y] = polar(4.2, a);
      return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.6" fill="#c99a3a"/>`;
    }).join("");
    return `<svg viewBox="-100 -100 200 200">
      <defs>
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

  const bloodmoon = {
    build() {
      back.innerHTML = `
        <span class="rose-light"></span>
        <div class="rose-window">${roseWindowSvg("roseWindow")}</div>
        <span class="rose-flare"></span>`;
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

  function pylonSvg() {
    const tiers = Array.from({ length: 6 }, (_, i) => {
      const y = 330 - i * 52;
      const inset = 6 + i * 3;
      return `<rect class="ra-tier" style="--i: ${i}" x="${inset}" y="${y}" width="${100 - inset * 2}" height="9"/>`;
    }).join("");
    return `<svg viewBox="0 0 100 360" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="raGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff6da"/><stop offset="0.3" stop-color="#e8c368"/><stop offset="0.6" stop-color="#8f7328"/><stop offset="1" stop-color="#e8c368"/>
        </linearGradient>
      </defs>
      <path class="ra-pylon" d="M14,20 L86,20 L96,356 L4,356 Z"/>
      <path d="M8,20 L92,20 L92,10 L80,10 L80,4 L20,4 L20,10 L8,10 Z" fill="url(#raGold)"/>
      <g class="ra-tiers">${tiers}</g>
      <g fill="none" stroke="url(#raGold)" stroke-width="2.2" stroke-linecap="round">
        <ellipse cx="50" cy="132" rx="9" ry="12"/>
        <path d="M50,144 L50,186 M36,152 L64,152"/>
      </g>
      <path d="M14,20 L86,20 L96,356 L4,356 Z" fill="none" stroke="url(#raGold)" stroke-width="1.6"/>
    </svg>`;
  }

  function wingSvg() {
    const rows = [[0, 26, 190, 10], [9, 22, 164, 9], [17, 18, 132, 8]];
    const feathers = rows.map(([y0, depth, length, count], r) => {
      const strokes = Array.from({ length: count }, (_, k) => {
        const x = 22 + ((length - 22) * (k + 1)) / (count + 1);
        return `<path d="M${x.toFixed(1)},${(y0 - 2 - (x / length) * 10).toFixed(1)} L${(x + 6).toFixed(1)},${(y0 + depth * 0.6 - (x / length) * 12).toFixed(1)}"/>`;
      }).join("");
      return `<path class="ra-feather-row" style="--r: ${r}" d="M18,${y0 - 6} C80,${y0 - 14} 140,${y0 - 20} ${length},${y0 - 22} C${length - 18},${y0 - 6} ${length - 40},${y0 + depth * 0.5} 18,${y0 + depth * 0.7} Z"/>
        <g class="ra-feather-lines">${strokes}</g>`;
    }).join("");
    return `<svg viewBox="0 -30 200 70">${feathers}</svg>`;
  }

  const deco = {
    build() {
      back.innerHTML = `
        <div class="ra-pylon-wrap ra-left">${pylonSvg()}</div>
        <div class="ra-pylon-wrap ra-right">${pylonSvg()}</div>
        <div class="ra-sun">
          <div class="ra-wing ra-wing-left">${wingSvg()}</div>
          <div class="ra-wing ra-wing-right">${wingSvg()}</div>
          <span class="ra-disc"></span>
          <span class="ra-uraeus ra-uraeus-left"></span>
          <span class="ra-uraeus ra-uraeus-right"></span>
        </div>`;
    },
    reveal() {
      restart(back, "is-rising");
    }
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
    if (!active) return;
    back.classList.add(`realm-${key}`);
    front.classList.add(`realm-${key}`);
    anchor();
    active.build();
  }

  let relayoutTimer = null;
  function relayout() {
    anchor();
    clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(() => {
      if (active && active.relayout) active.relayout();
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
    if (active && active.reveal) active.reveal(event.detail || {});
  });

  document.addEventListener("visibilitychange", () => {
    if (activeKey !== "terminal") return;
    if (document.hidden) terminal.stop();
    else terminal.start();
  });

  mount();
})();
