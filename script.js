// ---- Persisted preferences (shared localStorage helpers) ----

function loadStoredValue(key, isValid, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return isValid(stored) ? stored : fallback;
  } catch (err) {
    return fallback;
  }
}

function saveStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    // Storage unavailable (private mode, disabled, etc.) - preference just won't persist.
  }
}

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

const CUSTOM_NON_ARCANA = [
  "Recovery", "Celebration", "Wrath", "Order", "Ambition", "Loyalty",
  "Reckoning", "Power", "Fluidity", "Insight", "Envy", "Crossroads",
  "Vitality", "Temptation", "Obstacles", "Stability", "Integrity", "Endurance",
  "Cynicism", "Idealism", "Industrious", "Gossip", "Vanity", "Trickster",
  "Receptive", "Potential", "Greed", "Fecundity", "Pride", "Contemplation",
  "Impulsive", "Duty", "Selfish", "Recovery", "Sacrifice", "Abandonment",
  "Hyperfocus", "Deception", "Spite", "Delusions", "Innovator", "Generosity",
  "Gluttony", "Abundance", "Betwixt", "Discretion", "Betrayal", "Fulfillment"
];

const CUSTOM_ARCANA = [
  "The Divine Fruit", "The Mirror", "The Forbidden", "The Reaped God",
  "The Instrument", "The Magic Skin", "The Flood", "The World Tree",
  "The Sacred Sword", "The Monster Marriage", "The Primordial Chaos", "The Apocalypse"
];

