// ---- Deck data ----

const MAJOR_ARCANA = [
  "The Fool", "The Magician", "The High Priestess", "The Empress",
  "The Emperor", "The Hierophant", "The Lovers", "The Chariot",
  "Strength", "The Hermit", "Wheel of Fortune", "Justice",
  "The Hanged Man", "Death", "Temperance", "The Devil",
  "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
];

const MINOR_SUITS = ["Wands", "Cups", "Swords", "Pentacles"];
const MINOR_RANKS = [
  "Ace", "Two", "Three", "Four", "Five", "Six", "Seven",
  "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"
];

const MAJOR_COLORS = {
  "The Fool": "#e8c34a",
  "The Magician": "#f2c14e",
  "The High Priestess": "#4a5d8f",
  "The Empress": "#6b9c5e",
  "The Emperor": "#b0453c",
  "The Hierophant": "#a35c3a",
  "The Lovers": "#c9b64a",
  "The Chariot": "#7a8ea3",
  "Strength": "#d98a3d",
  "The Hermit": "#8a7550",
  "Wheel of Fortune": "#5b4a8a",
  "Justice": "#4a7a9c",
  "The Hanged Man": "#3f7a72",
  "Death": "#3a2a3f",
  "Temperance": "#7a5ca3",
  "The Devil": "#5a2e2e",
  "The Tower": "#c1442e",
  "The Star": "#7ec8d9",
  "The Moon": "#4a4a7a",
  "The Sun": "#e8b23d",
  "Judgement": "#d1603a",
  "The World": "#3f8a6a"
};

const SUIT_COLORS = {
  "Wands": "#c9622f",
  "Cups": "#3f6fa3",
  "Swords": "#8fa3b0",
  "Pentacles": "#5a8a52"
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildDeck() {
  const deck = MAJOR_ARCANA.map(name => ({
    name,
    arcana: "Major Arcana",
    color: MAJOR_COLORS[name],
    slug: slugify(name)
  }));

  for (const suit of MINOR_SUITS) {
    for (const rank of MINOR_RANKS) {
      const name = `${rank} of ${suit}`;
      deck.push({
        name,
        arcana: "Minor Arcana",
        color: SUIT_COLORS[suit],
        slug: slugify(name)
      });
    }
  }

  return deck;
}

const DECK = buildDeck();

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let random = mulberry32(Date.now());

function reseedRandom() {
  random = mulberry32(Date.now() ^ performance.now() * 1000);
}

function pullCard() {
  const card = DECK[Math.floor(random() * DECK.length)];
  const reversed = random() < 0.5;
  return { ...card, reversed };
}

const cardEl = document.getElementById("card");
const arcanaLabelEl = document.getElementById("arcanaLabel");
const cardNameEl = document.getElementById("cardName");
const hintEl = document.getElementById("hint");
const shuffleBtn = document.getElementById("shuffleBtn");
const menuToggle = document.getElementById("menuToggle");
const historyPanel = document.getElementById("historyPanel");
const historyBody = document.getElementById("historyBody");
const historyCount = document.getElementById("historyCount");
const cardArtEl = document.getElementById("cardArt");
const cardArtImgEl = document.getElementById("cardArtImg");
const cardArtFallbackEl = document.getElementById("cardArtFallback");

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

function loadCardArt(card) {
  let i = 0;

  function tryNext() {
    if (i >= IMAGE_EXTENSIONS.length) {
      cardArtImgEl.removeAttribute("src");
      cardArtImgEl.classList.remove("loaded");
      cardArtFallbackEl.classList.remove("hidden");
      return;
    }

    const ext = IMAGE_EXTENSIONS[i++];
    cardArtImgEl.src = `images/${card.slug}.${ext}`;
  }

  cardArtImgEl.onload = () => {
    cardArtImgEl.classList.add("loaded");
    cardArtFallbackEl.classList.add("hidden");
  };

  cardArtImgEl.onerror = tryNext;
  tryNext();
}

let isFlipped = false;
let isMenuOpen = false;
let pullHistory = [];

function renderHistory() {
  if (pullHistory.length === 0) {
    historyBody.innerHTML = '<tr><td colspan="3" class="history-empty">No pulls yet</td></tr>';
    historyCount.textContent = "0 / 10";
    return;
  }

  const rows = pullHistory
    .slice(0, 10)
    .map((entry) => {
      const type = getCardTypeSymbol(entry.card);
      return `
      <tr>
        <td class="history-type" title="${type.label}" aria-label="${type.label}">${type.symbol}</td>
        <td>${entry.card.name}</td>
        <td class="history-state" title="${entry.card.reversed ? "Reversed" : "Upright"}" aria-label="${entry.card.reversed ? "Reversed" : "Upright"}">${entry.card.reversed ? "↓" : "↑"}</td>
      </tr>
    `;
    })
    .join("");

  historyBody.innerHTML = rows;
  historyCount.textContent = `${pullHistory.length} / 10`;
}

function getCardTypeSymbol(card) {
  if (card.arcana === "Major Arcana") {
    return { symbol: "✦", label: "Major Arcana" };
  }

  const suitSymbols = {
    Wands: ["♢", "Wands"],
    Cups: ["♡", "Cups"],
    Swords: ["⚔", "Swords"],
    Pentacles: ["⬟", "Pentacles"]
  };
  const [symbol, label] = suitSymbols[card.name.split(" of ").pop()];
  return { symbol, label };
}

function addToHistory(card) {
  pullHistory.unshift({ index: pullHistory.length + 1, card });
  pullHistory = pullHistory.slice(0, 10);
  pullHistory = pullHistory.map((entry, idx) => ({ ...entry, index: idx + 1 }));
  renderHistory();
}

function showCard(card) {
  arcanaLabelEl.textContent = card.arcana;
  cardNameEl.textContent = card.name;
  cardArtEl.style.setProperty("--card-color", card.color);
  cardArtEl.classList.toggle("is-reversed", card.reversed);
  loadCardArt(card);
  addToHistory(card);

  if (!isFlipped) {
    cardEl.classList.add("flipped");
    isFlipped = true;
  }

  hintEl.textContent = "Tap anywhere to draw again";
}

function setMenuOpen(open) {
  isMenuOpen = open;
  historyPanel.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
}

function toggleMenu() {
  setMenuOpen(!isMenuOpen);
}

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMenu();
});

document.addEventListener("click", (event) => {
  if (event.target.closest("#shuffleBtn")) {
    return;
  }

  if (event.target.closest("#menuToggle")) {
    return;
  }

  if (event.target.closest("#historyPanel")) {
    return;
  }

  const card = pullCard();
  showCard(card);
});

shuffleBtn.addEventListener("click", () => {
  cardEl.classList.remove("flipped");
  isFlipped = false;

  arcanaLabelEl.textContent = "Major Arcana";
  cardNameEl.textContent = "\u2014";
  cardArtEl.classList.remove("is-reversed");
  cardArtImgEl.onload = null;
  cardArtImgEl.onerror = null;
  cardArtImgEl.removeAttribute("src");
  cardArtImgEl.classList.remove("loaded");
  cardArtFallbackEl.classList.remove("hidden");
  hintEl.textContent = "Tap anywhere to pull a card";

  reseedRandom();

  cardEl.classList.remove("shuffling");
  void cardEl.offsetWidth;
  cardEl.classList.add("shuffling");
});

cardEl.addEventListener("animationend", () => {
  cardEl.classList.remove("shuffling");
});

renderHistory();
setMenuOpen(false);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(err => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
