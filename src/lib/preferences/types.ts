export const NEWS_TOPIC_OPTIONS = [
  { id: "general", label: "General" },
  { id: "health", label: "Health" },
  { id: "science", label: "Science" },
  { id: "technology", label: "Technology" },
  { id: "business", label: "Business" },
  { id: "entertainment", label: "Entertainment" },
  { id: "sports", label: "Sports news" },
] as const;

export const SPORTS_LEAGUE_OPTIONS = [
  { id: "NFL", label: "NFL Football" },
  { id: "NBA", label: "NBA Basketball" },
  { id: "MLB", label: "MLB Baseball" },
  { id: "NHL", label: "NHL Hockey" },
  { id: "MLS", label: "Soccer (MLS)" },
] as const;

export const PRAYER_DENOMINATIONS = [
  {
    id: "christian",
    label: "Christian / Bible",
    hint: "Scripture and prayer",
  },
  {
    id: "jewish",
    label: "Jewish / Torah",
    hint: "Blessings and Torah wisdom",
  },
  {
    id: "muslim",
    label: "Muslim / Quran",
    hint: "Quranic reflection and dua",
  },
  {
    id: "sikh",
    label: "Sikh / Guru teachings",
    hint: "Guru Granth Sahib inspiration",
  },
  {
    id: "mindfulness",
    label: "General mindfulness",
    hint: "Calm breathing and kindness",
  },
] as const;

export type NewsTopicId = (typeof NEWS_TOPIC_OPTIONS)[number]["id"];
export type SportsLeagueId = (typeof SPORTS_LEAGUE_OPTIONS)[number]["id"];
export type PrayerDenominationId =
  (typeof PRAYER_DENOMINATIONS)[number]["id"];

export type FeatureModalId =
  | "weather"
  | "sports"
  | "book-club"
  | "prayer"
  | "memory-games";

export type UserPreferences = {
  userId: string;
  weatherCity: string;
  newsTopics: NewsTopicId[];
  sportsLeagues: SportsLeagueId[];
  sportsTeams: string[];
  youtubeQuery: string;
  prayerDenomination: PrayerDenominationId;
  facebookProfileUrl: string;
  /** Optional local library catalog search URL */
  libraryCatalogUrl: string;
  libraryName: string;
  /** Show upcoming reminders and reminder alerts in the app */
  remindersNotificationsEnabled: boolean;
  /** Use local hardware AI stubs instead of cloud Grok (Mac Studio later) */
  onPremMode: boolean;
  updatedAt: string;
};

export const PREFS_STORAGE_KEY = "rof-user-prefs-v1";
export const DEMO_PREFS_USER_ID = "local-demo-user";

export const DEFAULT_PREFERENCES: UserPreferences = {
  userId: DEMO_PREFS_USER_ID,
  weatherCity: "Chicago",
  newsTopics: ["general", "health"],
  sportsLeagues: ["NFL", "MLB"],
  sportsTeams: ["Chicago Bears", "Chicago Cubs"],
  youtubeQuery: "classic songs",
  prayerDenomination: "mindfulness",
  facebookProfileUrl: "",
  libraryCatalogUrl: "https://www.worldcat.org/search",
  libraryName: "Local library / WorldCat",
  remindersNotificationsEnabled: true,
  onPremMode: false,
  updatedAt: new Date(0).toISOString(),
};

export function getDenominationLabel(id: PrayerDenominationId): string {
  return (
    PRAYER_DENOMINATIONS.find((item) => item.id === id)?.label ?? "Prayer"
  );
}
