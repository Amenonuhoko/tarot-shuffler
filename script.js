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
  Symbol: { symbol: "✦", label: "Symbol" },
  Selves: { symbol: "☉", label: "Selves: Sun" },
  Places: { symbol: "▲", label: "Places: Peak" },
  Tools: { symbol: "⚙", label: "Tools: Gear" },
  Initiations: { symbol: "☥", label: "Initiations: Ankh" }
};

const ARCHETYPE_SELVES = [
  "The Creator", "The Destroyer", "The Healer", "The Comic",
  "The Unseen", "The Shadow", "The Self", "The One",
  "The Mother", "The Father", "The Starborn", "The Eternal Child",
  "The Orphan", "The Mentor", "The Poet", "The Maiden",
  "The Hunter", "The Warrior", "The Queen", "The King",
  "The Shapeshifter", "The Crone", "The Shaman", "The Judge",
  "The Lover", "The Siren", "The Animal", "The Pilgrim",
  "The Mystic", "The Sustainer"
];

const ARCHETYPE_PLACES = [
  "The Womb", "The Storm", "The Faultline", "The Bardo",
  "The Mountain", "The Cave", "The Heart", "The Village",
  "The Dead End", "The Empty Room", "The Temple", "The Bridge",
  "The Desert", "The Forest", "The River", "The Ocean",
  "The Castle", "The Box", "The Threshold", "The Underworld"
];

const ARCHETYPE_TOOLS = [
  "The Prayer", "The Offering", "The Mirror", "The Vessel",
  "The Thread", "The Venom", "The Mask", "The Sword",
  "The Seed", "The Kiss", "The Medallion", "The Stone",
  "The Flame", "The Tear", "The Riddle", "The Vow",
  "The Vision", "The Gem", "The Ring", "The Nectar"
];

const ARCHETYPE_INITIATIONS = [
  "Anima Mundi", "Apocolypsis", "Agape", "Eros",
  "Gnosis", "Kairos", "Thanatos", "Aletheia"
];

