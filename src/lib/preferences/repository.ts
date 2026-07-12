import { createBrowserClient } from "@/lib/supabase/client";
import {
  loadPreferencesLocal,
  savePreferencesLocal,
} from "@/lib/preferences/storage";
import {
  DEMO_PREFS_USER_ID,
  DEFAULT_PREFERENCES,
  type UserPreferences,
} from "@/lib/preferences/types";

type DbRow = {
  user_id: string;
  weather_city: string;
  news_topics: string[];
  sports_leagues: string[];
  sports_teams: string[];
  youtube_query: string;
  prayer_denomination: string;
  facebook_profile_url: string;
  library_catalog_url?: string;
  library_name?: string;
  reminders_notifications_enabled?: boolean;
  on_prem_mode?: boolean;
  updated_at: string;
};

function rowToPrefs(row: DbRow): UserPreferences {
  return {
    userId: row.user_id,
    weatherCity: row.weather_city,
    newsTopics: row.news_topics as UserPreferences["newsTopics"],
    sportsLeagues: row.sports_leagues as UserPreferences["sportsLeagues"],
    sportsTeams: row.sports_teams,
    youtubeQuery: row.youtube_query,
    prayerDenomination:
      row.prayer_denomination as UserPreferences["prayerDenomination"],
    facebookProfileUrl: row.facebook_profile_url ?? "",
    libraryCatalogUrl:
      row.library_catalog_url ?? DEFAULT_PREFERENCES.libraryCatalogUrl,
    libraryName: row.library_name ?? DEFAULT_PREFERENCES.libraryName,
    remindersNotificationsEnabled:
      row.reminders_notifications_enabled ??
      DEFAULT_PREFERENCES.remindersNotificationsEnabled,
    onPremMode: row.on_prem_mode ?? DEFAULT_PREFERENCES.onPremMode,
    updatedAt: row.updated_at,
  };
}

function prefsToRow(prefs: UserPreferences): DbRow {
  return {
    user_id: prefs.userId,
    weather_city: prefs.weatherCity,
    news_topics: prefs.newsTopics,
    sports_leagues: prefs.sportsLeagues,
    sports_teams: prefs.sportsTeams,
    youtube_query: prefs.youtubeQuery,
    prayer_denomination: prefs.prayerDenomination,
    facebook_profile_url: prefs.facebookProfileUrl,
    library_catalog_url: prefs.libraryCatalogUrl,
    library_name: prefs.libraryName,
    reminders_notifications_enabled: prefs.remindersNotificationsEnabled,
    on_prem_mode: prefs.onPremMode,
    updated_at: prefs.updatedAt,
  };
}

export async function fetchPreferences(
  userId = DEMO_PREFS_USER_ID,
): Promise<{ prefs: UserPreferences; source: "supabase" | "local" }> {
  const supabase = createBrowserClient();
  if (!supabase) {
    return { prefs: loadPreferencesLocal(), source: "local" };
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return { prefs: loadPreferencesLocal(), source: "local" };
  }

  const prefs = rowToPrefs(data as DbRow);
  savePreferencesLocal(prefs);
  return { prefs, source: "supabase" };
}

export async function persistPreferences(
  prefs: UserPreferences,
): Promise<"supabase" | "local"> {
  savePreferencesLocal(prefs);

  const supabase = createBrowserClient();
  if (!supabase) return "local";

  const { error } = await supabase
    .from("user_preferences")
    .upsert(prefsToRow(prefs), { onConflict: "user_id" });

  return error ? "local" : "supabase";
}

export { DEFAULT_PREFERENCES };
