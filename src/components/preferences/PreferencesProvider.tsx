"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchPreferences,
  persistPreferences,
} from "@/lib/preferences/repository";
import { patchPreferences } from "@/lib/preferences/storage";
import {
  DEFAULT_PREFERENCES,
  type FeatureModalId,
  type UserPreferences,
} from "@/lib/preferences/types";

type PreferencesContextValue = {
  prefs: UserPreferences;
  syncSource: "supabase" | "local" | "loading";
  openFeature: FeatureModalId | null;
  openFeatureModal: (id: FeatureModalId) => void;
  closeFeatureModal: () => void;
  updatePrefs: (
    patch: Partial<Omit<UserPreferences, "userId" | "updatedAt">>,
  ) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [syncSource, setSyncSource] = useState<"supabase" | "local" | "loading">(
    "loading",
  );
  const [openFeature, setOpenFeature] = useState<FeatureModalId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchPreferences();
      if (cancelled) return;
      setPrefs(result.prefs);
      setSyncSource(result.source);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void persistPreferences(prefs).then((source) => {
      if (source === "supabase") setSyncSource("supabase");
    });
  }, [prefs, ready]);

  useEffect(() => {
    if (!openFeature) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenFeature(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openFeature]);

  const openFeatureModal = useCallback((id: FeatureModalId) => {
    setOpenFeature(id);
  }, []);

  const closeFeatureModal = useCallback(() => setOpenFeature(null), []);

  const updatePrefs = useCallback(
    (patch: Partial<Omit<UserPreferences, "userId" | "updatedAt">>) => {
      setPrefs((prev) => patchPreferences(prev, patch));
    },
    [],
  );

  const value = useMemo(
    () => ({
      prefs,
      syncSource,
      openFeature,
      openFeatureModal,
      closeFeatureModal,
      updatePrefs,
    }),
    [
      prefs,
      syncSource,
      openFeature,
      openFeatureModal,
      closeFeatureModal,
      updatePrefs,
    ],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}
