// ---- Realms ----
// Each theme besides Mystic Violet is its own mystical tradition, built
// the way Mystic is: a backdrop that recedes behind the card, a sigil of
// three wheels pinned to the card that turn against each other, breathe
// and surge on every reveal, a darkened room and a halo of the realm's
// own for a Major, and a stir when the deck is shuffled. The backdrop is
// a painting (realms/<theme>-portrait|landscape.webp) whose own light
// (its window, sun, prism or attractor) lives on top as compositor
// layers, so every moving part animates only transform or opacity.
//
//   Holographic Foil  The Seven Rays: a spectral wheel of the seven rays
//                     of the Theosophists round Metatron's cube; each
//                     card's ray lights its arc and is named on reveal.
//   Glitch Terminal   Digital geomancy and chaos: the sixteen figures,
//                     the 64 hexagrams in binary and a radar reticle;
//                     each reveal pings and runs a real geomantic cast,
//                     seeded by the logistic map, in the card's art window.
//   Blood Moon        The Crimson Cathedral: a rose window of tracery,
//                     jewel glass and a crown of thorns; light through the
//                     glass falls across the card on reveal.
//   Art Deco Luxe     The Temple of Ra: a stepped sunburst with the 36
//                     decan stars, a band of cartouches and a lotus; the
//                     sun's rays flare on reveal.
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
  const cardEl = document.getElementById("card");
  const cardBack = document.getElementById("cardBack");
  const cardFront = document.getElementById("cardFront");
  const cardArt = document.getElementById("cardArt");
  const cardTitle = document.getElementById("cardTitle");
  const majorHalo = document.getElementById("majorHalo");
  if (!motif || !cardSlot) {
    return;
  }

  // Behind the table with Mystic's motif: the sigil and the few pieces
  // set around the card.
  const back = document.createElement("div");
  back.className = "realm";
  back.setAttribute("aria-hidden", "true");
  motif.after(back);

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


  // Polar coordinates with 0deg at the top, turning clockwise.
  function polar(r, a) {
    return [Math.cos((a - 90) * DEG) * r, Math.sin((a - 90) * DEG) * r];
  }

  function pt([x, y]) {
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }

  // A clockwise arc of radius r from angle a0 to a1.
  function arcPath(r, a0, a1) {
    return `M${pt(polar(r, a0))} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(polar(r, a1))}`;
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
      back.insertAdjacentHTML("beforeend", '<p class="holo-caption"></p>');
    },
    reveal({ card }) {
      if (!card) return;
      const index = rayFor(card);
      const ray = SEVEN_RAYS[index];
      const caption = back.querySelector(".holo-caption");
      caption.textContent = `Ray ${NUMERALS[index]} · ${ray.name}`;
      caption.style.color = ray.color;
      // The card's art window and the sigil's aura take on its ray, and
      // its arc on the rim lights (see realms.css).
      cardSlot.style.setProperty("--ray", ray.color);
      back.style.setProperty("--rs-tint", ray.color);
      scene.style.setProperty("--rs-tint", ray.color);
      back.querySelectorAll(".rs-ray").forEach((arc) => arc.classList.toggle("is-chosen", Number(arc.dataset.ray) === index));
      restart(back, "is-dispersing");
    },
    unmount() {
      cardSlot.style.removeProperty("--ray");
      back.style.removeProperty("--rs-tint");
      scene.style.removeProperty("--rs-tint");
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
      back.insertAdjacentHTML("beforeend", `
        <pre class="geo-eq geo-eq-lorenz">dx/dt = σ(y − x)
dy/dt = x(ρ − z) − y
dz/dt = xy − βz
σ=10  ρ=28  β=8/3</pre>
        <pre class="geo-eq geo-eq-logistic">xₙ₊₁ = r·xₙ(1 − xₙ)
δ = 4.669201609…</pre>`);
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

  // Light through the glass, cast across the card for a moment. It lives
  // on the card's face, so it turns with the card.
  let roseCast = null;
  if (cardFront) {
    roseCast = document.createElement("div");
    roseCast.className = "rose-cast";
    roseCast.setAttribute("aria-hidden", "true");
    roseCast.innerHTML = `
      <span style="--x: 18%; --y: 8%; --w: 34%; --h: 46%; --c: #ff2a46; --r: -8deg"></span>
      <span style="--x: 54%; --y: 4%; --w: 30%; --h: 40%; --c: #9a3cff; --r: 6deg"></span>
      <span style="--x: 36%; --y: 38%; --w: 36%; --h: 44%; --c: #ff5a3a; --r: 2deg"></span>
      <span style="--x: 8%; --y: 52%; --w: 26%; --h: 34%; --c: #ffbf4a; --r: -4deg"></span>
      <span style="--x: 66%; --y: 50%; --w: 28%; --h: 38%; --c: #d8203c; --r: 9deg"></span>`;
    cardFront.appendChild(roseCast);
  }

  const bloodmoon = {
    reveal({ card }) {
      if (card && roseCast) restart(roseCast, "is-flooding");
    }
  };

  // ---- Art Deco Luxe: the Temple of Ra ----

  // The gate, the winged sun and the sunburst floor are the painting; the
  // sun's rays answer the reveal (see the scene's lights below).
  const deco = {};

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

  // ---- Sigils ----
  // Each realm's counterpart to Mystic's sigil, on the same frame: a rim
  // (viewBox ±300), a middle wheel (±250, 83.3% of the rim) and a hub
  // (±152, 50.7%), turning at Mystic's speeds with the middle wheel
  // reversed. Each wheel is drawn once with its glow; only its turn
  // and its surge animate.

  function glowFilter(id, color) {
    return `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/><feFlood flood-color="${color}" flood-opacity="0.9"/><feComposite in2="b" operator="in" result="v"/><feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="g"/><feMerge><feMergeNode in="v"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  }

  function wheel(id, radius, glow, body, defs = "") {
    return `<svg class="rs-layer" viewBox="${-radius} ${-radius} ${radius * 2} ${radius * 2}" fill="none" stroke="currentColor">
      <defs>${glowFilter(id, glow)}${defs}</defs><g filter="url(#${id})">${body}</g></svg>`;
  }

  // `count` ticks round a circle, `length` long across the line.
  function tickRing(r, count, length, width) {
    const period = (2 * Math.PI * r) / count;
    return `<circle r="${r}" stroke-width="${length}" stroke-dasharray="${width} ${(period - width).toFixed(3)}" stroke-dashoffset="${(width / 2).toFixed(3)}"/>`;
  }

  // Text centered on the arc from a0 to a1 (clockwise, reading outward).
  function arcText(id, r, a0, a1, text, size, spacing, className = "") {
    return `<path id="${id}" d="${arcPath(r, a0, a1)}" stroke="none"/>
      <text class="${className}" font-size="${size}" letter-spacing="${spacing}" text-anchor="middle" fill="currentColor" stroke="none"><textPath href="#${id}" startOffset="50%">${text}</textPath></text>`;
  }

  // A five-pointed star of outer radius s at (x, y).
  function star(x, y, s, rotation = 0) {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const [px, py] = polar(i % 2 ? s * 0.42 : s, i * 36 + rotation);
      points.push(pt([x + px, y + py]));
    }
    return `M${points.join(" L")} Z`;
  }

  // Metatron's cube: 13 circles and every line between their centers.
  function metatronBody(size, stroke) {
    const d = size * 0.375;
    const r = size * 0.1875;
    const centers = [[0, 0]];
    [d, 2 * d].forEach((dist) => {
      for (let i = 0; i < 6; i++) {
        centers.push(polar(dist, i * 60));
      }
    });
    const lines = [];
    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        lines.push(`M${pt(centers[i])}L${pt(centers[j])}`);
      }
    }
    const circles = centers.map(([x, y]) => `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}"/>`).join("");
    return `<path d="${lines.join("")}" stroke="${stroke}" stroke-width="${(size / 300).toFixed(2)}"/>
      <g stroke="${stroke}" stroke-width="${(size / 180).toFixed(2)}">${circles}</g>`;
  }

  function heptagrams(r, width) {
    const p = (step) => {
      const pts = [];
      for (let i = 0; i < 7; i++) pts.push(pt(polar(r, ((i * step) % 7) * (360 / 7))));
      return `M${pts.join(" L")} Z`;
    };
    return `<path d="${p(2)}" stroke-width="${width * 0.5}" stroke-opacity="0.6"/><path d="${p(3)}" stroke-width="${width}"/>`;
  }

  const SIGILS = {
    // Seven arcs in the rays' colours, numbered and named, round
    // Metatron's cube, with the heptagram of the seven at the hub.
    holo() {
      const span = 360 / 7;
      const rim = [
        `<circle r="290" stroke-width="0.9"/><circle r="286.5" stroke-width="0.35"/>`,
        tickRing(281, 360, 5, 0.45), tickRing(280, 70, 8, 0.8),
        ...SEVEN_RAYS.map((ray, i) => {
          const a0 = i * span + 1.6;
          const a1 = (i + 1) * span - 1.6;
          const [sx, sy] = polar(296, i * span);
          return `<path class="rs-ray" data-ray="${i}" d="${arcPath(266, a0, a1)}" stroke="${ray.color}" stroke-width="7"/>
            <path d="${arcPath(271.5, a0, a1)}${arcPath(260.5, a0, a1)}" stroke-width="0.6"/>
            <path d="M${sx.toFixed(2)},${(sy - 7).toFixed(2)} L${(sx + 1.6).toFixed(2)},${(sy - 1.6).toFixed(2)} L${(sx + 7).toFixed(2)},${sy.toFixed(2)} L${(sx + 1.6).toFixed(2)},${(sy + 1.6).toFixed(2)} L${sx.toFixed(2)},${(sy + 7).toFixed(2)} L${(sx - 1.6).toFixed(2)},${(sy + 1.6).toFixed(2)} L${(sx - 7).toFixed(2)},${sy.toFixed(2)} L${(sx - 1.6).toFixed(2)},${(sy - 1.6).toFixed(2)} Z" fill="currentColor" stroke="none"/>
            ${arcText(`rs-holo-name-${i}`, 247, a0, a1, `${NUMERALS[i]} · ${ray.name.toUpperCase()}`, 8.5, 1.1, "rs-text")}`;
        }),
        `<circle r="236" stroke-width="0.5"/><circle r="232.5" stroke-width="1.1"/>`
      ].join("");
      const mid = `<circle r="240" stroke-width="1.3" stroke-dasharray="0.01 3.4" stroke-linecap="round"/>
        ${metatronBody(243, "url(#rs-holo-spectrum)")}`;
      const midDefs = `<linearGradient id="rs-holo-spectrum" gradientUnits="userSpaceOnUse" x1="-240" y1="-240" x2="240" y2="240">${spectrumStops()}</linearGradient>`;
      const vertices = SEVEN_RAYS.map((ray, i) => {
        const [x, y] = polar(136, i * span);
        return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="6" fill="#07060d" stroke="${ray.color}" stroke-width="1.2"/><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="2.2" fill="${ray.color}" stroke="none"/>`;
      }).join("");
      const hub = `<circle r="146" stroke-dasharray="0.01 3.2" stroke-linecap="round" stroke-width="1.3"/>
        ${heptagrams(136, 0.8)}<circle r="62" stroke-width="0.6"/><circle r="58" stroke-width="0.3"/>${vertices}`;
      return { glow: "#a98bff", rim, mid, midDefs, hub };
    },

    // The sixteen figures with their names, ticking round like a clock;
    // all 64 hexagrams as six rings of bits; a reticle with a sweep.
    terminal() {
      const rim = [
        `<circle r="290" stroke-width="0.8" stroke-dasharray="44.6 1.5"/><circle r="286" stroke-width="0.35"/>`,
        tickRing(280, 128, 6, 0.6), tickRing(279, 16, 12, 1.4),
        ...FIGURES.map(([name, bits], k) => {
          const a = k * 22.5 + 11.25;
          const dots = [];
          for (let row = 0; row < 4; row++) {
            const r = 270 - row * 7.5;
            const spread = (4.6 / r) / DEG;
            ((bits >> (3 - row)) & 1 ? [0] : [-spread, spread]).forEach((da) => {
              const [x, y] = polar(r, a + da);
              dots.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="2.3"/>`);
            });
          }
          return `<g fill="currentColor" stroke="none">${dots.join("")}</g>
            ${arcText(`rs-geo-name-${k}`, 232, a - 10.5, a + 10.5, name, 7, 0.5, "rs-mono")}`;
        }),
        `<circle r="224" stroke-width="0.5"/><circle r="220" stroke-width="1" stroke-dasharray="2 3"/>`
      ].join("");
      // Shao Yong's binary order, the sequence Leibniz recognised as
      // counting in base two: the bottom line on the innermost ring.
      const lines = [];
      for (let k = 0; k < 64; k++) {
        const a = k * 5.625;
        for (let line = 0; line < 6; line++) {
          const r = 196 + line * 6.3;
          if ((k >> line) & 1) {
            lines.push(arcPath(r, a + 0.6, a + 5.025));
          } else {
            lines.push(arcPath(r, a + 0.6, a + 2.35), arcPath(r, a + 3.275, a + 5.025));
          }
        }
      }
      const mid = `<circle r="236" stroke-width="0.6"/><circle r="232" stroke-width="0.3" stroke-dasharray="1 2"/>
        <path d="${lines.join("")}" stroke-width="2.2"/>
        <circle r="188" stroke-width="0.6"/>${tickRing(183, 64, 5, 0.7)}`;
      const brackets = [45, 135, 225, 315].map((a) => arcPath(146, a - 11, a + 11)).join("");
      const cross = [0, 90, 180, 270].map((a) => `M${pt(polar(104, a))} L${pt(polar(150, a))}`).join("");
      const bearings = [0, 90, 180, 270].map((a) => {
        const [x, y] = polar(114, a + 6);
        return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" transform="rotate(${a + 6} ${x.toFixed(2)} ${y.toFixed(2)})" class="rs-mono" font-size="7" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none">${String(a).padStart(3, "0")}</text>`;
      }).join("");
      const hub = `<circle r="140" stroke-width="1"/><path d="${brackets}" stroke-width="2.6"/>
        ${tickRing(131, 36, 6, 0.8)}<circle r="124" stroke-width="0.4" stroke-dasharray="1 3"/>
        <path d="${cross}" stroke-width="0.8"/>${bearings}<circle r="62" stroke-width="0.6"/>`;
      return { glow: "#22ff7f", rim, mid, hub };
    },

    // Gothic tracery and roundels in stone, twelve lancets of jewel
    // glass, and a crown of thorns round the eclipsed moon.
    bloodmoon() {
      const scallops = [];
      const trefoils = [];
      const pinnacles = [];
      for (let i = 0; i < 24; i++) {
        const a = i * 15;
        scallops.push(`${i ? "" : `M${pt(polar(258, a))}`} Q${pt(polar(281, a + 7.5))} ${pt(polar(258, a + 15))}`);
        const [x, y] = polar(267, a + 7.5);
        trefoils.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.2" stroke-width="0.6"/>`);
        if (i % 2 === 0) {
          pinnacles.push(`M${pt(polar(292, a - 2.2))} L${pt(polar(300, a))} L${pt(polar(292, a + 2.2))}`);
        }
      }
      const roundels = [];
      for (let i = 0; i < 48; i++) {
        const [x, y] = polar(246, i * 7.5 + 3.75);
        roundels.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="2.4" fill="${i % 2 ? "#c4202f" : "currentColor"}" fill-opacity="0.55" stroke="none"/>`);
      }
      const rim = `<circle r="292" stroke-width="1.6"/><circle r="287" stroke-width="0.5"/>
        <path d="${pinnacles.join(" ")}" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="${scallops.join(" ")}" stroke-width="1.4"/>${trefoils.join("")}${roundels.join("")}
        <circle r="238" stroke-width="1.6"/><circle r="234" stroke-width="0.5"/>`;
      const petals = [];
      const jewels = [];
      for (let i = 0; i < 12; i++) {
        const a = i * 30;
        petals.push(`<path d="${lancet(132, 226, a, 12)}" fill="#c4202f" fill-opacity="0.07" stroke-width="0.9"/>
          <path d="${lancet(146, 206, a, 6.5)}" stroke-width="0.45"/>`);
        const [jx, jy] = polar(194, a);
        const [tx, ty] = polar(214, a + 15);
        jewels.push(`<circle cx="${jx.toFixed(2)}" cy="${jy.toFixed(2)}" r="7.5" stroke-width="0.6"/>
          <circle cx="${tx.toFixed(2)}" cy="${ty.toFixed(2)}" r="6" fill="#c4202f" fill-opacity="0.35" stroke-width="0.6"/>`);
      }
      const mid = `<circle r="231" stroke-width="1.4"/>${petals.join("")}${jewels.join("")}<circle r="128" stroke-width="1.4"/>`;
      const vine = (phase) => {
        const pts = [];
        for (let a = 0; a <= 360; a += 3) pts.push(pt(polar(138 + 5.5 * Math.sin((a * 8 + phase) * DEG), a)));
        return `M${pts.join(" L")}`;
      };
      const thorns = [];
      for (let i = 0; i < 48; i++) {
        const a = i * 7.5 + 2;
        const phase = i % 2 ? 180 : 0;
        const r = 138 + 5.5 * Math.sin((a * 8 + phase) * DEG);
        const out = i % 4 < 2 ? 10 : -9;
        thorns.push(`M${pt(polar(r, a - 1.3))} L${pt(polar(r + out, a + 0.8))} L${pt(polar(r, a + 1.5))} Z`);
      }
      const roses = [];
      for (let i = 0; i < 6; i++) {
        const [x, y] = polar(138, i * 60 + 15);
        roses.push(`<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><circle r="7.5" fill="#5a0814" stroke-width="0.7"/><path d="M0,-4 C3.4,-4 4.6,-0.6 2.6,2 C0.6,4 -3.4,3.4 -4,0 C-4,-2.6 -1.4,-4 0.6,-2.6 C2.6,-1.4 2,1.4 0,1.4" stroke="#24050b" stroke-width="1"/></g>`);
      }
      const hub = `<path d="${vine(0)}" stroke-width="1.7"/><path d="${vine(180)}" stroke-width="1.2"/>
        <path d="${thorns.join(" ")}" fill="currentColor" stroke="none"/>${roses.join("")}
        <circle r="118" stroke-width="0.5" stroke-dasharray="1 4"/>
        <circle r="70" stroke-width="0.6"/><circle r="64" stroke="#c4202f" stroke-width="3" stroke-opacity="0.85"/>`;
      return { glow: "#ff2a3c", rim, mid, hub };
    },

    // A stepped sunburst with the 36 decan stars, a band of cartouches
    // with deco chevrons between them, and a lotus rosette.
    deco() {
      const crown = [];
      for (let k = 0; k < 36; k++) {
        const a = k * 10;
        const tip = k % 2 ? 283 : 299;
        const half = k % 2 ? 1.5 : 2;
        crown.push(`M${pt(polar(261, a - half * 0.5))} L${pt(polar(272, a - half))} L${pt(polar(tip, a))} L${pt(polar(272, a + half))} L${pt(polar(261, a + half * 0.5))} Z`);
      }
      const stars = [];
      for (let k = 0; k < 36; k++) {
        const [x, y] = polar(241, k * 10 + 5);
        stars.push(star(x, y, 6.2, k * 10 + 5));
      }
      const rim = `<path d="${crown.join(" ")}" fill="currentColor" fill-opacity="0.6" stroke="none"/>
        <circle r="258" stroke-width="1.4"/><circle r="254" stroke-width="0.5"/>
        <path d="${stars.join(" ")}" fill="currentColor" stroke="none"/>
        <circle r="228" stroke-width="0.5"/><circle r="223.5" stroke-width="2.8" stroke-dasharray="0.9 4.2" stroke-linecap="round"/>`;
      const GLYPHS = [
        // ankh
        '<ellipse cx="0" cy="-9" rx="4.6" ry="6"/><path d="M0,-3 L0,13 M-7,-1 L7,-1"/>',
        // djed
        '<path d="M-2.6,14 L-2.6,-11 M2.6,14 L2.6,-11 M-7,-12 L7,-12 M-7,-8 L7,-8 M-7,-4 L7,-4 M-5,14 L5,14"/>',
        // was sceptre
        '<path d="M0,14 L0,-11 L5,-13.5 L7.5,-10.5 M0,14 L-3,10.5 M0,14 L3,10.5"/>',
        // wedjat eye
        '<path d="M-9,-2 Q0,-9 9,-2 Q0,4 -9,-2 Z M-9,-7.5 Q0,-12.5 9,-7.5 M-2,3 L-4,12 M2,3 Q5,10 9,9"/><circle cx="0" cy="-2.6" r="2.4" fill="currentColor" stroke="none"/>',
        // scarab under the sun
        '<circle cx="0" cy="-12" r="2.8"/><ellipse cx="0" cy="3" rx="5" ry="7"/><circle cx="0" cy="-6" r="2.4"/><path d="M0,-4 L0,10 M-5,0 L-9,-3 M5,0 L9,-3 M-5,6 L-9,9 M5,6 L9,9"/>',
        // feather of Ma'at
        '<path d="M0,14 L0,-13 M0,-13 Q7,-7 5,4 Q3,10 0,12 M0,-8 L4,-5 M0,-3 L4.6,0 M0,2 L3.8,5"/>'
      ];
      const cartouches = [];
      for (let k = 0; k < 12; k++) {
        const a = k * 30;
        const [x, y] = polar(190, a);
        const [cx, cy] = polar(190, a + 15);
        cartouches.push(`<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${a})">
            <rect x="-12" y="-22" width="24" height="44" rx="12" stroke-width="1.2"/><path d="M-13,25 L13,25" stroke-width="2"/>
            <g stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[k % GLYPHS.length]}</g></g>
          <g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${a + 15})"><path d="M-6,4 L0,-2 L6,4 M-6,10 L0,4 L6,10 M-6,-2 L0,-8 L6,-2" stroke-width="1.1"/></g>`);
      }
      const mid = `<circle r="232" stroke-width="1"/><circle r="228" stroke-width="0.4"/>${cartouches.join("")}
        <circle r="158" stroke-width="1"/><circle r="154" stroke-width="0.4"/>`;
      const petals = [];
      for (let k = 0; k < 16; k++) {
        const a = k * 22.5;
        const b = a + 11.25;
        petals.push(`<path d="M${pt(polar(72, b))} Q${pt(polar(96, b - 8))} ${pt(polar(114, b))} Q${pt(polar(96, b + 8))} ${pt(polar(72, b))} Z" fill="#1f4aa8" fill-opacity="0.16" stroke-width="0.7"/>`);
      }
      for (let k = 0; k < 16; k++) {
        const a = k * 22.5;
        petals.push(`<path d="M${pt(polar(72, a))} Q${pt(polar(108, a - 9.5))} ${pt(polar(138, a))} Q${pt(polar(108, a + 9.5))} ${pt(polar(72, a))} Z" fill="#1f4aa8" fill-opacity="0.24" stroke-width="1"/>
          <path d="M${pt(polar(80, a))} L${pt(polar(128, a))}" stroke-width="0.5"/>`);
      }
      const hub = `<circle r="145" stroke-width="2.6" stroke-dasharray="0.9 4.4" stroke-linecap="round"/>${petals.join("")}
        <circle r="66" stroke-width="1.2"/><circle r="62" stroke-width="0.5"/>`;
      return { glow: "#ffb347", rim, mid, hub };
    }
  };

  function sigilMarkup(key) {
    const s = SIGILS[key]();
    return `<div class="realm-sigil">
      <span class="rs-aura"></span><span class="rs-tint"></span>
      <div class="rs-spin rs-spin-rim"><div class="rs-stir">${wheel(`rs-${key}-rim`, 300, s.glow, s.rim)}</div></div>
      <div class="rs-spin rs-spin-mid"><div class="rs-stir">${wheel(`rs-${key}-mid`, 250, s.glow, s.mid, s.midDefs || "")}</div></div>
      <div class="rs-spin rs-spin-hub"><div class="rs-stir">${wheel(`rs-${key}-hub`, 152, s.glow, s.hub)}</div></div>
      <span class="rs-sweep"></span><span class="rs-ping"></span>
    </div>`;
  }

  // ---- Major halos ----
  // Each realm's own halo in place of Mystic's star chart, blooming
  // behind the turning card the same way (.major-halo in style.css).

  function rays(count, r0, longR, shortR, half, fill) {
    const d = [];
    for (let k = 0; k < count; k++) {
      const a = (k * 360) / count;
      const tip = k % 2 ? shortR : longR;
      d.push(`M${pt(polar(r0, a - half))} L${pt(polar(tip, a))} L${pt(polar(r0, a + half))} Z`);
    }
    return `<path d="${d.join(" ")}" fill="${fill}"/>`;
  }

  function fade(id, color, from = 0.25) {
    return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="100"><stop offset="${from}" stop-color="${color}" stop-opacity="0.95"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
  }

  const HALOS = {
    holo: () => `<defs>${fade("rh-holo", "#ffffff")}</defs>
      ${rays(56, 34, 99, 78, 0.9, "url(#rh-holo)")}
      ${SEVEN_RAYS.map((ray, i) => `<path d="${arcPath(70, i * (360 / 7) + 1, (i + 1) * (360 / 7) - 1)}" stroke="${ray.color}" stroke-width="2.4" fill="none"/>`).join("")}
      <circle r="76" fill="none" stroke="#fff" stroke-width="0.4"/><circle r="64" fill="none" stroke="#fff" stroke-width="0.3" stroke-dasharray="0.6 2"/>`,
    terminal: () => `<g fill="none" stroke="#22ff7f">
      <circle r="56" stroke-width="1"/><circle r="64" stroke-width="0.5" stroke-dasharray="2 2"/>
      <circle r="80" stroke-width="1.6" stroke-dasharray="10 3"/><circle r="92" stroke-width="0.5"/>
      ${tickRing(86, 72, 4, 0.5)}
      <path d="${[45, 135, 225, 315].map((a) => arcPath(97, a - 9, a + 9)).join("")}" stroke-width="2.4"/>
      <path d="${[0, 90, 180, 270].map((a) => `M${pt(polar(58, a))} L${pt(polar(100, a))}`).join("")}" stroke-width="0.6"/></g>`,
    bloodmoon: () => `<defs>${fade("rh-blood", "#ff3a4c", 0.3)}</defs>
      ${rays(36, 44, 99, 74, 2.2, "url(#rh-blood)")}
      <circle r="52" fill="none" stroke="#c4202f" stroke-width="2"/>
      <path d="${Array.from({ length: 24 }, (_, k) => `M${pt(polar(58, k * 15 - 3))} L${pt(polar(66, k * 15))} L${pt(polar(58, k * 15 + 3))}`).join(" ")}" fill="none" stroke="#c9c3c8" stroke-width="0.8"/>`,
    deco: () => `<defs>${fade("rh-deco", "#ffd27a", 0.3)}</defs>
      ${rays(48, 40, 99, 80, 1.6, "url(#rh-deco)")}
      <circle r="60" fill="none" stroke="#e8c368" stroke-width="2.4" stroke-dasharray="0.8 3.6" stroke-linecap="round"/>
      <circle r="54" fill="none" stroke="#e8c368" stroke-width="0.8"/>`
  };

  function showHalo(key) {
    if (!majorHalo) return;
    const old = majorHalo.querySelector(".realm-halo");
    if (old) old.remove();
    if (!HALOS[key]) return;
    majorHalo.insertAdjacentHTML("beforeend", `<svg class="realm-halo" viewBox="-100 -100 200 200" aria-hidden="true">${HALOS[key]()}</svg>`);
  }

  // ---- The painted scene and its light ----
  // The painting recedes behind a scrim that pools light round the card
  // and the scene's own light source. That light lives on top as plain
  // layers - glows, shafts, a ray fan, a beam - set on the painting by
  // fractions of its size (x across, y down), so they stay on the window,
  // sun, prism or attractor however the screen crops it.

  const PAINTING_SIZE = { portrait: [1152, 2048], landscape: [2048, 1152] };
  const portraitQuery = window.matchMedia("(orientation: portrait)");

  const SCENES = {
    bloodmoon: {
      portrait: { src: [0.5, 0.11], candles: [[0.06, 0.45], [0.95, 0.45], [0.265, 0.575], [0.355, 0.575], [0.625, 0.575], [0.72, 0.575]] },
      landscape: { src: [0.5, 0.18], candles: [[0.11, 0.44], [0.89, 0.44], [0.32, 0.53], [0.68, 0.53], [0.21, 0.5], [0.79, 0.5]] }
    },
    deco: {
      portrait: { src: [0.5, 0.166], floor: [0.5, 0.95], torches: [[0.245, 0.7], [0.755, 0.7]] },
      landscape: { src: [0.5, 0.19], floor: [0.5, 0.975], torches: [[0.105, 0.6], [0.895, 0.6]] }
    },
    holo: {
      portrait: { src: [0.5, 0.125], from: [0.11, 0], to: [1.02, 0.33] },
      landscape: { src: [0.5, 0.26], from: [0.16, 0], to: [1.01, 0.56] }
    },
    terminal: {
      portrait: { src: [0.5, 0.11] },
      landscape: { src: [0.5, 0.27] }
    }
  };

  const scene = document.createElement("div");
  scene.className = "realm-scene";
  scene.setAttribute("aria-hidden", "true");
  scene.innerHTML = '<div class="realm-painting"></div><span class="realm-scrim"></span><div class="realm-lights"></div>';
  document.body.prepend(scene);
  const painting = scene.querySelector(".realm-painting");
  const lightsEl = scene.querySelector(".realm-lights");

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

  // The painting is background-size: cover, centered: map its fractions
  // to the screen. w is the painting's width on screen.
  function coverMap() {
    const [pw, ph] = PAINTING_SIZE[orientation()];
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.max(vw / pw, vh / ph);
    const ox = (vw - pw * scale) / 2;
    const oy = (vh - ph * scale) / 2;
    return {
      at: ([fx, fy]) => [ox + fx * pw * scale, oy + fy * ph * scale],
      w: pw * scale
    };
  }

  // A light centered at (x, y), `size` px across.
  function lightAt(className, [x, y], size, style = "") {
    return `<span class="${className}" style="left:${(x - size / 2).toFixed(1)}px;top:${(y - size / 2).toFixed(1)}px;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;${style}"></span>`;
  }

  // A band from a to b, `width` px across; its children run along it.
  function bandFrom(className, [ax, ay], [bx, by], width, inner = "") {
    const length = Math.hypot(bx - ax, by - ay);
    const angle = Math.atan2(by - ay, bx - ax) / DEG;
    return `<span class="${className}" style="left:${ax.toFixed(1)}px;top:${(ay - width / 2).toFixed(1)}px;width:${length.toFixed(1)}px;height:${width.toFixed(1)}px;transform:rotate(${angle.toFixed(2)}deg)">${inner}</span>`;
  }

  // Shapes of light drawn once, as one screen-sized SVG: shafts, beams
  // and fans are polygons filled with gradients, so nothing is clipped
  // or masked while it animates - only the whole layer's opacity moves.
  function screenSvg(className, defs, body) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return `<svg class="${className}" width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}"><defs>${defs}</defs>${body}</svg>`;
  }

  // A tapered band from a (wa across) to b (wb across).
  function taper([ax, ay], [bx, by], wa, wb) {
    const length = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / length;
    const ny = (bx - ax) / length;
    return [
      [ax + nx * wa / 2, ay + ny * wa / 2], [bx + nx * wb / 2, by + ny * wb / 2],
      [bx - nx * wb / 2, by - ny * wb / 2], [ax - nx * wa / 2, ay - ny * wa / 2]
    ].map(pt).join(" ");
  }

  function linear(id, [ax, ay], [bx, by], stops) {
    return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  }

  const LIGHTS = {
    // The rose window glows, shafts of red light fall from it through
    // the nave in two sets that breathe out of step, the candles flicker,
    // and dust drifts in the light.
    bloodmoon({ at, w }, s) {
      const src = at(s.src);
      const floorY = window.innerHeight * 1.04;
      const sets = [[], []];
      const defs = [];
      [-30, -17, -5, 7, 19, 31].forEach((tilt, i) => {
        const length = (floorY - src[1]) / Math.cos(tilt * DEG);
        const end = [src[0] + Math.sin(tilt * DEG) * length, src[1] + Math.cos(tilt * DEG) * length];
        defs.push(linear(`rl-shaft-${i}`, src, end, [[0, "rgba(255,84,90,0.36)"], [0.45, "rgba(200,20,40,0.15)"], [0.92, "rgba(200,20,40,0)"]]));
        sets[i % 2].push(`<polygon points="${taper(src, end, w * 0.03, w * (0.11 + (i % 3) * 0.03))}" fill="url(#rl-shaft-${i})"/>`);
      });
      const candles = s.candles.map((c, i) => lightAt("rl-candle", at(c), w * 0.075, `--i:${i}`)).join("");
      // The second set uses the gradients defined with the first.
      return `${screenSvg("rl-shafts", defs.join(""), sets[0].join(""))}${screenSvg("rl-shafts rl-shafts-b", "", sets[1].join(""))}
        ${lightAt("rl-glow", src, w * 0.62)}${lightAt("rl-flare", src, w * 0.9)}${candles}<span class="rl-motes"></span>`;
    },

    // The sun's rays turn slowly behind the winged disc and flare on a
    // reveal; the torches flicker and the floor's sunburst breathes.
    deco({ at, w }, s) {
      const src = at(s.src);
      const size = Math.min(window.innerHeight * 1.15, 1500);
      const r = size / 2;
      const rays = [];
      for (let k = 0; k < 60; k++) {
        const a = k * 6;
        const reach = k % 2 ? r * 0.72 : r;
        rays.push(`M${pt(polar(r * 0.03, a - 0.7))} L${pt(polar(reach, a - 0.7))} L${pt(polar(reach, a + 0.7))} Z`);
      }
      const fan = `<svg class="rl-fan" style="left:${(src[0] - r).toFixed(1)}px;top:${(src[1] - r).toFixed(1)}px" width="${size.toFixed(0)}" height="${size.toFixed(0)}" viewBox="${-r} ${-r} ${size} ${size}">
        <defs><radialGradient id="rl-fan-fade" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="${r.toFixed(1)}"><stop offset="0.04" stop-color="rgba(255,214,140,0.34)"/><stop offset="0.4" stop-color="rgba(255,206,130,0.12)"/><stop offset="1" stop-color="rgba(255,206,130,0)"/></radialGradient></defs>
        <path d="${rays.join(" ")}" fill="url(#rl-fan-fade)"/></svg>`;
      const torches = s.torches.map((c, i) => lightAt("rl-candle rl-torch", at(c), w * 0.12, `--i:${i}`)).join("");
      return `${fan}${lightAt("rl-glow", src, w * 0.6)}${lightAt("rl-flare", src, w * 1.1)}
        ${lightAt("rl-floor", at(s.floor), w * 0.7)}${torches}<span class="rl-motes"></span>`;
    },

    // Pulses of white light run down the beam into the prism, which
    // glows and casts its spectrum; sparks drift in the crystal field.
    holo({ at, w }, s) {
      const src = at(s.src);
      const from = at(s.from);
      const to = at(s.to);
      const beam = screenSvg("rl-beam",
        linear("rl-beam-fade", from, src, [[0, "rgba(255,255,255,0)"], [0.45, "rgba(255,255,255,0.16)"], [1, "rgba(255,255,255,0.42)"]]),
        `<polygon points="${taper(from, src, w * 0.05, w * 0.03)}" fill="url(#rl-beam-fade)"/><polygon points="${taper(from, src, w * 0.014, w * 0.01)}" fill="url(#rl-beam-fade)"/>`);
      // Colour runs across the fan, fading along it.
      const length = Math.hypot(to[0] - src[0], to[1] - src[1]);
      const nx = -(to[1] - src[1]) / length;
      const ny = (to[0] - src[0]) / length;
      const mid = [(src[0] + to[0]) / 2, (src[1] + to[1]) / 2];
      const half = w * 0.09;
      const across = linear("rl-spectrum-across", [mid[0] - nx * half, mid[1] - ny * half], [mid[0] + nx * half, mid[1] + ny * half],
        ["#a86bff", "#4b8bff", "#3ee09a", "#ffd84b", "#ff9a3b", "#ff4b4b"].map((c, i) => [(i / 5).toFixed(2), c]));
      const along = linear("rl-spectrum-along", src, to, [[0, "#fff"], [0.55, "#777"], [1, "#000"]]);
      const fan = screenSvg("rl-spectrum", `${across}${along}<mask id="rl-spectrum-mask"><polygon points="${taper(src, to, w * 0.01, w * 0.2)}" fill="url(#rl-spectrum-along)"/></mask>`,
        `<polygon points="${taper(src, to, w * 0.01, w * 0.2)}" fill="url(#rl-spectrum-across)" mask="url(#rl-spectrum-mask)"/>`);
      return `${beam}${bandFrom("rl-pulse-track", from, src, w * 0.06, '<span class="rl-pulse"></span>')}${fan}
        ${lightAt("rl-glow", src, w * 0.42)}${lightAt("rl-flare", src, w * 0.8)}<span class="rl-motes"></span>`;
    },

    // The attractor's glow breathes; the rain does the rest.
    terminal({ at, w }, s) {
      const src = at(s.src);
      return `${lightAt("rl-glow", src, w * 0.85)}${lightAt("rl-flare", src, w * 1.1)}`;
    }
  };

  // Lights, and the scrim's pools of light round the card and the source.
  function placeLights() {
    if (!activeKey || !LIGHTS[activeKey]) return;
    const config = SCENES[activeKey][orientation()];
    const map = coverMap();
    const [sx, sy] = map.at(config.src);
    scene.style.setProperty("--src-x", `${sx.toFixed(1)}px`);
    scene.style.setProperty("--src-y", `${sy.toFixed(1)}px`);
    lightsEl.innerHTML = LIGHTS[activeKey](map, config);
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
    const vars = {
      "--cx": rect.left + rect.width / 2,
      "--cy": rect.top + rect.height / 2,
      "--cw": rect.width,
      "--ch": rect.height,
      "--top": rect.top,
      "--left": rect.left
    };
    Object.entries(vars).forEach(([name, value]) => back.style.setProperty(name, `${value.toFixed(1)}px`));
    scene.style.setProperty("--cx", `${vars["--cx"].toFixed(1)}px`);
    scene.style.setProperty("--cy", `${vars["--cy"].toFixed(1)}px`);
  }

  function mount() {
    const key = root.getAttribute("data-theme") || "";
    if (key === activeKey && active) return;
    if (active && active.unmount) active.unmount();
    back.innerHTML = "";
    back.className = "realm";
    lightsEl.innerHTML = "";
    activeKey = key;
    active = REALMS[key] || null;
    scene.dataset.scene = active ? key : "";
    showHalo(active ? key : "");
    if (!active) {
      painting.style.backgroundImage = "";
      paintingUrl = "";
      scene.classList.remove("is-loaded");
      return;
    }
    back.classList.add(`realm-${key}`);
    back.innerHTML = sigilMarkup(key);
    anchor();
    if (active.build) active.build();
    showPainting();
    placeLights();
  }

  let relayoutTimer = null;
  function relayout() {
    anchor();
    clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(() => {
      if (!active) return;
      showPainting();
      placeLights();
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

  // Every reveal, card or dice: the sigil's wheels surge and the scene's
  // light flares, as Mystic's sigil does; then the realm's own beat.
  document.addEventListener("tarot:reveal", (event) => {
    if (!active) return;
    const detail = event.detail || {};
    const sigil = back.querySelector(".realm-sigil");
    if (sigil) {
      sigil.classList.toggle("is-major", Boolean(detail.major));
      restart(sigil, "is-surging");
    }
    lightsEl.classList.toggle("is-major", Boolean(detail.major));
    restart(lightsEl, "is-surging");
    if (active.reveal) active.reveal(detail);
  });

  // The shuffle stirs the wheels.
  if (cardEl) {
    let wasShuffling = false;
    new MutationObserver(() => {
      const shuffling = cardEl.classList.contains("shuffling");
      if (shuffling && !wasShuffling && active) {
        const sigil = back.querySelector(".realm-sigil");
        if (sigil) restart(sigil, "is-stirring");
      }
      wasShuffling = shuffling;
    }).observe(cardEl, { attributes: true, attributeFilter: ["class"] });
  }

  mount();
})();
