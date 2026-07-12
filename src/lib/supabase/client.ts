import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null | undefined;

/** Shared browser client so auth session stays consistent across the app. */
export function createBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    browserClient = null;
    return null;
  }

  if (
    supabaseUrl.includes("your_supabase") ||
    supabaseAnonKey.includes("your_supabase")
  ) {
    browserClient = null;
    return null;
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

export function isSupabaseConfigured(): boolean {
  return createBrowserClient() !== null;
}
