"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  DEFAULT_PROFILE,
  GUEST_SESSION_KEY,
  PROFILE_STORAGE_KEY,
  sanitizeCompanionName,
  sanitizeDisplayName,
  type UserProfile,
} from "@/lib/auth/types";
import {
  createBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type AuthContextValue = {
  ready: boolean;
  supabaseConfigured: boolean;
  session: Session | null;
  user: User | null;
  profile: UserProfile;
  companionName: string;
  userName: string;
  isGuest: boolean;
  needsAuth: boolean;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUpWithPassword: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  continueAsGuest: (displayName?: string) => void;
  signOut: () => Promise<void>;
  updateCompanionName: (name: string) => Promise<string | null>;
  updateDisplayName: (name: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadLocalProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      companionName: sanitizeCompanionName(
        parsed.companionName || DEFAULT_PROFILE.companionName,
      ),
      displayName: sanitizeDisplayName(
        parsed.displayName || DEFAULT_PROFILE.displayName,
      ),
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveLocalProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isGuest, setIsGuest] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const supabaseConfigured = isSupabaseConfigured();

  const hydrateProfile = useCallback(async (user: User) => {
    const supabase = createBrowserClient();
    const local = loadLocalProfile();

    if (!supabase) {
      const next = {
        ...local,
        id: user.id,
        email: user.email ?? null,
        displayName: sanitizeDisplayName(
          (user.user_metadata?.full_name as string) ||
            user.email?.split("@")[0] ||
            local.displayName,
        ),
      };
      setProfile(next);
      saveLocalProfile(next);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, companion_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      const next: UserProfile = {
        id: data.id,
        displayName: sanitizeDisplayName(data.display_name),
        companionName: sanitizeCompanionName(data.companion_name),
        email: data.email ?? user.email ?? null,
      };
      setProfile(next);
      saveLocalProfile(next);
      return;
    }

    const next: UserProfile = {
      id: user.id,
      displayName: sanitizeDisplayName(
        (user.user_metadata?.full_name as string) ||
          user.email?.split("@")[0] ||
          "Friend",
      ),
      companionName: sanitizeCompanionName(
        (user.user_metadata?.companion_name as string) ||
          local.companionName ||
          DEFAULT_PROFILE.companionName,
      ),
      email: user.email ?? null,
    };

    await supabase.from("profiles").upsert({
      id: next.id,
      display_name: next.displayName,
      companion_name: next.companionName,
      email: next.email,
      updated_at: new Date().toISOString(),
    });

    setProfile(next);
    saveLocalProfile(next);
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient();
    let cancelled = false;

    (async () => {
      if (!supabase) {
        const guest =
          typeof window !== "undefined" &&
          window.localStorage.getItem(GUEST_SESSION_KEY) === "1";
        if (!cancelled) {
          setIsGuest(guest);
          setProfile(loadLocalProfile());
          setReady(true);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session?.user) {
        setSession(data.session);
        setIsGuest(false);
        await hydrateProfile(data.session.user);
      } else {
        const guest =
          typeof window !== "undefined" &&
          window.localStorage.getItem(GUEST_SESSION_KEY) === "1";
        setIsGuest(guest);
        setProfile(loadLocalProfile());
      }
      setReady(true);
    })();

    if (!supabase) return;

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSession(nextSession);
        if (nextSession?.user) {
          window.localStorage.removeItem(GUEST_SESSION_KEY);
          setIsGuest(false);
          await hydrateProfile(nextSession.user);
        }
      },
    );

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [hydrateProfile]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const supabase = createBrowserClient();
      if (!supabase) return "Sign-in isn’t configured yet. Continue as guest for now.";
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return error?.message ?? null;
    },
    [],
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string, displayName: string) => {
      const supabase = createBrowserClient();
      if (!supabase) return "Sign-up isn’t configured yet. Continue as guest for now.";
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: sanitizeDisplayName(displayName),
            companion_name: loadLocalProfile().companionName,
          },
        },
      });
      return error?.message ?? null;
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    const supabase = createBrowserClient();
    if (!supabase) return "Google sign-in isn’t configured yet.";
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    return error?.message ?? null;
  }, []);

  const continueAsGuest = useCallback((displayName?: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(GUEST_SESSION_KEY, "1");
    }
    const next = {
      ...loadLocalProfile(),
      displayName: sanitizeDisplayName(displayName || "Friend"),
    };
    setProfile(next);
    saveLocalProfile(next);
    setIsGuest(true);
    setSession(null);
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createBrowserClient();
    if (supabase) await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(GUEST_SESSION_KEY);
    }
    setSession(null);
    setIsGuest(false);
    setProfile(loadLocalProfile());
  }, []);

  const updateCompanionName = useCallback(
    async (name: string) => {
      const companionName = sanitizeCompanionName(name);
      const next = { ...profile, companionName };
      setProfile(next);
      saveLocalProfile(next);

      const supabase = createBrowserClient();
      if (supabase && session?.user) {
        const { error } = await supabase
          .from("profiles")
          .upsert({
            id: session.user.id,
            display_name: next.displayName,
            companion_name: companionName,
            email: next.email,
            updated_at: new Date().toISOString(),
          });
        if (error) return error.message;
      }
      return null;
    },
    [profile, session],
  );

  const updateDisplayName = useCallback(
    async (name: string) => {
      const displayName = sanitizeDisplayName(name);
      const next = { ...profile, displayName };
      setProfile(next);
      saveLocalProfile(next);

      const supabase = createBrowserClient();
      if (supabase && session?.user) {
        const { error } = await supabase
          .from("profiles")
          .upsert({
            id: session.user.id,
            display_name: displayName,
            companion_name: next.companionName,
            email: next.email,
            updated_at: new Date().toISOString(),
          });
        if (error) return error.message;
      }
      return null;
    },
    [profile, session],
  );

  const needsAuth = ready && !session && !isGuest;

  const value = useMemo(
    () => ({
      ready,
      supabaseConfigured,
      session,
      user: session?.user ?? null,
      profile,
      companionName: profile.companionName,
      userName: profile.displayName,
      isGuest,
      needsAuth,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      continueAsGuest,
      signOut,
      updateCompanionName,
      updateDisplayName,
    }),
    [
      ready,
      supabaseConfigured,
      session,
      profile,
      isGuest,
      needsAuth,
      settingsOpen,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      continueAsGuest,
      signOut,
      updateCompanionName,
      updateDisplayName,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
