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
  createBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import {
  fetchFamilyLinks,
  linkToLovedOne,
  lookupSeniorByEmail,
  lookupSeniorById,
} from "@/lib/vault";
import type { FamilyLink } from "@/lib/types";

type AuthContextValue = {
  ready: boolean;
  supabaseConfigured: boolean;
  session: Session | null;
  user: User | null;
  displayName: string;
  links: FamilyLink[];
  activeOwnerId: string | null;
  activeLovedOne: FamilyLink | null;
  needsAuth: boolean;
  needsLink: boolean;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUpWithPassword: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshLinks: () => Promise<void>;
  connectLovedOne: (emailOrId: string) => Promise<string | null>;
  setActiveOwnerId: (ownerId: string) => void;
  updateDisplayNameLocal: (name: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const ACTIVE_OWNER_KEY = "fp-active-owner-v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [displayName, setDisplayName] = useState("Family");
  const [links, setLinks] = useState<FamilyLink[]>([]);
  const [activeOwnerId, setActiveOwnerIdState] = useState<string | null>(null);
  const supabaseConfigured = isSupabaseConfigured();

  const refreshLinks = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setLinks([]);
      return;
    }
    const next = await fetchFamilyLinks(userId);
    setLinks(next);
    setActiveOwnerIdState((current) => {
      if (current && next.some((link) => link.ownerId === current)) return current;
      const saved =
        typeof window !== "undefined"
          ? window.localStorage.getItem(ACTIVE_OWNER_KEY)
          : null;
      if (saved && next.some((link) => link.ownerId === saved)) return saved;
      return next[0]?.ownerId ?? null;
    });
  }, [session?.user?.id]);

  useEffect(() => {
    const supabase = createBrowserClient();
    let cancelled = false;

    (async () => {
      if (!supabase) {
        if (!cancelled) setReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      if (data.session?.user) {
        const metaName = data.session.user.user_metadata?.full_name as
          | string
          | undefined;
        setDisplayName(
          metaName ||
            data.session.user.email?.split("@")[0] ||
            "Family",
        );
      }
      setReady(true);
    })();

    if (!supabase) return;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user) {
        const metaName = next.user.user_metadata?.full_name as string | undefined;
        setDisplayName(metaName || next.user.email?.split("@")[0] || "Family");
      } else {
        setLinks([]);
        setActiveOwnerIdState(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    void refreshLinks();
  }, [session?.user, refreshLinks]);

  const setActiveOwnerId = useCallback((ownerId: string) => {
    setActiveOwnerIdState(ownerId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_OWNER_KEY, ownerId);
    }
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const supabase = createBrowserClient();
      if (!supabase) return "Sign-in isn’t configured yet.";
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return error?.message ?? null;
    },
    [],
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string, name: string) => {
      const supabase = createBrowserClient();
      if (!supabase) return "Sign-up isn’t configured yet.";
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() || "Family" },
        },
      });
      return error?.message ?? null;
    },
    [],
  );

  const signOut = useCallback(async () => {
    const supabase = createBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setLinks([]);
    setActiveOwnerIdState(null);
  }, []);

  const connectLovedOne = useCallback(
    async (emailOrId: string) => {
      const userId = session?.user?.id;
      if (!userId) return "Please sign in first.";

      const value = emailOrId.trim();
      if (!value) return "Enter their email or connection ID.";

      let senior =
        value.includes("@")
          ? await lookupSeniorByEmail(value)
          : await lookupSeniorById(value);

      if (!senior && value.includes("@")) {
        return "No ROF account found with that email. Ask them to sign up in the main app first.";
      }
      if (!senior) {
        senior = await lookupSeniorByEmail(value);
      }
      if (!senior) {
        return "Could not find that loved one. Check the email or connection ID from their Settings.";
      }

      if (senior.id === userId) {
        return "Use a different account for the family portal than the loved one’s ROF login.";
      }

      const error = await linkToLovedOne({
        familyUserId: userId,
        ownerId: senior.id,
      });
      if (error) return error;

      await refreshLinks();
      setActiveOwnerId(senior.id);
      return null;
    },
    [refreshLinks, session?.user?.id, setActiveOwnerId],
  );

  const activeLovedOne =
    links.find((link) => link.ownerId === activeOwnerId) ?? null;

  const value = useMemo(
    () => ({
      ready,
      supabaseConfigured,
      session,
      user: session?.user ?? null,
      displayName,
      links,
      activeOwnerId,
      activeLovedOne,
      needsAuth: ready && !session,
      needsLink: ready && Boolean(session) && links.length === 0,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      refreshLinks,
      connectLovedOne,
      setActiveOwnerId,
      updateDisplayNameLocal: setDisplayName,
    }),
    [
      ready,
      supabaseConfigured,
      session,
      displayName,
      links,
      activeOwnerId,
      activeLovedOne,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      refreshLinks,
      connectLovedOne,
      setActiveOwnerId,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