const CUSTOM_COLORS = ["#b06b4f", "#4f8a82", "#a18a4d", "#765b8f", "#7b6a55"];
const CUSTOM_TYPES = ["Hero", "Advisor", "Challenge", "Desire"];
const CUSTOM_TYPE_SYMBOLS = {
  Hero: { symbol: "❦", label: "Hero: Wreath" },
  Advisor: { symbol: "◉", label: "Advisor: Eye" },
  Challenge: { symbol: "☠", label: "Challenge: Skull" },
  Desire: { symbol: "♡", label: "Desire: Heart" },
  Symbol: { symbol: "✦", label: "Symbol" }
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

const CUSTOM_MEANINGS = {
  "Recovery": "The process of returning to a normal state of health, mind, or strength after a period of illness, difficulty, or loss.",
  "Celebration": "A social gathering or ritual act performed to mark a happy or significant occasion.",
  "Wrath": "Intense, often righteous anger; a strong desire for vengeance or retribution against a wrong.",
  "Order": "A state in which everything is in its correct or proper place; a condition of methodical arrangement.",
  "Ambition": "A strong desire to achieve something, typically requiring determination and hard work.",
  "Loyalty": "A strong feeling of support or allegiance to a person, cause, or belief.",
  "Reckoning": "The action or process of calculating or estimating something; a settling of accounts, especially a difficult one.",
  "Power": "The capacity or ability to direct or influence the behavior of others or the course of events.",
  "Fluidity": "The quality of being able to flow easily and change shape smoothly; adaptability.",
  "Insight": "The capacity to gain an accurate and deep understanding of a person or situation.",
  "Envy": "A feeling of discontented or resentful longing aroused by someone else's possessions, qualities, or luck.",
  "Crossroads": "A point at which a crucial decision must be made that will have far-reaching consequences.",
  "Vitality": "The state of being strong and active; energy essential for survival and growth.",
  "Temptation": "A desire to do something, especially something wrong or unwise.",
  "Obstacles": "Things that block one's way or prevent progress.",
  "Stability": "The state of being firmly fixed and not likely to change or fail.",
  "Integrity": "The quality of being honest and having strong moral principles that remain consistent under pressure.",
  "Endurance": "The capacity to withstand hardship or stress without giving way.",
  "Cynicism": "A tendency to distrust the sincerity or value of people's motives and actions.",
  "Idealism": "The practice of forming or pursuing ideals, especially unrealistically.",
  "Industrious": "Diligent and hard-working, especially in a way that produces results.",
  "Gossip": "Casual or unconstrained conversation about other people, typically involving details that are not confirmed as being true.",
  "Vanity": "Excessive pride in one's appearance, achievements, or qualities.",
  "Trickster": "A figure who deceives or plays tricks, often to subvert normal rules or expectations.",
  "Receptive": "Willing to consider or accept new ideas, suggestions, or influences.",
  "Potential": "Latent qualities or abilities that may be developed and lead to future success.",
  "Greed": "An intense and selfish desire for more of something than one needs.",
  "Fecundity": "The capacity for abundant fertility, productivity, or creative output.",
  "Pride": "A feeling of deep satisfaction derived from one's own achievements, or an excessive belief in one's own importance.",
  "Contemplation": "Deep reflective thought; the act of observing or studying something carefully.",
  "Impulsive": "Acting or done without forethought, on sudden urges rather than careful thought.",
  "Duty": "A moral or legal obligation; a responsibility owed to others or to oneself.",
  "Selfish": "Lacking consideration for others; concerned chiefly with one's own personal profit or pleasure.",
  "Sacrifice": "The act of giving up something valued for the sake of something else considered more important.",
  "Abandonment": "The act of leaving someone or something permanently, especially in violation of a duty or obligation.",
  "Hyperfocus": "An intense, absorbing concentration on a single task or subject to the exclusion of everything else.",
  "Deception": "The act of deliberately causing someone to believe something that is not true.",
  "Spite": "A desire to hurt, annoy, or offend someone, often in retaliation.",
  "Delusions": "Persistent false beliefs held with strong conviction despite evidence to the contrary.",
  "Innovator": "A person who introduces new ideas, methods, or inventions.",
  "Generosity": "The quality of being kind and giving more of something, especially money or time, than is strictly necessary.",
  "Gluttony": "Excessive and habitual indulgence, especially in food or drink.",
  "Abundance": "A very large quantity of something; a state of plentiful supply.",
  "Betwixt": "In an intermediate position; neither one thing nor the other.",
  "Discretion": "The quality of being careful and reserved in what one says or does, especially to avoid causing offense.",
  "Betrayal": "The act of being disloyal or breaking trust with someone who placed confidence in you.",
  "Fulfillment": "The achievement of something desired, promised, or predicted; a sense of satisfaction from realizing one's potential.",
  "The Divine Fruit": "A mythic emblem of forbidden knowledge and awakening; fruit said to grant wisdom or power at the cost of innocence once tasted.",
  "The Mirror": "An object with a reflective surface, used historically for self-examination and, in myth and folklore, as a symbol of truth, vanity, and duality.",
  "The Forbidden": "That which is prohibited by law, custom, or decree; a boundary whose crossing carries consequence.",
  "The Reaped God": "A mythological figure representing a deity cut down or sacrificed, often tied to harvest cycles and themes of death enabling renewal.",
  "The Instrument": "A tool or means by which an action is carried out; in myth, often a being or object used to enact fate.",
  "The Magic Skin": "A folkloric relic that grants wishes while shrinking with each use, symbolizing the cost of desire.",
  "The Flood": "A mythic deluge, recurring across cultures as an act of divine judgment or cleansing that precedes renewal.",
  "The World Tree": "A cosmological symbol found in many mythologies, a great tree connecting the heavens, earth, and underworld.",
  "The Sacred Sword": "A weapon imbued with divine or symbolic authority, often marking the bearer as chosen or destined for a task.",
  "The Monster Marriage": "A folkloric motif in which a human is wed to a supernatural or monstrous being, testing loyalty, fear, and transformation.",
  "The Primordial Chaos": "The formless void or disorder said to precede creation in many cosmogonies.",
  "The Apocalypse": "A revelation or unveiling; in eschatology, a cataclysmic event marking the end of an age and the disclosure of hidden truth."
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

const CLASSICAL_DECK = buildDeck();

function buildCustomDeck() {
  const cards = [...CUSTOM_NON_ARCANA, ...CUSTOM_ARCANA];

  return cards.map((name, index) => ({
    name,
    arcana: index < CUSTOM_NON_ARCANA.length ? "Custom" : "Custom Arcana",
    type: index < CUSTOM_NON_ARCANA.length
      ? CUSTOM_TYPES[index % CUSTOM_TYPES.length]
      : "Symbol",
    color: CUSTOM_COLORS[index % CUSTOM_COLORS.length],
    slug: `inner-compass-${slugify(name)}-${index}`,
    meaning: CUSTOM_MEANINGS[name]
  }));
}

const DECKS = {
  classical: { name: "Tarot of the Divine", cards: CLASSICAL_DECK, allowReversed: true },
  custom: { name: "Oracle of the Divine", cards: buildCustomDeck(), allowReversed: false }
};

const DECK_STORAGE_KEY = "tarotPullDeck";

function loadStoredDeckKey() {
  return loadStoredValue(
    DECK_STORAGE_KEY,
    (value) => Object.prototype.hasOwnProperty.call(DECKS, value),
    "classical"
  );
}

function saveDeckKey(deckKey) {
  saveStoredValue(DECK_STORAGE_KEY, deckKey);
}

const initialDeckKey = loadStoredDeckKey();
let activeDeck = DECKS[initialDeckKey];

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
  const card = activeDeck.cards[Math.floor(random() * activeDeck.cards.length)];
  const reversed = activeDeck.allowReversed && random() < 0.5;
  return { ...card, reversed };
}

const cardSlotEl = document.getElementById("cardSlot");
const cardEl = document.getElementById("card");
const cardFrontContentEl = document.getElementById("cardFrontContent");
const arcanaLabelEl = document.getElementById("arcanaLabel");
const cardTitleEl = document.getElementById("cardTitle");
const orientationRowEl = document.getElementById("orientationRow");
const orientationLabelEl = document.getElementById("orientationLabel");
const cardDescriptionEl = document.getElementById("cardDescription");
const hintEl = document.getElementById("hint");
const shuffleBtn = document.getElementById("shuffleBtn");
const deckSelect = document.getElementById("deckSelect");
const menuToggle = document.getElementById("menuToggle");
const historyPanel = document.getElementById("historyPanel");
const historyBody = document.getElementById("historyBody");
const historyCount = document.getElementById("historyCount");
const cardArtEl = document.getElementById("cardArt");
const cardArtImgEl = document.getElementById("cardArtImg");
const cardArtFallbackEl = document.getElementById("cardArtFallback");
const flipBtn = document.getElementById("flipBtn");
const cardSearchInputEl = document.getElementById("cardSearchInput");
const cardSearchBtn = document.getElementById("cardSearchBtn");
const cardNamesListEl = document.getElementById("cardNamesList");
const wideLayoutQuery = window.matchMedia(
  "(orientation: landscape) and (min-width: 700px) and (min-height: 560px)"
);

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
let currentCard = null;

function formatHistoryCount(count) {
  if (document.documentElement.getAttribute("data-theme") === "terminal") {
    return `[${String(count).padStart(2, "0")}/10]`;
  }

  return `${count} / 10`;
}

function renderHistory() {
  if (pullHistory.length === 0) {
    historyBody.innerHTML = '<tr><td colspan="3" class="history-empty">No pulls yet</td></tr>';
    historyCount.textContent = formatHistoryCount(0);
    return;
  }

  const rows = pullHistory
    .slice(0, 10)
    .map((entry, idx) => {
      const type = getCardTypeSymbol(entry.card);
      return `
      <tr class="history-row" data-history-index="${idx}" tabindex="0" role="button" aria-label="View ${entry.card.name}">
        <td class="history-type" title="${type.label}" aria-label="${type.label}">${type.symbol}</td>
        <td>${entry.card.name}</td>
        <td class="history-state" title="${entry.card.reversed ? "Reversed" : "Upright"}" aria-label="${entry.card.reversed ? "Reversed" : "Upright"}">${entry.card.reversed ? "↓" : "↑"}</td>
      </tr>
    `;
    })
    .join("");

  historyBody.innerHTML = rows;
  historyCount.textContent = formatHistoryCount(pullHistory.length);
}

function getCardTypeSymbol(card) {
  if (card.type && CUSTOM_TYPE_SYMBOLS[card.type]) {
    return CUSTOM_TYPE_SYMBOLS[card.type];
  }

  if (card.arcana === "Major Arcana") {
    return { symbol: "✦", label: "Major Arcana" };
  }

  if (card.arcana === "Custom Arcana") {
    return { symbol: "✦", label: "Custom Arcana" };
  }

  if (card.arcana === "Custom") {
    return { symbol: "◇", label: "Custom" };
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

function renderCardFace(card) {
  arcanaLabelEl.textContent = card.type || card.arcana;
  cardTitleEl.textContent = card.name;
  orientationRowEl.hidden = !activeDeck.allowReversed;
  orientationLabelEl.textContent = card.reversed ? "Reversed" : "Upright";
  orientationLabelEl.classList.toggle("is-reversed", card.reversed);
  cardDescriptionEl.textContent = card.meanings
    ? card.meanings[card.reversed ? 1 : 0]
    : card.meaning || "";
  cardArtEl.style.setProperty("--card-color", card.color);
  cardArtEl.classList.toggle("is-reversed", card.reversed);
  cardFrontContentEl.classList.toggle("is-reversed", card.reversed);
  loadCardArt(card);
}

function openCard(card) {
  renderCardFace(card);
  animateCardPull();
  flipBtn.hidden = !activeDeck.allowReversed;
  cardEl.classList.add("flipped");
  isFlipped = true;
  hintEl.textContent = "Tap anywhere to draw again";
}

function revealCard(card) {
  if (!isFlipped) {
    openCard(card);
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  cardEl.classList.remove("flipped");
  isFlipped = false;

  if (prefersReducedMotion) {
    openCard(card);
  } else {
    cardEl.addEventListener("transitionend", () => openCard(card), { once: true });
  }
}

function showCard(card) {
  currentCard = { ...card };
  revealCard(currentCard);
  addToHistory({ ...card });
}

function showSearchedCard(card) {
  currentCard = { ...card, reversed: false };
  revealCard(currentCard);
}

function showHistoryCard(card) {
  currentCard = { ...card };
  revealCard(currentCard);
  closeMenuIfCompact();
}

function handleHistoryRowActivate(row) {
  const entry = pullHistory[Number(row.dataset.historyIndex)];
  if (entry) {
    showHistoryCard(entry.card);
  }
}

historyBody.addEventListener("click", (event) => {
  const row = event.target.closest(".history-row");
  if (row) {
    handleHistoryRowActivate(row);
  }
});

historyBody.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const row = event.target.closest(".history-row");
  if (row) {
    event.preventDefault();
    handleHistoryRowActivate(row);
  }
});

function populateCardNames() {
  cardNamesListEl.innerHTML = activeDeck.cards
    .map((card) => `<option value="${card.name}"></option>`)
    .join("");
}

function searchCard() {
  const query = cardSearchInputEl.value.trim().toLowerCase();
  if (!query) {
    return;
  }

  const match = activeDeck.cards.find((card) => card.name.toLowerCase() === query);

  if (!match) {
    cardSearchInputEl.classList.remove("not-found");
    void cardSearchInputEl.offsetWidth;
    cardSearchInputEl.classList.add("not-found");
    return;
  }

  showSearchedCard(match);
  cardSearchInputEl.value = "";
  cardSearchInputEl.blur();
  closeMenuIfCompact();
}

function setMenuOpen(open) {
  isMenuOpen = open;
  historyPanel.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
}

function toggleMenu() {
  setMenuOpen(!isMenuOpen);
}

function closeMenuIfCompact() {
  if (!wideLayoutQuery.matches) {
    setMenuOpen(false);
  }
}

function clearCardDisplay() {
  cardEl.classList.remove("flipped");
  isFlipped = false;

  arcanaLabelEl.textContent = "Major Arcana";
  cardTitleEl.textContent = "\u2014";
  orientationLabelEl.textContent = "";
  orientationLabelEl.classList.remove("is-reversed");
  cardDescriptionEl.textContent = "";
  cardArtEl.classList.remove("is-reversed");
  cardFrontContentEl.classList.remove("is-reversed");
  cardArtImgEl.onload = null;
  cardArtImgEl.onerror = null;
  cardArtImgEl.removeAttribute("src");
  cardArtImgEl.classList.remove("loaded");
  cardArtFallbackEl.classList.remove("hidden");
  hintEl.textContent = "Tap anywhere to pull a card";
  currentCard = null;
  flipBtn.hidden = true;
}

function resetReading() {
  clearCardDisplay();
  pullHistory = [];
  renderHistory();
  populateCardNames();
  reseedRandom();
}

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMenu();
});

