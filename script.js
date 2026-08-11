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

function buildDeck() {
  const deck = MAJOR_ARCANA.map(name => ({ name, arcana: "Major Arcana" }));
  for (const suit of MINOR_SUITS) {
    for (const rank of MINOR_RANKS) {
      deck.push({ name: `${rank} of ${suit}`, arcana: "Minor Arcana" });
    }
  }
  return deck;
}

const DECK = buildDeck(); // 78 cards total

// ---- Pull / shuffle logic ----

// Pull with replacement: every draw is independent, no state to track.
function pullCard() {
  const card = DECK[Math.floor(Math.random() * DECK.length)];
  const reversed = Math.random() < 0.5;
  return { ...card, reversed };
}

// ---- DOM wiring ----

const cardEl = document.getElementById("card");
const arcanaLabelEl = document.getElementById("arcanaLabel");
const cardNameEl = document.getElementById("cardName");
const cardOrientationEl = document.getElementById("cardOrientation");
const hintEl = document.getElementById("hint");
const pullBtn = document.getElementById("pullBtn");
const shuffleBtn = document.getElementById("shuffleBtn");

let isFlipped = false;

function showCard(card) {
  arcanaLabelEl.textContent = card.arcana;
  cardNameEl.textContent = card.name;
  cardOrientationEl.textContent = card.reversed ? "Reversed" : "Upright";

  if (!isFlipped) {
    cardEl.classList.add("flipped");
    isFlipped = true;
  }

  hintEl.textContent = "Tap Pull to draw again";
}

pullBtn.addEventListener("click", () => {
  const card = pullCard();
  showCard(card);
});

// Shuffle is visual only — pulls are already random and independent,
// so there's no deck state to actually reorder.
shuffleBtn.addEventListener("click", () => {
  cardEl.classList.remove("shuffling");
  // force reflow so the animation can replay on repeated clicks
  void cardEl.offsetWidth;
  cardEl.classList.add("shuffling");
});

cardEl.addEventListener("animationend", () => {
  cardEl.classList.remove("shuffling");
});

// ---- PWA service worker registration ----

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(err => {
      console.warn("Service worker registration failed:", err);
    });
  });
}