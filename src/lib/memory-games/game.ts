export type MemoryDifficulty = "easy" | "medium";

export type MemoryThemeId = "garden" | "kitchen" | "holidays";

export type MemoryCardFace = {
  pairId: string;
  label: string;
  symbol: string;
};

export type MemoryTheme = {
  id: MemoryThemeId;
  label: string;
  hint: string;
  faces: MemoryCardFace[];
};

export const MEMORY_THEMES: MemoryTheme[] = [
  {
    id: "garden",
    label: "Garden",
    hint: "Flowers, birds, and sunshine",
    faces: [
      { pairId: "rose", label: "Rose", symbol: "🌹" },
      { pairId: "lily", label: "Lily", symbol: "🌷" },
      { pairId: "oak", label: "Oak", symbol: "🌳" },
      { pairId: "bird", label: "Bird", symbol: "🐦" },
      { pairId: "bee", label: "Bee", symbol: "🐝" },
      { pairId: "sun", label: "Sun", symbol: "☀️" },
      { pairId: "leaf", label: "Leaf", symbol: "🍃" },
      { pairId: "seed", label: "Seed", symbol: "🌱" },
    ],
  },
  {
    id: "kitchen",
    label: "Kitchen",
    hint: "Familiar foods and comfort",
    faces: [
      { pairId: "tea", label: "Tea", symbol: "🍵" },
      { pairId: "bread", label: "Bread", symbol: "🍞" },
      { pairId: "soup", label: "Soup", symbol: "🍲" },
      { pairId: "apple", label: "Apple", symbol: "🍎" },
      { pairId: "pie", label: "Pie", symbol: "🥧" },
      { pairId: "milk", label: "Milk", symbol: "🥛" },
      { pairId: "egg", label: "Egg", symbol: "🥚" },
      { pairId: "cookie", label: "Cookie", symbol: "🍪" },
    ],
  },
  {
    id: "holidays",
    label: "Holidays",
    hint: "Warm celebration favorites",
    faces: [
      { pairId: "gift", label: "Gift", symbol: "🎁" },
      { pairId: "tree", label: "Tree", symbol: "🎄" },
      { pairId: "star", label: "Star", symbol: "⭐" },
      { pairId: "bell", label: "Bell", symbol: "🔔" },
      { pairId: "candle", label: "Candle", symbol: "🕯️" },
      { pairId: "song", label: "Song", symbol: "🎵" },
      { pairId: "heart", label: "Heart", symbol: "💙" },
      { pairId: "home", label: "Home", symbol: "🏠" },
    ],
  },
];

export const DIFFICULTY_PAIR_COUNT: Record<MemoryDifficulty, number> = {
  easy: 6,
  medium: 8,
};

export type MemoryCard = {
  uid: string;
  pairId: string;
  label: string;
  symbol: string;
  flipped: boolean;
  matched: boolean;
};

export type MemoryScore = {
  difficulty: MemoryDifficulty;
  themeId: MemoryThemeId;
  moves: number;
  seconds: number;
  completedAt: string;
  daily: boolean;
};

export const MEMORY_SCORES_KEY = "rof-memory-games-scores-v1";

export function getTheme(id: MemoryThemeId): MemoryTheme {
  return MEMORY_THEMES.find((theme) => theme.id === id) || MEMORY_THEMES[0];
}

/** Deterministic shuffle for daily challenge; random otherwise. */
export function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const next = [...items];
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  for (let i = next.length - 1; i > 0; i -= 1) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function dailySeed(): number {
  const now = new Date();
  return (
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  );
}

export function dailyThemeId(): MemoryThemeId {
  const themes = MEMORY_THEMES;
  return themes[dailySeed() % themes.length].id;
}

export function buildDeck(
  themeId: MemoryThemeId,
  difficulty: MemoryDifficulty,
  seed?: number,
): MemoryCard[] {
  const theme = getTheme(themeId);
  const pairCount = DIFFICULTY_PAIR_COUNT[difficulty];
  const faces = theme.faces.slice(0, pairCount);
  const doubled = faces.flatMap((face, index) => [
    {
      uid: `${face.pairId}-a-${index}`,
      pairId: face.pairId,
      label: face.label,
      symbol: face.symbol,
      flipped: false,
      matched: false,
    },
    {
      uid: `${face.pairId}-b-${index}`,
      pairId: face.pairId,
      label: face.label,
      symbol: face.symbol,
      flipped: false,
      matched: false,
    },
  ]);

  if (typeof seed === "number") {
    return shuffleWithSeed(doubled, seed);
  }

  for (let i = doubled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled;
}

export function loadScores(): MemoryScore[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MEMORY_SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is MemoryScore =>
        !!item &&
        typeof item === "object" &&
        typeof (item as MemoryScore).moves === "number" &&
        typeof (item as MemoryScore).seconds === "number",
    );
  } catch {
    return [];
  }
}

export function saveScore(score: MemoryScore): MemoryScore[] {
  const prev = loadScores();
  const next = [score, ...prev].slice(0, 20);
  window.localStorage.setItem(MEMORY_SCORES_KEY, JSON.stringify(next));
  return next;
}

export function bestScore(
  scores: MemoryScore[],
  difficulty: MemoryDifficulty,
  daily = false,
): MemoryScore | null {
  const filtered = scores.filter(
    (score) => score.difficulty === difficulty && score.daily === daily,
  );
  if (filtered.length === 0) return null;
  return filtered.reduce((best, score) => {
    if (score.moves < best.moves) return score;
    if (score.moves === best.moves && score.seconds < best.seconds) return score;
    return best;
  });
}