deckSelect.addEventListener("change", () => {
  activeDeck = DECKS[deckSelect.value];
  saveDeckKey(deckSelect.value);
  resetReading();
  closeMenuIfCompact();
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

  if (event.target.closest("#deckSelect")) {
    return;
  }

  if (event.target.closest("#flipBtn")) {
    return;
  }

  if (event.target.closest("#themeSwitcher")) {
    return;
  }

  if (event.target.closest(".card-description")) {
    return;
  }

  if (isThemeMenuOpen) {
    return;
  }

  const card = pullCard();
  showCard(card);
});

function startShuffleShake() {
  cardEl.classList.remove("shuffling");
  void cardEl.offsetWidth;
  cardEl.classList.add("shuffling");
}

shuffleBtn.addEventListener("click", () => {
  const wasFlipped = isFlipped;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  clearCardDisplay();
  reseedRandom();

  if (wasFlipped && !prefersReducedMotion) {
    cardEl.addEventListener("transitionend", startShuffleShake, { once: true });
  } else {
    startShuffleShake();
  }
});

cardSearchBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  searchCard();
});

cardSearchInputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchCard();
  }
});

cardSearchInputEl.addEventListener("animationend", () => {
  cardSearchInputEl.classList.remove("not-found");
});

flipBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  if (!currentCard) {
    return;
  }

  currentCard.reversed = !currentCard.reversed;
  renderCardFace(currentCard);
});

