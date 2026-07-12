import {
  DEFAULT_PREFERENCES,
  DEMO_PREFS_USER_ID,
  PREFS_STORAGE_KEY,
  type NewsTopicId,
  type PrayerDenominationId,
  type SportsLeagueId,
  type UserPreferences,
} from "@/lib/preferences/types";

function isPrefs(value: unknown): value is UserPreferences {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<UserPreferences>;
  return (
    typeof item.userId === "string" &&
    typeof item.weatherCity === "string" &&
    Array.isArray(item.newsTopics) &&
    Array.isArray(item.sportsLeagues) &&
    Array.isArray(item.sportsTeams) &&
    typeof item.youtubeQuery === "string" &&
    typeof item.prayerDenomination === "string" &&
    typeof item.facebookProfileUrl === "string"
  );
}

export function loadPreferencesLocal(): UserPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES };
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) {
      const initial = {
        ...DEFAULT_PREFERENCES,
        updatedAt: new Date().toISOString(),
      };
      savePreferencesLocal(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isPrefs(parsed)) return { ...DEFAULT_PREFERENCES };
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      newsTopics: parsed.newsTopics as NewsTopicId[],
      sportsLeagues: parsed.sportsLeagues as SportsLeagueId[],
      prayerDenomination: parsed.prayerDenomination as PrayerDenominationId,
      remindersNotificationsEnabled:
        typeof parsed.remindersNotificationsEnabled === "boolean"
          ? parsed.remindersNotificationsEnabled
          : DEFAULT_PREFERENCES.remindersNotificationsEnabled,
      onPremMode:
        typeof parsed.onPremMode === "boolean"
          ? parsed.onPremMode
          : DEFAULT_PREFERENCES.onPremMode,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferencesLocal(prefs: UserPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
}

export function patchPreferences(
  current: UserPreferences,
  patch: Partial<Omit<UserPreferences, "userId" | "updatedAt">>,
  userId = DEMO_PREFS_USER_ID,
): UserPreferences {
  return {
    ...current,
    ...patch,
    userId,
    updatedAt: new Date().toISOString(),
  };
}
