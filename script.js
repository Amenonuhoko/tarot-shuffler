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

const CARD_MEANINGS = {
  "The Fool": [
    "Beginnings, innocence, possibilities, impulsiveness",
    "Recklessness, hesitation, a faulty choice, doldrums"
  ],
  "The Magician": [
    "Originality, self-confidence, skill, a breakthrough, resourcefulness",
    "Insecurity, delay, lack of trust, closed mind, secrets"
  ],
  "The High Priestess": [
    "Wisdom, intuition, dreams, an enigma",
    "Ignorance, shallowness, lack of concentration, smothering, selfishness"
  ],
  "The Empress": [
    "Fertility, nurturing, abundance, accomplishment",
    "Insecurity, feeling undesirable, anxiety, lack of imagination"
  ],
  "The Emperor": [
    "Stability, leadership, bravery, bold action, structure",
    "Immaturity, pettiness, rigidity, domination, anger"
  ],
  "The Hierophant": [
    "Conformity, compassion, social approval, tradition, legacy",
    "Bucking trends, vulnerability, feeling adrift, blind faith"
  ],
  "The Lovers": [
    "Love, harmony, trust, a leap of faith, choice",
    "Unreliability, separation, second-guessing, values, conflict"
  ],
  "The Chariot": [
    "A journey, perseverance, rushed decisions, vengeance, victory",
    "A lack of direction, floundering, stagnation, willfulness"
  ],
  "Strength": [
    "Courage, conviction, control, determination, patience",
    "Weakness, self-doubt, abuse of power, pride, negligence"
  ],
  "The Hermit": [
    "Introspection, withdrawal, prudence, insight, meditation",
    "Recklessness, hastiness, avoidance, loneliness, rejection"
  ],
  "Wheel of Fortune": [
    "Fortune, an unexpected windfall, karma, destiny, cycles",
    "Bad luck, a lack of control, the past, misery, disappointment"
  ],
  "Justice": [
    "Harmony, balance, equality, virtue, honor",
    "Bias, false accusations, intolerance, abuse, dishonesty"
  ],
  "The Hanged Man": [
    "Suspension, restriction, sacrifice, readjustment, improvement",
    "Willfulness, useless sacrifice, rushing, thoughtlessness, martyrdom"
  ],
  "Death": [
    "Metamorphosis, evolution, loss, transition, change",
    "Stagnation, immobility, stubbornness, festering, decay"
  ],
  "Temperance": [
    "Moderation, harmony, purpose, good influence, reconciliation",
    "Conflict, hostility, frustration, impatience, reluctance"
  ],
  "The Devil": [
    "Greed, controversy, violence, strange experiences, addiction",
    "Release, enlightenment, power reclaimed, divorce, moving on"
  ],
  "The Tower": [
    "Massive change, upheaval, catastrophe, rebuilding, revelation",
    "Feeling trapped, delaying disaster, fear of pain, avoidance"
  ],
  "The Star": [
    "Hope, serenity, inspiration, insight, spirituality",
    "Crushed dreams, insecurity, despair, dejection, exhaustion"
  ],
  "The Moon": [
    "Trickery, melancholy, anguish, illusion, insecurity",
    "Joy, enlightenment, resolution, deception revealed, relief"
  ],
  "The Sun": [
    "Satisfaction, accomplishment, joy, luck, vitality",
    "Missed opportunities, delays, doubt, fear of missing out, depression"
  ],
  "Judgement": [
    "Improvement, forgiveness, a change of perspective, absolution, rebirth",
    "Oppression, lack of self-awareness, failure, repeated mistakes, self-loathing"
  ],
  "The World": [
    "Completion, recognition, fulfillment, triumph, celebration",
    "Imperfection, disappointment, shortcuts, shortsightedness, anxiety"
  ],
  "Ace of Wands": [
    "Excitement, creativity, a spark, growth, new beginnings",
    "Delays, bad news, a creative block, wasted talent"
  ],
  "Two of Wands": [
    "Decisions, travel, business opportunities, future planning, cooperation",
    "Indecision, doubt, fear of the unknown, playing it safe"
  ],
  "Three of Wands": [
    "Self-motivation, freedom, reward, romance",
    "Returning home, wallowing, frustration, delays"
  ],
  "Four of Wands": [
    "Reunion, success, pride, happiness, family",
    "Self-doubt, diaspora, canceled plans, gloom"
  ],
  "Five of Wands": [
    "Rivalry, opponents, disagreement, competition, clashing egos",
    "Compromise, peace, harmony, resolution, conflict avoidance"
  ],
  "Six of Wands": [
    "Victory, praise, achievement, reward, fame",
    "Ego, pride, disrepute, a fall from grace"
  ],
  "Seven of Wands": [
    "Endurance, attack, fighting for beliefs, perseverance, mounting a defense",
    "Giving up, defeat, timidity, cowardice, overwhelmed"
  ],
  "Eight of Wands": [
    "Speed, momentum, travel, excitement, results",
    "Lethargy, delays, bad timing, slowness, frustration"
  ],
  "Nine of Wands": [
    "Fatigue, persistence, gathering strength, wounds, resilience",
    "A stalemate, stubbornness, hesitance, giving in, paranoia"
  ],
  "Ten of Wands": [
    "Overwhelm, stress, obligation, refusing aide, duty",
    "Avoidance, burnout, overcommitting, stretched thin, giving up"
  ],
  "Page of Wands": [
    "Playfulness, charisma, discovery, a rogue, enthusiasm",
    "Naivety, petulance, a lack of imagination, pessimism"
  ],
  "Knight of Wands": [
    "Adventure, passion, a rebel, a flirt, a hot temper",
    "Arrogance, jealousy, abuse, recklessness, a braggart"
  ],
  "Queen of Wands": [
    "Optimism, independence, confidence, passion, verve",
    "Jealousy, spite, avarice, destruction, demands"
  ],
  "King of Wands": [
    "Honesty, passion, leadership, charm, flexibility",
    "Tyranny, a lack of harmony, weakness, volatility"
  ],
  "Ace of Swords": [
    "New projects, truth, assertiveness, creative thinking, clarity",
    "Lack of communication, misinformation, rigidity, confusion"
  ],
  "Two of Swords": [
    "Facing fears, a stalemate, denial, opposition, a precarious position",
    "Indecision, lies exposed, delays, overwhelming fear"
  ],
  "Three of Swords": [
    "Heartbreak, self-harm, sadness, grief, separation",
    "Overcoming grief, optimism, reconciliation, forgiveness, seeking help"
  ],
  "Four of Swords": [
    "Sanctuary, recouping, meditation, passivity, counseling",
    "Awakening, healing, returning, burnout, strength"
  ],
  "Five of Swords": [
    "Surrender, betrayal, bullying, violence, crime",
    "Resolution, compromise, sacrifice, peace, justice"
  ],
  "Six of Swords": [
    "Healing, moving forward, stability, escape, journeys",
    "Feeling trapped, instability, canceled travel, abuse, unresolved issues"
  ],
  "Seven of Swords": [
    "Strategy, cunning, thievery, cheating, manipulation",
    "Conscience, confession, getting caught, outsmarted, deception"
  ],
  "Eight of Swords": [
    "Anxiety, victimhood, feeling trapped, paralysis, crisis",
    "Freedom, new perspectives, taking a stand, strength, healing"
  ],
  "Nine of Swords": [
    "Anxiety, terror, nightmares, obsession, insomnia",
    "Recovery, acceptance, letting go, accepting help, hope"
  ],
  "Ten of Swords": [
    "Bitterness, betrayal, rock bottom, martyrdom, severing ties",
    "Surviving disaster, recovery, regeneration, the inevitable"
  ],
  "Page of Swords": [
    "Talkativeness, energy, thoughtfulness, curiosity, truthfulness",
    "Bluntness, cynicism, defensiveness, sullenness, all talk"
  ],
  "Knight of Swords": [
    "Intellect, bravery, confidence, being action-oriented",
    "Rudeness, bullying, an inferiority complex, passivity"
  ],
  "Queen of Swords": [
    "Protection, meaningful criticism, tough love, skepticism, intelligence",
    "Bitterness, vindication, judgment, malice, pessimism"
  ],
  "King of Swords": [
    "Authority, structure, logic, self-discipline, loyalty",
    "A dictator, cruelty, violence, oppression, cynicism"
  ],
  "Ace of Cups": [
    "Happiness, love, intimacy, new emotions, compassion",
    "Relationship problems, depression, sadness, creative block, repression"
  ],
  "Two of Cups": [
    "A happy relationship, equality, partnership, attraction, connection",
    "Imbalance, discord, separation, incompatibility, power imbalance"
  ],
  "Three of Cups": [
    "Celebrations, friends, indulgence, parties, community",
    "Overindulgence, infidelity, disintegrating bonds, gossip, isolation"
  ],
  "Four of Cups": [
    "A lack of awareness, pessimism, daydreaming, lethargy, reevaluation",
    "Motivation, opportunity, optimism, restlessness, boredom"
  ],
  "Five of Cups": [
    "Self-pity, guilt, regret, stagnation, depression",
    "Moving on, forgiveness, acceptance, finding peace, encouragement"
  ],
  "Six of Cups": [
    "Nostalgia, old friends, simple joys, sharing, childhood",
    "The future, letting go, leaving home, rose-tinted glasses"
  ],
  "Seven of Cups": [
    "Daydreaming, fantasy, decisions, wishful thinking, procrastination",
    "Reality, clarity, temptation, confusion, diversion"
  ],
  "Eight of Cups": [
    "Walking away, introspection, escapism, withdrawal, seeking truth",
    "Aimlessness, fear of abandonment, depression, settling, hopelessness"
  ],
  "Nine of Cups": [
    "Dreams realized, fulfillment, pleasure, recognition, triumph",
    "Greed, devastation, pessimism, addiction, self-loathing"
  ],
  "Ten of Cups": [
    "Harmony, reunions, security, domestic bliss, found family",
    "Dysfunctional family, broken home, instability, conflict, neglect"
  ],
  "Page of Cups": [
    "Youthfulness, idealism, sensitivity, romance, spirituality",
    "Bad news, jealousy, obsession, childhood problems, immaturity"
  ],
  "Knight of Cups": [
    "Chivalry, affection, invitations, taking action, meaningful gifts",
    "Heartbreak, infidelity, lack of diplomacy, moodiness, pettiness"
  ],
  "Queen of Cups": [
    "Femininity, warmth, empathy, a counselor, intuition",
    "Immaturity, selfishness, smothering, sulking, spite"
  ],
  "King of Cups": [
    "Devotion, loyalty, faithfulness, wisdom, generosity",
    "Anxiety, lack of caring, control, violence, imbalance"
  ],
  "Ace of Pentacles": [
    "New business, money, investments, abundance, security",
    "Bad finances, excessive spending, greed, stinginess, poor planning"
  ],
  "Two of Pentacles": [
    "Multitasking, balance, choice, flexibility, prioritization",
    "Disorganization, a facade, overwhelm, overextending, financial mess"
  ],
  "Three of Pentacles": [
    "Studying, growth, collaboration, success, recognition",
    "Poor work ethic, apathy, lack of goals, willfulness"
  ],
  "Four of Pentacles": [
    "Hoarding, possession, financial stability, materialism, stinginess",
    "Gambling, recklessness, letting go, generosity, large purchases"
  ],
  "Five of Pentacles": [
    "Recession, adversity, isolation, unemployment, ruin",
    "Paid debts, improved finances, positive change, acceptance, recovery"
  ],
  "Six of Pentacles": [
    "Generosity, charity, kindness, value, reward",
    "Abuse of power, scams, extortion, gullibility, greed"
  ],
  "Seven of Pentacles": [
    "Reward, perseverance, decisions, investment, fruition",
    "Shortsightedness, laziness, procrastination, setbacks, delay"
  ],
  "Eight of Pentacles": [
    "Craftsmanship, commitment, determination, ambition, concentration",
    "Repetition, poor quality, rushing, bad reputation"
  ],
  "Nine of Pentacles": [
    "Independence, prosperity, freedom, maturity, self-discipline",
    "Scams, superficiality, overinvestment, work-obsessed, ungrateful"
  ],
  "Ten of Pentacles": [
    "Inheritance, ancestry, pensions, settling down, financial stability",
    "Financial disaster, disputes, instability, broken traditions"
  ],
  "Page of Pentacles": [
    "Setting goals, loyalty, positivity, opportunities, manifestation",
    "A lack of common sense, immaturity, laziness, apathy"
  ],
  "Knight of Pentacles": [
    "Ambition, hard work, persistence, being efficient",
    "Impatience, apathy, irresponsibility, anxiety"
  ],
  "Queen of Pentacles": [
    "A healer, luxury, being grounded, practicality, movement",
    "Jealousy, possession, a lack of organization, manipulation"
  ],
  "King of Pentacles": [
    "Success, dependability, conservatism, strong will, willing to work",
    "Corruption, materialism, ruthlessness, authority, indulgence"
  ]
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildDeck() {
  const deck = MAJOR_ARCANA.map(name => ({
    name,
    arcana: "Major Arcana",
    color: MAJOR_COLORS[name],
    slug: slugify(name),
    meanings: CARD_MEANINGS[name]
  }));

  for (const suit of MINOR_SUITS) {
    for (const rank of MINOR_RANKS) {
      const name = `${rank} of ${suit}`;
      deck.push({
        name,
        arcana: "Minor Arcana",
        color: SUIT_COLORS[suit],
        slug: slugify(name),
        meanings: CARD_MEANINGS[name]
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

const cardSlotEl = document.getElementById("cardSlot");
const cardEl = document.getElementById("card");
const arcanaLabelEl = document.getElementById("arcanaLabel");
const cardTitleEl = document.getElementById("cardTitle");
const cardDescriptionEl = document.getElementById("cardDescription");
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

function animateCardPull() {
  cardSlotEl.classList.remove("pulling");
  void cardSlotEl.offsetWidth;
  cardSlotEl.classList.add("pulling");
}

function showCard(card) {
  arcanaLabelEl.textContent = card.arcana;
  cardTitleEl.textContent = card.name;
  cardDescriptionEl.textContent = card.meanings[card.reversed ? 1 : 0];
  cardArtEl.style.setProperty("--card-color", card.color);
  cardArtEl.classList.toggle("is-reversed", card.reversed);
  loadCardArt(card);
  addToHistory(card);
  animateCardPull();

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
  cardTitleEl.textContent = "\u2014";
  cardDescriptionEl.textContent = "";
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

cardSlotEl.addEventListener("animationend", () => {
  cardSlotEl.classList.remove("pulling");
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