cardEl.addEventListener("animationend", () => {
  cardEl.classList.remove("shuffling");
});

cardSlotEl.addEventListener("animationend", () => {
  cardSlotEl.classList.remove("pulling");
});

deckSelect.value = initialDeckKey;
populateCardNames();
setMenuOpen(wideLayoutQuery.matches);

wideLayoutQuery.addEventListener("change", (event) => {
  setMenuOpen(event.matches);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(err => {
      console.warn("Service worker registration failed:", err);
    });
  });
}

// ---- Theme switcher ----

const themeToggleEl = document.getElementById("themeToggle");
const themeMenuEl = document.getElementById("themeMenu");
const themeOptionEls = document.querySelectorAll(".theme-option");
let isThemeMenuOpen = false;

const THEME_STORAGE_KEY = "tarotPullTheme";
const VALID_THEME_VALUES = new Set(
  Array.from(themeOptionEls).map((option) => option.dataset.themeValue)
);

function loadStoredTheme() {
  return loadStoredValue(THEME_STORAGE_KEY, (value) => VALID_THEME_VALUES.has(value), "");
}

function saveTheme(themeValue) {
  saveStoredValue(THEME_STORAGE_KEY, themeValue);
}

const THEME_ICON_PATHS = {
  "": '<path d="M9 1 L11 7 L17 9 L11 11 L9 17 L7 11 L1 9 L7 7 Z"/>',
  holo: '<path d="M4 7 L9 2 L14 7 L9 16 Z"/><path d="M4 7 L14 7"/><path d="M6.5 7 L9 2 L11.5 7"/>',
  terminal: '<path d="M3 5 L8 9 L3 13"/><path d="M9.5 14 L15 14"/>',
  deco: '<path d="M9 16 L9 2 M9 16 L4.5 4 M9 16 L13.5 4 M9 16 L1.5 9.5 M9 16 L16.5 9.5"/>',
  bloodmoon: '<circle cx="9" cy="9" r="4.5" fill="currentColor" stroke="none"/><circle cx="9" cy="9" r="7.4" stroke-dasharray="1.2 2.4"/>',
  "mystic-celestial": '<path d="M9 2 L10.6 7.4 L16 9 L10.6 10.6 L9 16 L7.4 10.6 L2 9 L7.4 7.4 Z"/>',
  "mystic-grimoire": '<path d="M9 2 L13.11 14.66 L2.34 6.84 L15.66 6.84 L4.89 14.66 Z"/>',
  "mystic-orbit": '<circle cx="9" cy="9" r="7"/><circle cx="9" cy="9" r="3.5"/><circle cx="14.5" cy="6" r="1" fill="currentColor" stroke="none"/>'
};

