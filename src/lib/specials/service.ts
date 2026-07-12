import { getCuratedBirthdays } from "@/lib/specials/birthdays";
import {
  formatSpecialsDate,
  getMonthDay,
  getTodayKey,
  secondsUntilNextLocalMidnight,
} from "@/lib/specials/date";
import { getDailyCache, setDailyCache } from "@/lib/specials/cache";
import { generateWithGrok } from "@/lib/specials/grok";
import type { SpecialItem, TodaysSpecialsResponse } from "@/lib/specials/types";

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ROF-RealOldFriend/1.0 (senior companion app)",
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchQuote(): Promise<SpecialItem> {
  type ZenQuote = { q?: string; a?: string; h?: string };
  const data = await fetchJson<ZenQuote[]>("https://zenquotes.io/api/today");
  const quote = data?.[0];

  if (quote?.q) {
    return {
      id: "quote",
      title: "Quote of the Day",
      summary: `"${quote.q}"`,
      detail: `"${quote.q}"\n\n— ${quote.a || "Unknown"}\n\nA good line to sit with over coffee.`,
      attribution: "ZenQuotes.io",
      attributionUrl: "https://zenquotes.io/",
      sourceLabel: "ZenQuotes",
    };
  }

  return {
    id: "quote",
    title: "Quote of the Day",
    summary: '"The best way to cheer yourself is to try to cheer someone else up."',
    detail:
      '"The best way to cheer yourself is to try to cheer someone else up."\n\n— Mark Twain\n\nA friendly reminder that kindness travels both ways.',
    sourceLabel: "ROF favorites",
  };
}

async function fetchJoke(): Promise<SpecialItem> {
  type Joke = { setup?: string; punchline?: string; type?: string };
  const joke = await fetchJson<Joke>(
    "https://official-joke-api.appspot.com/random_joke",
  );

  if (joke?.setup && joke.punchline) {
    return {
      id: "joke",
      title: "Joke of the Day",
      summary: joke.setup,
      detail: `${joke.setup}\n\n${joke.punchline}\n\nGentle humor for a lighter afternoon.`,
      attribution: "Official Joke API",
      attributionUrl: "https://official-joke-api.appspot.com/",
      sourceLabel: "Official Joke API",
    };
  }

  return {
    id: "joke",
    title: "Joke of the Day",
    summary: "Why did the calendar go to therapy?",
    detail:
      "Why did the calendar go to therapy?\n\nIt had too many dates.\n\nA soft chuckle for the day.",
    sourceLabel: "ROF favorites",
  };
}