const ARCHETYPE_COLORS = {
  Selves: "#b8654f",
  Places: "#4f7a5e",
  Tools: "#5c7a94",
  Initiations: "#6b4f8f"
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

// [subtitle, when-light meaning, when-dark meaning] per card, transcribed from the
// Archetype Deck guidebook.
const ARCHETYPE_DATA = {
  "Anima Mundi": ["The Soul of the World, All That Is", "tending to the sacred details of life", "overwhelmed by the bigness of existence"],
  "Apocolypsis": ["Removing the Veil of Deception", "the unknown becomes known and guides the way", "nihilism, fatalism, hopelessness"],
  "Agape": ["Devotion, Unconditional Love", "service, reverence, honor, joy", "spiritual bypassing, righteousness"],
  "Eros": ["Love as Desire, Eroticism, Sensuality", "passion, playfulness, sexual health", "madness, projection, obsession"],
  "Gnosis": ["Innermost Knowing, Mystic Truths", "contemplating the mystery, unanswerable questions", "overintellectualizing and literalizing, asking others"],
  "Kairos": ["Mythic Time, Synchronicity", "alignment, ease in decisions and action", "fighting against time"],
  "Thanatos": ["Death", "grieving, mourning, bearing witness to all that is", "fear or insensitivity to old age, illness, the dying"],
  "Aletheia": ["Truth", "clarity, revelation, disclosure", "distortions, gaslighting, excuses"],

  "The Prayer": ["The Worship, The Reverence, The Homage", "offering to be of service, asking for guidance", "expecting results, self-aggrandizement"],
  "The Offering": ["The Gift, The Present, The Sacrifice", "generosity, donation, volunteering", "giving with expectations, keeping track"],
  "The Mirror": ["The Reflection, The Illusion, The Looking Glass", "witnessing the deeper self, pure awareness", "narcissism, comparison, harsh edges"],
  "The Vessel": ["The Body, The Container, The Cup", "stable, strong, graceful", "trapped, being in a bubble"],
  "The Thread": ["The Path, The Vein, The Circuit", "the circuit of meaning within chaos", "binding, frustrating, taut"],
  "The Venom": ["The Poison, The Curse, The Toxin", "self-realization through suffering", "unwillingness to find a solution or forgive"],
  "The Mask": ["The Persona, The Performance, The Reveal", "reveals what has been suppressed", "further conceals what is rejected"],
  "The Sword": ["The Knife, The Blade, The Weapon", "cutting through to what is essential", "hasty, backstabbing, a dull and painful blade"],
  "The Seed": ["The Beginning, The Origin, The Pearl", "generative, fertile, germinating, building", "festering, stewing, dormant"],
  "The Kiss": ["The Touch, The Chemistry, The Sex", "sensual expressiveness, merging, inviting", "neediness, pressure, dominance, disrespect"],
  "The Medallion": ["The Amulet, The Talisman, The Heirloom", "upholding tradition, protecting, honoring", "burdensome inheritance, habituation"],
  "The Stone": ["The Eternal, The Anchor, The Rock", "steadfast, loyal, committed, present", "weighted down, holding back, cold"],
  "The Flame": ["The Fire, The Spark, The Glimmer", "health, mental clarity, good digestion", "excess heat and anger, complete darkness"],
  "The Tear": ["The Mourning, The Release, The Rain", "melody, melancholy, flowing through", "drowning, drama, murkiness"],
  "The Riddle": ["The Puzzle, The Question, The Mystery", "a great awakening or “aha” moment", "manipulation, deceit, trickery"],
  "The Vow": ["The Promise, The Oath, The Contract", "bearing witness to the shift toward destiny", "unconscious vows, unkept promises, messy karma"],
  "The Vision": ["The Dream, The Imagined, The Revealed", "potent imagination, synchronicity, trust", "disconnected from art and dreams, listless, aimless"],
  "The Gem": ["The Diamond, The Gold, The Inner Treasure", "unique, shining, generative, irreplaceable", "envy, greed, grasping"],
  "The Ring": ["The Infinite, The Wheel, The Connection", "connectedness, humility, sacred cycles", "unconscious repetition, starving for connection"],
  "The Nectar": ["The Medicine, The Elixir, The Garden", "glowing, relaxed, subtle illumination", "fixation on fixing, aggressive approach to healing"],

  "The Womb": ["The Nest, The Belly, The Origin", "nourishment, harmony, warmth, love", "stricken, ecological crisis, infertility, imbalance"],
  "The Storm": ["The Chaos, The Whirlwind, The Disorder", "meaningful obliteration and annihilation", "meaningless disorder and dysfunction"],
  "The Faultline": ["The Fissure, The Crack, The Weak Line", "redefining reality, breaking open", "precariousness, pretending, delusion"],
  "The Bardo": ["The Liminal, The In-Between, The Transition", "healing insight found in the space between", "haunted by what refuses to resolve"],
  "The Mountain": ["The Ascent, The Peak, The Insurmountable", "grounded in the eternal, steadfast, uplifting", "ominous, daunting, isolating, frigid"],
  "The Cave": ["The Dark, The Portal, The Interior", "the sacred center within", "withdrawal, isolation, hiding"],
  "The Heart": ["The Home, The Center, The Throne", "expansive, knowing, gentle clarity", "fraught, tangled, betrayal"],
  "The Village": ["The Hometown, The Family, The Tribe", "intimate, rooted, intergenerational, communal", "small-minded, gossipy, trapped, restricted"],
  "The Dead End": ["The Closed Door, The Final Chapter, The Impasse", "acceptance, humility, relief, reverence for change", "inertia, stuckness, tension, unconscious gripping"],
  "The Empty Room": ["The Vortex, The Abyss, The Nothing", "spaciousness, potential, possibility", "addiction, insatiability, more for more's sake"],
  "The Temple": ["The Sanctuary, The Shrine, The Altar", "reverence for all, life as sanctuary", "idolatry, cults, strict spirituality"],
  "The Bridge": ["The Connection, The Link, The Gate", "acceptance, magic, communication", "lacking boundaries, forcing connection"],
  "The Desert": ["The Drought, The Wasteland, The Badlands", "surreal, strange, unexpected visions, silence", "drying, deadening, disorienting, isolating"],
  "The Forest": ["The Woods, The Thicket, The Jungle", "magic abounds, childlike wonder, adventure", "concealment, density, savagery"],
  "The River": ["The Stream, The Flow, The Current", "acceptance, grace, reflection, forgiveness", "torment of emotions, flooding, overwhelm"],
  "The Ocean": ["The Unconscious, The Depths, The Incomprehensible", "deeper than deep, big dreams, discovery", "subsumed, drowned, polluted, unpredictable"],
  "The Castle": ["The Palace, The Penthouse, The Fortress", "visiting your throne of power", "stuckness, depression, spells, walls"],
  "The Box": ["The Cage, The Rules, The Norm", "structure, order, coherence, logic", "limitation, rigidity, judgment, fear"],
  "The Threshold": ["The Door, The Gate, The Initiation", "growth, individuation, ease in the liminal", "resisting, refusal to grow, barriers, boundaries"],
  "The Underworld": ["The Nightmare, The Ordeal, The Bottom", "bravery, depth, facing of deepest fears", "denial, suppression, evil, unconsciousness"],

  "The Creator": ["The Artist, The Alchemist, The Innovator", "curious, playful, open, surprising", "loses spark, feels burdened"],
  "The Destroyer": ["The Savage, The Unexpected, The Rejected", "swift and precise blows that redirect our life", "self-destruction, negativity, unwillingness to rebuild"],
  "The Healer": ["The Lightworker, The Gifted, The Old Soul", "self-contained, grateful, awake", "tired, needy, forgetting its own practice"],
  "The Comic": ["The Joker, The Clown, The Fool", "hilarious, ingenious, spirited, easygoing", "sarcastic, harsh, brooding, drunk"],
  "The Unseen": ["The Spirit, The Ancestor, The Eternal", "clairvoyant guidance, whispers of wisdom", "dark looming energy, unwillingness to forgive"],
  "The Shadow": ["The Unspeakable, The Unwelcome, The Denied", "revealing unconscious aspects of The Self and world", "denying unconscious aspects of The Self and world"],
  "The Self": ["The Soul, The Witness, The Watcher", "witnessing, accepting new aspects of self", "disjointed, fatigued, diffused energy and purpose"],
  "The One": ["Nonduality, One Love, Unus Mundus", "serves, loves, accepts, resonates", "ignores, omits, excludes"],
  "The Mother": ["The Great Mother, The Feminine, The Source", "glowing, generative, creative, nurturing", "dim, exhausted, controlling, limiting"],
  "The Father": ["The Great Father, The Masculine, The Protector", "supportive, strategic, regal, kind authority", "disappearing, disappointing, devastated by failures"],
  "The Starborn": ["The Divine Child, The Starchild, The Destined", "alight, trusting, vibrant, aimed", "feeling of misalignment, loss of longing"],
  "The Eternal Child": ["The Inner Child, The Child of Joy", "joyful, playful, accepts all, magic", "addicted, selfish, adrift, burns out"],
  "The Orphan": ["The Wounded Child, The Abandoned, The Beggar", "deep solace, deep acceptance, deep love", "distanced, “hates” and avoids, controlling, limiting"],
  "The Mentor": ["The Teacher, The Sage, The Guru", "focused, clear, bright, remains a student", "self-serving, envious of youth, righteous, rigid"],
  "The Poet": ["The Artist, The Witness, The Truth-Teller", "clairvoyant, wise, timeless", "harmful words, sharp tongue, thwarted creativity"],
  "The Maiden": ["The Virgin, The Princess, The Innocent", "curious, enchanting, sensual, full of vitality", "pretends, projects, denies, fantasizes"],
  "The Hunter": ["The Seeker, The Pursuer, The Predator", "focused, energized, respectful, seasoned", "irresponsible, violates, violent, poaching"],
  "The Warrior": ["The Samurai, The Soldier, The Advocate", "fierce clarity, purposeful action, resolve, resilience", "threats, savagery, abandoning mission and values"],
  "The Queen": ["The Empress, The Mother Queen, The Sovereign", "the embodiment of grace, courage, resolve, stillness", "vain, wrathful, self-righteous, demanding"],
  "The King": ["The Ruler, The Commander, The Emperor", "benevolence, divine leadership, service, nobility", "oppression, misuse of power, corruption"],
  "The Shapeshifter": ["The Trickster, The Elusive, The Formless", "vibrant, adaptive, humorous", "charlatan, people pleasing, trickery"],
  "The Crone": ["The Witch, The Old Woman, The Sage", "magic, clairvoyant, psychic, intuitive, wise", "vindictive, bitter, isolated, ostracized"],
  "The Shaman": ["The Magi, The Sorcerer, The Medicine Woman", "fearless student and practitioner", "overpromises, blames, hurts self and others"],
  "The Judge": ["The Critic, The Diplomat, The Advocate", "discernment, advocacy, right action, compassion", "critical, punishing, unforgiving, wall building"],
  "The Lover": ["The Heart, The Beloved, The Devoted", "connection, expansion, devotion, awe", "indulgence, attachment, obsession"],
  "The Siren": ["The Temptress, The Seducer, The Femme Fatale", "awakened sensuality, absorption, arousal", "wickedness, adultery, wreckage, betrayal, insatiability"],
  "The Animal": ["The Beast, The Wild One, The She-Wolf", "vital, elemental, alive, dances", "savagery, pent-up emotion, lashing out"],
  "The Pilgrim": ["The Wanderer, The Traveler, The Apprentice", "learns, grows, adapts, studies", "aloof, noncommittal, flaky"],
  "The Mystic": ["The Seeker, The Lightworker, The Dreamer", "remover of darkness, visionary, ageless", "expects results, seeks attention and recognition"],
  "The Sustainer": ["The Peacemaker, The Upholder, The Preserver", "abundant, generous, supportive, reliable", "overworked, resentful, trapped, tired"]
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
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

function buildArchetypesDeck() {
  const groups = [
    { type: "Selves", names: ARCHETYPE_SELVES },
    { type: "Places", names: ARCHETYPE_PLACES },
    { type: "Tools", names: ARCHETYPE_TOOLS },
    { type: "Initiations", names: ARCHETYPE_INITIATIONS }
  ];

  const cards = [];
  groups.forEach(({ type, names }) => {
    names.forEach((name, index) => {
      const [subtitle, light] = ARCHETYPE_DATA[name];
      cards.push({
        name,
        arcana: "Archetypes",
        type,
        color: ARCHETYPE_COLORS[type],
        slug: `archetypes-${slugify(name)}-${index}`,
        subtitle,
        meaning: `${capitalize(light)}.`
      });
    });
  });

  return cards;
}

const DECKS = {
  classical: { name: "Tarot of the Divine", cards: CLASSICAL_DECK, allowReversed: true },
  custom: { name: "Oracle of the Divine", cards: buildCustomDeck(), allowReversed: false },
  archetypes: {
    name: "Archetypes",
    cards: buildArchetypesDeck(),
    allowReversed: false
  }
};

// Spreads from the Archetype Deck guidebook. "pool" restricts a position to
// one of the deck's four types (Selves/Places/Tools/Initiations); omitting it
// draws from the whole 78-card deck. "layout" selects the CSS arrangement.
// "intro"/"blurb" feed the info popover in the spread picker.
const ARCHETYPE_SPREADS = [
  {
    name: "The Inner Quest",
    layout: "square",
    intro: "The signature spread of the deck. Draw one card from each pile - Selves, Places, Tools, Initiations - and watch a narrative of your life unfold.",
    positions: [
      { role: "Who", pool: "Selves", blurb: "The archetypal side of the story - the part of the self most dominant right now." },
      { role: "Where", pool: "Places", blurb: "The archetypal setting - the energy surrounding and influencing this chapter." },
      { role: "With What", pool: "Tools", blurb: "The archetypal tool you must use, find, or give up so destiny can unfold." },
      { role: "Why", pool: "Initiations", blurb: "The deeper purpose - the mythic theme your whole journey is “about.”" }
    ]
  },
  {
    name: "The Heroine's Journey",
    layout: "row",
    intro: "Based on Joseph Campbell's story arc. A great reading for the precipice of a milestone - a new year, a big relationship, a graduation, a birthday, a trip.",
    positions: [
      { role: "The Call", blurb: "The inner voice, agitation, or inspiration that prompts you to embark on a new journey." },
      { role: "The Threshold", blurb: "The obstacle to leaving - the habit that wants to hold you back, as it likely has before." },
      { role: "The Ordeal", blurb: "The profound challenge you'll face along the way - the shadow that reveals itself so you can grow." },
      { role: "The Boon", blurb: "The reward, wisdom, or blessing you attain on the return - mystical, not a creature comfort." },
      { role: "The Return", blurb: "What to expect upon your return - the “homecoming” that tests integrating real change." }
    ]
  },
  {
    name: "The Axis Mundi",
    layout: "axis",
    intro: "A sacred model of the cosmos linking sky and earth, the cosmic and the everyday. Good for exploring what role divinity plays in your life.",
    positions: [
      { role: "Underworld", blurb: "What remains unconscious, perhaps causing trouble until it becomes known." },
      { role: "Past", blurb: "What still lingers in your energy field - to release, or a lesson resurfacing now." },
      { role: "Heaven", blurb: "The potential blessing or guide watching over the situation - an otherworldly grace." },
      { role: "Future", blurb: "What's next, welcomed or not - the image on the horizon, personal and collective." },
      { role: "Self", blurb: "The stable, central force holding your whole sense of self together." }
    ]
  },
  {
    name: "Summon the Divine",
    layout: "vertical",
    intro: "Modeled on the spine as a vertical path toward divinity. Focusing on the root, heart, and crown gives a clear view of the spiritual, emotional, and physical.",
    positions: [
      { role: "Root", blurb: "The archetypal foundation - grounding, fears, habits, and stuckness in your primary relationships and community." },
      { role: "Heart", blurb: "The image currently residing in the heart - a deep longing, calling, or conflict at the center of it all." },
      { role: "Crown", blurb: "The archetypal energy of the divinity within - what's blocking ascension, and how you can serve the world." }
    ]
  }
];

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
const cardFrontEl = document.getElementById("cardFront");
const cardFrontContentEl = document.getElementById("cardFrontContent");
const spreadCirclesEl = document.getElementById("spreadCircles");
const arcanaLabelEl = document.getElementById("arcanaLabel");
const cardTitleEl = document.getElementById("cardTitle");
const cardSubtitleEl = document.getElementById("cardSubtitle");
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
const spreadMenuEl = document.getElementById("spreadMenu");
const historySectionEl = document.getElementById("historySection");
const selectorToggleEl = document.getElementById("selectorToggle");
const deckSelectorStaticLabelEl = document.getElementById("deckSelectorStaticLabel");
const spreadInfoPopoverEl = document.getElementById("spreadInfoPopover");
const spreadInfoBodyEl = document.getElementById("spreadInfoBody");
const spreadInfoCloseEl = document.getElementById("spreadInfoClose");
const cardSecretEl = document.getElementById("cardSecret");
const cardSecretTextEl = document.getElementById("cardSecretText");
const burnGlowEl = document.getElementById("burnGlow");
const burnEmbersEl = document.getElementById("burnEmbers");
const wideLayoutQuery = window.matchMedia(
  "(orientation: landscape) and (min-width: 700px) and (min-height: 560px)"
);

// Secret card messages: hold down on a card that has an entry here once
// it's revealed, and its face burns away to reveal a gold message
// underneath. Add more entries to surface the feature on other cards.
const CARD_SECRET_MESSAGES = {
  "The Magician": "To the Magician in our lives:\ndream it, and it will be real."
};

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

function renderHistory(animateNew = false) {
  if (pullHistory.length === 0) {
    historyBody.innerHTML = '<tr><td colspan="3" class="history-empty">No pulls yet</td></tr>';
    historyCount.textContent = formatHistoryCount(0);
    return;
  }

  const rows = pullHistory
    .slice(0, 10)
    .map((entry, idx) => {
      const type = getCardTypeSymbol(entry.card);
      const enterClass = animateNew && idx === 0 ? " history-row-enter" : "";
      return `
      <tr class="history-row${enterClass}" data-history-index="${idx}" tabindex="0" role="button" aria-label="View ${entry.card.name}">
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
  renderHistory(true);
}

function animateCardPull() {
  cardSlotEl.classList.remove("pulling");
  void cardSlotEl.offsetWidth;
  cardSlotEl.classList.add("pulling");
}

let lastRoleOverride = null;

function renderCardFace(card, roleOverride) {
  resetCardSecretBurn();

  if (roleOverride !== undefined) {
    lastRoleOverride = roleOverride;
  }

  arcanaLabelEl.textContent = lastRoleOverride || card.type || card.arcana;
  cardTitleEl.textContent = card.name;
  cardSubtitleEl.textContent = card.subtitle || "";
  cardSubtitleEl.hidden = !card.subtitle;
  orientationRowEl.hidden = !activeDeck.allowReversed;
  const [uprightLabel, reversedLabel] = activeDeck.orientationLabels || ["Upright", "Reversed"];
  orientationLabelEl.textContent = card.reversed ? reversedLabel : uprightLabel;
  orientationLabelEl.classList.toggle("is-reversed", card.reversed);
  cardDescriptionEl.textContent = card.meanings
    ? card.meanings[card.reversed ? 1 : 0]
    : card.meaning || "";
  cardArtEl.style.setProperty("--card-color", card.color);
  cardArtEl.classList.toggle("is-reversed", card.reversed);
  cardFrontContentEl.classList.toggle("is-reversed", card.reversed);
  loadCardArt(card);
}

function onCardFlipTransitionEnd(callback) {
  function handler(event) {
    if (event.target !== cardEl || event.propertyName !== "transform") {
      return;
    }
    cardEl.removeEventListener("transitionend", handler);
    callback();
  }
  cardEl.addEventListener("transitionend", handler);
}

function triggerRevealFanfare() {
  cardEl.classList.remove("revealing");
  void cardEl.offsetWidth;
  cardEl.classList.add("revealing");

  cardFrontContentEl.classList.remove("content-pending", "content-cascade");
  void cardFrontContentEl.offsetWidth;
  cardFrontContentEl.classList.add("content-cascade");
}

function openCard(card, roleOverride) {
  cardFrontContentEl.classList.remove("content-cascade");
  cardFrontContentEl.classList.add("content-pending");
  renderCardFace(card, roleOverride);
  animateCardPull();
  flipBtn.hidden = !activeDeck.allowReversed;
  cardEl.classList.add("flipped");
  isFlipped = true;

  if (isArchetypesActive()) {
    hintEl.textContent = "";
  } else {
    hintEl.textContent = "Tap anywhere to draw again";
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    triggerRevealFanfare();
  } else {
    onCardFlipTransitionEnd(triggerRevealFanfare);
  }
}

function revealCard(card, roleOverride) {
  if (!isFlipped) {
    openCard(card, roleOverride);
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  cardEl.classList.remove("flipped");
  isFlipped = false;

  if (prefersReducedMotion) {
    openCard(card, roleOverride);
  } else {
    onCardFlipTransitionEnd(() => openCard(card, roleOverride));
  }
}

function showCard(card) {
  currentCard = { ...card };
  currentSpreadPositionIndex = null;
  revealCard(currentCard, null);
  addToHistory({ ...card });
}

function showArchetypeCard(card) {
  if (!spreadOpened) {
    openSpreadFace();
  }
  revealSpreadPosition(card);
  renderSpreadCircles();
}

function showSearchedCard(card) {
  currentCard = { ...card, reversed: false };
  currentSpreadPositionIndex = null;

  if (isArchetypesActive()) {
    showArchetypeCard(currentCard);
  } else {
    revealCard(currentCard, null);
  }
}

function showHistoryCard(card) {
  currentCard = { ...card };
  currentSpreadPositionIndex = null;

  if (isArchetypesActive()) {
    showArchetypeCard(currentCard);
  } else {
    revealCard(currentCard, null);
  }
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
  resetCardSecretBurn();

  cardEl.classList.remove("flipped");
  isFlipped = false;

  arcanaLabelEl.textContent = "Major Arcana";
  cardTitleEl.textContent = "\u2014";
  cardSubtitleEl.textContent = "";
  cardSubtitleEl.hidden = true;
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

// ---- Secret card reveal pipeline ----
// Hold down on a revealed card that has an entry in CARD_SECRET_MESSAGES
// and its face burns away (a growing hole eats the normal content via a
// CSS mask, with an ember ring and rising sparks tracking the edge) to
// show a gold message sitting behind it. Resets whenever the card display
// changes - via renderCardFace()/clearCardDisplay() above - so it never
// lingers on the wrong card or survives a shuffle. To add another card,
// just add its name and message to CARD_SECRET_MESSAGES above.

const SECRET_HOLD_MS = 1600;
const SECRET_HOLD_MOVE_TOLERANCE = 12;
const SECRET_BURN_DURATION_MS = 1600;
const SECRET_BURN_MAX_RADIUS = 145;
const SECRET_EMBER_INTERVAL_MS = 70;
// Slightly above center, roughly where a thumb would rest on the card.
const SECRET_BURN_ORIGIN = { x: 50, y: 42 };

let secretBurning = false;
let secretBurnt = false;
let secretHoldTimer = null;
let secretHoldStartX = 0;
let secretHoldStartY = 0;
let secretBurnFrame = null;
let secretJustBurned = false;

function activeSecretMessage() {
  if (!isFlipped || isArchetypesActive() || !currentCard) {
    return null;
  }
  return CARD_SECRET_MESSAGES[currentCard.name] || null;
}

function clearSecretHoldTimer() {
  if (secretHoldTimer !== null) {
    clearTimeout(secretHoldTimer);
    secretHoldTimer = null;
  }
}

function resetCardSecretBurn() {
  secretBurning = false;
  secretBurnt = false;
  clearSecretHoldTimer();

  if (secretBurnFrame !== null) {
    cancelAnimationFrame(secretBurnFrame);
    secretBurnFrame = null;
  }

  cardFrontEl.classList.remove("card-secret-burning");
  cardSecretEl.classList.remove("is-revealed");
  cardFrontContentEl.style.maskImage = "";
  cardFrontContentEl.style.webkitMaskImage = "";
  burnGlowEl.style.opacity = "";
  burnGlowEl.style.background = "";
  burnEmbersEl.replaceChildren();
}

function spawnEmber(radius) {
  const rect = cardFrontEl.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }

  // "circle" radial-gradients resolve percentage radii against the box's
  // normalized diagonal (CSS spec), not width/height directly - match
  // that here so embers land right on the burning edge.
  const diagonal = Math.sqrt(rect.width * rect.width + rect.height * rect.height) / Math.SQRT2;
  const radiusPx = (radius / 100) * diagonal;
  const originXpx = (SECRET_BURN_ORIGIN.x / 100) * rect.width;
  const originYpx = (SECRET_BURN_ORIGIN.y / 100) * rect.height;
  const angle = Math.random() * Math.PI * 2;
  const jitter = (Math.random() - 0.5) * 14;

  const ember = document.createElement("span");
  ember.className = "ember";
  ember.style.left = `${originXpx + Math.cos(angle) * (radiusPx + jitter)}px`;
  ember.style.top = `${originYpx + Math.sin(angle) * (radiusPx + jitter)}px`;
  ember.style.setProperty("--dx", `${(Math.random() - 0.5) * 24}px`);
  ember.style.setProperty("--dur", `${0.7 + Math.random() * 0.5}s`);
  ember.addEventListener("animationend", () => ember.remove(), { once: true });
  burnEmbersEl.appendChild(ember);
}

function playCardSecretBurn() {
  if (secretBurning || secretBurnt) {
    return;
  }

  const message = activeSecretMessage();
  if (!message) {
    return;
  }

  secretBurning = true;
  cardSecretTextEl.textContent = message;
  cardFrontEl.classList.add("card-secret-burning");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = prefersReducedMotion ? 1 : SECRET_BURN_DURATION_MS;
  const startTime = performance.now();
  const { x: originX, y: originY } = SECRET_BURN_ORIGIN;
  let lastEmberTime = startTime - SECRET_EMBER_INTERVAL_MS;

  function step(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const radius = eased * SECRET_BURN_MAX_RADIUS;
    const mask = `radial-gradient(circle at ${originX}% ${originY}%, transparent 0%, transparent ${radius}%, black ${Math.min(100, radius + 9)}%)`;
    cardFrontContentEl.style.maskImage = mask;
    cardFrontContentEl.style.webkitMaskImage = mask;

    // Ring of ember light hugging the growing edge, instead of a fixed
    // central glow, so it reads as the actual burn front.
    const glowFade = t < 0.08 ? t / 0.08 : t > 0.82 ? Math.max(0, 1 - (t - 0.82) / 0.18) : 1;
    burnGlowEl.style.opacity = String(glowFade * 0.95);
    burnGlowEl.style.background = `radial-gradient(circle at ${originX}% ${originY}%, transparent ${Math.max(0, radius - 12)}%, rgba(255, 178, 90, 0.95) ${radius}%, rgba(255, 90, 20, 0.42) ${radius + 7}%, transparent ${radius + 18}%)`;

    if (!prefersReducedMotion && t < 0.92 && now - lastEmberTime > SECRET_EMBER_INTERVAL_MS) {
      lastEmberTime = now;
      spawnEmber(radius);
    }

    if (t < 1) {
      secretBurnFrame = requestAnimationFrame(step);
    } else {
      secretBurnFrame = null;
      secretBurning = false;
      secretBurnt = true;
      burnGlowEl.style.opacity = "0";
      cardSecretEl.classList.add("is-revealed");
    }
  }

  secretBurnFrame = requestAnimationFrame(step);
}

cardEl.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }
  if (!activeSecretMessage() || secretBurning || secretBurnt) {
    return;
  }

  secretHoldStartX = event.clientX;
  secretHoldStartY = event.clientY;
  clearSecretHoldTimer();
  secretHoldTimer = setTimeout(() => {
    secretHoldTimer = null;
    secretJustBurned = true;
    playCardSecretBurn();
  }, SECRET_HOLD_MS);
});

cardEl.addEventListener("pointermove", (event) => {
  if (secretHoldTimer === null) {
    return;
  }
  const dx = event.clientX - secretHoldStartX;
  const dy = event.clientY - secretHoldStartY;
  if (Math.hypot(dx, dy) > SECRET_HOLD_MOVE_TOLERANCE) {
    clearSecretHoldTimer();
  }
});

["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
  cardEl.addEventListener(eventName, clearSecretHoldTimer);
});

// ---- Archetype spreads ----
// The Archetypes deck lays out labeled positions (see ARCHETYPE_SPREADS) as
// circles inside the card face itself. Tapping an empty circle draws for
// that position; tapping a filled one reviews it. The Deck/Spread toggle
// next to the deck picker swaps the spread menu in when this deck is
// active; the Shuffle and history/menu buttons keep their normal jobs.

let currentSpreadIndex = 0;
let spreadPositions = [];
let currentSpreadPositionIndex = null;
let spreadOpened = false;

function isArchetypesActive() {
  return deckSelect.value === "archetypes";
}

function currentSpread() {
  return ARCHETYPE_SPREADS[currentSpreadIndex];
}

function resetSpreadPositions() {
  spreadPositions = currentSpread().positions.map((position) => ({ ...position, card: null }));
  currentSpreadPositionIndex = null;
}

function pickCardForPosition(position) {
  const pool = position.pool
    ? activeDeck.cards.filter((card) => card.type === position.pool)
    : activeDeck.cards;
  const usedNames = new Set(spreadPositions.filter((p) => p.card).map((p) => p.card.name));
  const available = pool.filter((card) => !usedNames.has(card.name));
  const candidates = available.length > 0 ? available : pool;
  const card = candidates[Math.floor(random() * candidates.length)];
  const reversed = activeDeck.allowReversed && random() < 0.5;
  return { ...card, reversed };
}

function renderSpreadCircles() {
  if (!isArchetypesActive()) {
    spreadCirclesEl.hidden = true;
    spreadCirclesEl.innerHTML = "";
    return;
  }

  spreadCirclesEl.hidden = false;
  spreadCirclesEl.className = `spread-circles spread-circles--${currentSpread().layout}`;
  spreadCirclesEl.innerHTML = spreadPositions
    .map((position, index) => {
      const filled = Boolean(position.card);
      const focused = index === currentSpreadPositionIndex;
      const color = filled ? position.card.color : "var(--surface-line)";
      const label = position.role + (filled ? `: ${position.card.name}` : " (undrawn)");
      const classes = ["spread-circle", filled && "is-filled", focused && "is-focused"]
        .filter(Boolean)
        .join(" ");
      return `
      <button type="button" class="${classes}" data-position-index="${index}" style="--slot-color:${color}" aria-label="${label}">
        ${filled ? `<span class="spread-circle-placeholder"></span>` : ""}
        <span class="spread-circle-role">${position.role}</span>
      </button>
    `;
    })
    .join("");
}

function updateBodySpreadClasses() {
  const active = isArchetypesActive();
  document.body.classList.toggle("is-spread-deck", active);
  document.body.classList.remove("spread-layout-row", "spread-layout-square", "spread-layout-axis", "spread-layout-vertical");
  if (active) {
    document.body.classList.add(`spread-layout-${currentSpread().layout}`);
  }
  cardFrontEl.classList.toggle("has-spread", active);
}

function prepareSpreadClosed() {
  updateBodySpreadClasses();
  spreadOpened = false;

  cardFrontEl.classList.remove("is-open");
  cardEl.classList.remove("shuffling", "revealing");
  cardFrontContentEl.classList.remove("content-pending", "content-cascade");
  arcanaLabelEl.textContent = "";
  cardTitleEl.textContent = "";
  cardSubtitleEl.textContent = "";
  cardSubtitleEl.hidden = true;
  orientationRowEl.hidden = true;
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
  flipBtn.hidden = true;
  currentCard = null;
  currentSpreadPositionIndex = null;
  lastRoleOverride = null;

  cardEl.classList.remove("flipped");
  isFlipped = false;

  renderSpreadCircles();
  hintEl.textContent = `Tap to begin ${currentSpread().name}`;
}

function openSpreadFace() {
  spreadOpened = true;
  cardFrontEl.classList.add("is-open");
  cardEl.classList.add("flipped");
  isFlipped = true;
  renderSpreadCircles();
  hintEl.textContent = "Tap a circle to draw";
}

function revealSpreadPosition(card) {
  // Unlike revealCard(), the card never unflips here - it stays flipped the
  // whole time a spread is on screen (that's what keeps the circles
  // visible). Re-render straight into the reveal fanfare instead of
  // waiting on a flip-transition that would never fire.
  cardFrontContentEl.classList.remove("content-cascade");
  cardFrontContentEl.classList.add("content-pending");
  // The role (Who/Where/Crown/...) is already shown on the spread circle
  // itself, so don't repeat it on the card face - let the label fall back
  // to the card's own type (Selves/Places/Tools/Initiations).
  renderCardFace(card, null);
  flipBtn.hidden = !activeDeck.allowReversed;
  triggerRevealFanfare();
}

function handleCircleTap(index) {
  if (!spreadOpened) {
    return;
  }

  const position = spreadPositions[index];
  if (!position) {
    return;
  }

  const isNewDraw = !position.card;
  if (isNewDraw) {
    position.card = pickCardForPosition(position);
  }

  currentSpreadPositionIndex = index;
  currentCard = { ...position.card };
  revealSpreadPosition(currentCard);

  if (isNewDraw) {
    addToHistory({ ...position.card });
  }

  renderSpreadCircles();
}

function startSpread(spreadIndex) {
  currentSpreadIndex = spreadIndex;
  resetSpreadPositions();
  prepareSpreadClosed();
  reseedRandom();
  renderMenuPanel();
}

spreadCirclesEl.addEventListener("click", (event) => {
  const circle = event.target.closest(".spread-circle");
  if (circle) {
    // Stop here rather than relying on the document handler's
    // #spreadCircles exclusion: handleCircleTap() re-renders this
    // container's innerHTML, which detaches the clicked button
    // mid-bubble and would make a later closest() check on it fail.
    event.stopPropagation();
    handleCircleTap(Number(circle.dataset.positionIndex));
  }
});

let selectorMode = "deck";

function updateSelectorToggle() {
  const active = isArchetypesActive();
  if (!active) {
    selectorMode = "deck";
  }

  const spreadMode = active && selectorMode === "spread";

  deckSelectorStaticLabelEl.hidden = active;
  selectorToggleEl.hidden = !active;
  selectorToggleEl.textContent = selectorMode === "spread" ? "Spread" : "Deck";
  selectorToggleEl.dataset.mode = selectorMode;
  deckSelect.hidden = spreadMode;
  spreadMenuEl.hidden = !spreadMode;

  if (!spreadMode) {
    closeSpreadInfo();
  }
}

function renderMenuPanel() {
  updateSelectorToggle();

  if (!isArchetypesActive()) {
    spreadMenuEl.innerHTML = "";
    return;
  }

  spreadMenuEl.innerHTML = `<p class="spread-menu-title">Spread</p>` + ARCHETYPE_SPREADS
    .map((spread, index) => `
      <div class="spread-menu-row">
        <button type="button" class="spread-menu-option${index === currentSpreadIndex ? " is-active" : ""}" data-spread-index="${index}">
          ${spread.name}
          <em ${index === currentSpreadIndex ? "" : "hidden"}>(current)</em>
        </button>
        <button type="button" class="spread-info-btn" data-spread-info-index="${index}" aria-label="About ${spread.name}">i</button>
      </div>
    `)
    .join("");
}

function toggleSelectorMode() {
  selectorMode = selectorMode === "spread" ? "deck" : "spread";
  updateSelectorToggle();
  if (selectorMode === "spread") {
    renderMenuPanel();
  }
}

selectorToggleEl.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleSelectorMode();
});

// It's a <span role="button"> (not a real <button>) so it can share the
// static label's element type and inherit identical typography with zero
// risk of drifting from the other deck pages' look; that means it needs
// its own Enter/Space handling for keyboard activation.
selectorToggleEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    event.stopPropagation();
    toggleSelectorMode();
  }
});

let openSpreadInfoIndex = null;

function closeSpreadInfo() {
  spreadInfoPopoverEl.hidden = true;
  openSpreadInfoIndex = null;
}

function openSpreadInfo(index) {
  const spread = ARCHETYPE_SPREADS[index];
  const positionsHtml = spread.positions
    .map((position) => `<li><strong>${position.role}:</strong> ${position.blurb}</li>`)
    .join("");

  spreadInfoBodyEl.innerHTML = `
    <p class="spread-info-title">${spread.name}</p>
    <p class="spread-info-intro">${spread.intro}</p>
    <ul class="spread-info-positions">${positionsHtml}</ul>
  `;
  spreadInfoPopoverEl.hidden = false;
  openSpreadInfoIndex = index;
}

function toggleSpreadInfo(index) {
  if (openSpreadInfoIndex === index) {
    closeSpreadInfo();
  } else {
    openSpreadInfo(index);
  }
}

spreadInfoCloseEl.addEventListener("click", (event) => {
  event.stopPropagation();
  closeSpreadInfo();
});

spreadMenuEl.addEventListener("click", (event) => {
  const infoBtn = event.target.closest(".spread-info-btn");
  if (infoBtn) {
    event.stopPropagation();
    toggleSpreadInfo(Number(infoBtn.dataset.spreadInfoIndex));
    return;
  }

  const option = event.target.closest(".spread-menu-option");
  if (option) {
    // Same reasoning as spreadCirclesEl above: startSpread() rebuilds this
    // menu's innerHTML, detaching the clicked button mid-bubble.
    event.stopPropagation();
    closeSpreadInfo();
    startSpread(Number(option.dataset.spreadIndex));
    closeMenuIfCompact();
  }
});

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMenu();
});

deckSelect.addEventListener("change", () => {
  activeDeck = DECKS[deckSelect.value];
  saveDeckKey(deckSelect.value);
  resetReading();

  if (isArchetypesActive()) {
    startSpread(0);
  } else {
    updateBodySpreadClasses();
    renderSpreadCircles();
  }

  renderMenuPanel();
  closeMenuIfCompact();
});

document.addEventListener("click", (event) => {
  // A held tap that just triggered the Magician burn also fires a click
  // on release - swallow that one click so it doesn't also pull a new
  // card out from under the reveal.
  if (secretJustBurned) {
    secretJustBurned = false;
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (event.target.closest("#shuffleBtn")) {
    return;
  }

  if (event.target.closest("#menuToggle")) {
    return;
  }

  if (event.target.closest("#historyPanel")) {
    return;
  }

  if (event.target.closest("#deckSelectorRow")) {
    return;
  }

  if (event.target.closest("#spreadInfoPopover")) {
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

  if (event.target.closest("#spreadCircles")) {
    return;
  }

  if (isThemeMenuOpen) {
    return;
  }

  if (openSpreadInfoIndex !== null) {
    closeSpreadInfo();
    return;
  }

  if (isArchetypesActive()) {
    if (!spreadOpened) {
      openSpreadFace();
    }
    return;
  }

  const card = pullCard();
  showCard(card);
});

function startShuffleShake() {
  cardEl.classList.remove("shuffling");
  cardSlotEl.classList.remove("shuffle-fan");
  void cardEl.offsetWidth;
  cardEl.classList.add("shuffling");
  cardSlotEl.classList.add("shuffle-fan");
}

shuffleBtn.addEventListener("click", () => {
  const wasFlipped = isFlipped;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isArchetypesActive()) {
    resetSpreadPositions();
    prepareSpreadClosed();
  } else {
    clearCardDisplay();
  }

  reseedRandom();

  if (wasFlipped && !prefersReducedMotion) {
    onCardFlipTransitionEnd(startShuffleShake);
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

  if (currentSpreadPositionIndex !== null) {
    const position = spreadPositions[currentSpreadPositionIndex];
    if (position && position.card) {
      position.card.reversed = currentCard.reversed;
    }
  }
});

cardEl.addEventListener("animationend", (event) => {
  if (event.animationName === "shuffle-shake") {
    cardEl.classList.remove("shuffling");
  } else if (event.animationName === "reveal-pop") {
    cardEl.classList.remove("revealing");
  }
});

cardSlotEl.addEventListener("animationend", (event) => {
  if (event.animationName === "pull-card") {
    cardSlotEl.classList.remove("pulling");
  } else if (event.animationName === "shuffle-slot-glow") {
    cardSlotEl.classList.remove("shuffle-fan");
  }
});

deckSelect.value = initialDeckKey;
populateCardNames();
if (isArchetypesActive()) {
  startSpread(0);
} else {
  updateBodySpreadClasses();
}
renderMenuPanel();
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
  "": '<circle cx="9" cy="9" r="7"/><circle cx="9" cy="9" r="3.5"/><circle cx="14.5" cy="6" r="1" fill="currentColor" stroke="none"/>',
  holo: '<path d="M4 7 L9 2 L14 7 L9 16 Z"/><path d="M4 7 L14 7"/><path d="M6.5 7 L9 2 L11.5 7"/>',
  terminal: '<path d="M3 5 L8 9 L3 13"/><path d="M9.5 14 L15 14"/>',
  deco: '<path d="M9 16 L9 2 M9 16 L4.5 4 M9 16 L13.5 4 M9 16 L1.5 9.5 M9 16 L16.5 9.5"/>',
  bloodmoon: '<circle cx="9" cy="9" r="4.5" fill="currentColor" stroke="none"/><circle cx="9" cy="9" r="7.4" stroke-dasharray="1.2 2.4"/>'
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