function setThemeMenuOpen(open) {
  isThemeMenuOpen = open;
  themeMenuEl.hidden = !open;
  themeToggleEl.setAttribute("aria-expanded", String(open));
}

let holoGlintTimer = null;

function triggerHoloGlint() {
  document.querySelectorAll(".card-face").forEach((face) => {
    face.classList.remove("glinting");
    void face.offsetWidth;
    face.classList.add("glinting");
  });
}

function scheduleHoloGlint() {
  clearTimeout(holoGlintTimer);

  if (document.documentElement.getAttribute("data-theme") !== "holo") {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const delay = 2600 + Math.random() * 4200;
  holoGlintTimer = setTimeout(() => {
    triggerHoloGlint();
    scheduleHoloGlint();
  }, delay);
}

const terminalRainCanvas = document.getElementById("terminalRain");
const TERMINAL_RAIN_FONT_SIZE = 16;
const TERMINAL_RAIN_FAST_STEP_MS = 55;
const TERMINAL_RAIN_SLOW_STEP_MS = 220;
const TERMINAL_RAIN_TRAIL_LENGTH = 22;
const TERMINAL_RAIN_MAX_DROPS = 2;
let terminalRainCtx = null;
let terminalRainFrame = null;
let terminalRainColumns = [];
let terminalRainLastTime = 0;

function makeTerminalRainDrop(y) {
  return { y, trail: new Array(TERMINAL_RAIN_TRAIL_LENGTH).fill("") };
}

function resizeTerminalRain() {
  if (!terminalRainCanvas) {
    return;
  }
  terminalRainCanvas.width = window.innerWidth;
  terminalRainCanvas.height = window.innerHeight;
  const columnCount = Math.ceil(terminalRainCanvas.width / TERMINAL_RAIN_FONT_SIZE);
  terminalRainColumns = new Array(columnCount).fill(0).map((_, i) => ({
    x: i * TERMINAL_RAIN_FONT_SIZE,
    elapsed: Math.random() * TERMINAL_RAIN_FAST_STEP_MS,
    hasLooped: false,
    drops: [makeTerminalRainDrop(Math.random() * -300)],
  }));
}

function drawTerminalRain(now) {
  terminalRainFrame = requestAnimationFrame(drawTerminalRain);

  const delta = terminalRainLastTime ? Math.min(now - terminalRainLastTime, 100) : 16;
  terminalRainLastTime = now;

  terminalRainCtx.clearRect(0, 0, terminalRainCanvas.width, terminalRainCanvas.height);
  terminalRainCtx.font = `${TERMINAL_RAIN_FONT_SIZE}px 'Space Mono', monospace`;

  terminalRainColumns.forEach((col) => {
    col.elapsed += delta;
    const stepMs = col.hasLooped ? TERMINAL_RAIN_SLOW_STEP_MS : TERMINAL_RAIN_FAST_STEP_MS;
    if (col.elapsed >= stepMs) {
      col.elapsed = 0;

      col.drops.forEach((drop) => {
        drop.y += TERMINAL_RAIN_FONT_SIZE;
        drop.trail.unshift(Math.random() > 0.5 ? "1" : "0");
        drop.trail.length = TERMINAL_RAIN_TRAIL_LENGTH;
      });

      const trailBottom = terminalRainCanvas.height + TERMINAL_RAIN_TRAIL_LENGTH * TERMINAL_RAIN_FONT_SIZE;
      col.drops = col.drops.filter((drop) => drop.y <= trailBottom);

      // A new drop doesn't need to wait for the previous one to fully fall off —
      // it can start once the newest drop is most of the way down.
      const newestDrop = col.drops[col.drops.length - 1];
      const canSpawn = col.drops.length < TERMINAL_RAIN_MAX_DROPS
        && (!newestDrop || newestDrop.y > terminalRainCanvas.height * 0.6);
      if (canSpawn && Math.random() > 0.975) {
        col.drops.push(makeTerminalRainDrop(0));
        col.hasLooped = true;
      }
    }

    col.drops.forEach((drop) => {
      drop.trail.forEach((char, i) => {
        if (!char) {
          return;
        }
        terminalRainCtx.fillStyle = i === 0
          ? "rgba(210, 255, 225, 0.95)"
          : `rgba(34, 255, 127, ${(0.55 * Math.pow(0.88, i)).toFixed(3)})`;
        terminalRainCtx.fillText(char, col.x, drop.y - i * TERMINAL_RAIN_FONT_SIZE);
      });
    });
  });
}

function startTerminalRain() {
  if (!terminalRainCanvas || terminalRainFrame || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  terminalRainCtx = terminalRainCanvas.getContext("2d");
  resizeTerminalRain();
  terminalRainCanvas.hidden = false;
  terminalRainLastTime = 0;
  terminalRainFrame = requestAnimationFrame(drawTerminalRain);
}

function stopTerminalRain() {
  if (terminalRainFrame) {
    cancelAnimationFrame(terminalRainFrame);
    terminalRainFrame = null;
  }
  if (terminalRainCanvas) {
    terminalRainCanvas.hidden = true;
  }
}

window.addEventListener("resize", () => {
  if (terminalRainFrame) {
    resizeTerminalRain();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopTerminalRain();
  } else if (document.documentElement.getAttribute("data-theme") === "terminal") {
    startTerminalRain();
  }
});

function applyTheme(themeValue) {
  if (themeValue) {
    document.documentElement.setAttribute("data-theme", themeValue);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  themeOptionEls.forEach((option) => {
    const isActive = option.dataset.themeValue === themeValue;
    option.classList.toggle("is-active", isActive);
    const currentTag = option.querySelector(".theme-current-tag");
    if (currentTag) {
      currentTag.hidden = !isActive;
    }
  });

  const iconPath = THEME_ICON_PATHS[themeValue] || THEME_ICON_PATHS[""];
  themeToggleEl.innerHTML = `<svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPath}</svg>`;

  if (themeValue === "holo") {
    triggerHoloGlint();
    scheduleHoloGlint();
  } else {
    clearTimeout(holoGlintTimer);
  }

  if (themeValue === "terminal") {
    startTerminalRain();
  } else {
    stopTerminalRain();
  }

  cardSearchInputEl.placeholder = themeValue === "terminal"
    ? "search --card=…"
    : "Search for a card…";

  renderHistory();
  saveTheme(themeValue);
}

themeToggleEl.addEventListener("click", (event) => {
  event.stopPropagation();
  setThemeMenuOpen(!isThemeMenuOpen);
});

themeOptionEls.forEach((option) => {
  option.addEventListener("click", (event) => {
    event.stopPropagation();
    applyTheme(option.dataset.themeValue);
    setThemeMenuOpen(false);
  });
});

document.addEventListener("click", (event) => {
  if (isThemeMenuOpen && !event.target.closest("#themeSwitcher")) {
    setThemeMenuOpen(false);
  }
});

applyTheme(loadStoredTheme());