async function fetchHistoryAndBirthdays(): Promise<{
  history: SpecialItem;
  birthdays: SpecialItem;
}> {
  const { month, day } = getMonthDay();
  type OnThisDay = {
    data?: {
      Events?: Array<{ text?: string; year?: string | number }>;
      Births?: Array<{ text?: string; year?: string | number }>;
    };
  };
  type WikiEvent = {
    text?: string;
    year?: number;
  };
  type WikiFeed = {
    events?: WikiEvent[];
    births?: Array<{ text?: string; year?: number }>;
  };

  const [payload, wiki] = await Promise.all([
    fetchJson<OnThisDay>(`https://today.zenquotes.io/api/${month}/${day}`),
    fetchJson<WikiFeed>(
      `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,
    ),
  ]);

  const events = payload?.data?.Events ?? [];
  const births = payload?.data?.Births ?? [];

  let topEvents = events
    .map((event) => {
      const year = event.year ? `${event.year}: ` : "";
      return `${year}${event.text || ""}`.trim();
    })
    .filter(Boolean)
    .slice(0, 5);

  let historySource: SpecialItem["sourceLabel"] = "On This Day";
  let historyUrl: string | undefined = "https://today.zenquotes.io/";
  let historyAttribution = "ZenQuotes On This Day";

  if (topEvents.length === 0 && wiki?.events?.length) {
    topEvents = wiki.events
      .map((event) => {
        const year = event.year ? `${event.year}: ` : "";
        return `${year}${event.text || ""}`.trim();
      })
      .filter(Boolean)
      .slice(0, 5);
    historySource = "Wikipedia";
    historyUrl = "https://en.wikipedia.org/wiki/Wikipedia:Selected_anniversaries";
    historyAttribution = "Wikipedia On This Day";
  }

  const history: SpecialItem =
    topEvents.length > 0
      ? {
          id: "history",
          title: "Today in History",
          summary: topEvents[0],
          detail: `Here are a few things that happened on this date:\n\n${topEvents
            .map((line) => `• ${line}`)
            .join("\n")}`,
          attribution: historyAttribution,
          attributionUrl: historyUrl,
          sourceLabel: historySource,
        }
      : {
          id: "history",
          title: "Today in History",
          summary:
            "History is full of ordinary days that quietly shaped the world.",
          detail:
            "History is full of ordinary days that quietly shaped the world.\n\nTake a moment to remember one story from your own life on a day like today.",
          sourceLabel: "ROF favorites",
        };

  const curated = getCuratedBirthdays(month, day);
  const apiBirths = births
    .map((entry) => entry.text)
    .filter((text): text is string => Boolean(text))
    .slice(0, 4);

  const summary =
    curated[0]
      ? `${curated[0].name} (${curated[0].year}) — ${curated[0].note}`
      : apiBirths[0] || "Notable people share this birthday.";

  const detailParts = [
    "Famous birthdays for today:",
    ...curated.map(
      (person) => `• ${person.name} (${person.year}) — ${person.note}`,
    ),
  ];

  if (apiBirths.length > 0) {
    detailParts.push("", "Also noted in history records:");
    detailParts.push(...apiBirths.map((line) => `• ${line}`));
  }

  const birthdays: SpecialItem = {
    id: "birthdays",
    title: "Famous Birthdays",
    summary,
    detail: detailParts.join("\n"),
    attribution: apiBirths.length
      ? "ZenQuotes On This Day + ROF list"
      : "ROF birthday list",
    attributionUrl: apiBirths.length
      ? "https://today.zenquotes.io/"
      : undefined,
    sourceLabel: "Birthdays",
  };

  return { history, birthdays };
}

async function fetchFact(onPrem = false): Promise<SpecialItem> {
  const generated = await generateWithGrok(
    `Write one interesting, wholesome Fact of the Day for older adults.
Return plain text with:
Line 1: a short headline under 12 words
Then a blank line
Then 2-4 short sentences expanding the fact in a warm senior-friendly tone.
No bullet points. No markdown.`,
    undefined,
    { onPrem },
  );

  if (generated) {
    const [headline, ...rest] = generated.split(/\n+/);
    const detail = rest.join("\n\n").trim() || generated;
    return {
      id: "fact",
      title: "Fact of the Day",
      summary: headline.replace(/^["']|["']$/g, "").trim(),
      detail,
      sourceLabel: onPrem ? "Companion (local)" : "Companion (Grok)",
    };
  }

  return {
    id: "fact",
    title: "Fact of the Day",
    summary: "Honey never spoils — jars thousands of years old have still been edible.",
    detail:
      "Honey never spoils — jars thousands of years old have still been edible.\n\nBees make a food so stable that archaeologists have found ancient honey that remained safe to taste. A sweet reminder that some good things truly last.",
    sourceLabel: "ROF favorites",
  };
}

async function fetchWord(onPrem = false): Promise<SpecialItem> {
  const generated = await generateWithGrok(
    `Choose one beautiful English word that older adults may enjoy learning or remembering.
Return plain text with exactly this shape:
Word: WORD
Meaning: one clear sentence
Why it matters: 2 short warm sentences for seniors
Example: one simple sentence using the word.
No markdown.`,
    undefined,
    { onPrem },
  );

  if (generated) {
    const wordMatch = generated.match(/Word:\s*(.+)/i);
    const meaningMatch = generated.match(/Meaning:\s*(.+)/i);
    const word = wordMatch?.[1]?.trim() || "Serenity";
    const meaning = meaningMatch?.[1]?.trim() || generated;
    return {
      id: "word",
      title: "Word of the Day",
      summary: `${word} — ${meaning}`,
      detail: generated,
      sourceLabel: onPrem ? "Companion (local)" : "Companion (Grok)",
    };
  }

  return {
    id: "word",
    title: "Word of the Day",
    summary: "Serenity — a calm, untroubled state of mind.",
    detail:
      "Word: Serenity\nMeaning: A calm, untroubled state of mind.\nWhy it matters: Quiet peace is a gift we can practice daily, even in small moments by a window.\nExample: She found serenity in the soft rhythm of an afternoon rain.",
    sourceLabel: "ROF favorites",
  };
}

export async function getTodaysSpecials(
  onPrem = false,
): Promise<TodaysSpecialsResponse> {
  const dateKey = getTodayKey();
  const cacheKey = `todays-specials:${dateKey}:${onPrem ? "onprem" : "cloud"}`;
  const cached = getDailyCache<TodaysSpecialsResponse>(cacheKey);
  if (cached) return cached;

  const [quote, joke, historyBundle, fact, word] = await Promise.all([
    fetchQuote(),
    fetchJoke(),
    fetchHistoryAndBirthdays(),
    fetchFact(onPrem),
    fetchWord(onPrem),
  ]);

  const payload: TodaysSpecialsResponse = {
    dateKey,
    displayDate: formatSpecialsDate(),
    items: [
      historyBundle.birthdays,
      historyBundle.history,
      quote,
      fact,
      word,
      joke,
    ],
  };

  const mostlyFallback = payload.items.filter((item) =>
    item.sourceLabel.startsWith("ROF"),
  ).length;
  const ttlSeconds =
    mostlyFallback >= 3 ? 15 * 60 : secondsUntilNextLocalMidnight();
  setDailyCache(cacheKey, payload, ttlSeconds);
  return payload;
}
