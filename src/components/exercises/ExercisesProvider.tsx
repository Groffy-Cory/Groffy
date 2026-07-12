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
  fetchExerciseProgress,
  persistExerciseProgress,
} from "@/lib/exercises/repository";
import { toggleProgressEntry } from "@/lib/exercises/storage";
import type { ExerciseProgressMap } from "@/lib/exercises/types";

type ExercisesContextValue = {
  isOpen: boolean;
  openExercises: () => void;
  closeExercises: () => void;
  progress: ExerciseProgressMap;
  syncSource: "supabase" | "local" | "loading";
  toggleComplete: (exerciseId: string) => void;
  completedCount: number;
};

const ExercisesContext = createContext<ExercisesContextValue | null>(null);

export function ExercisesProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState<ExerciseProgressMap>({});
  const [syncSource, setSyncSource] = useState<"supabase" | "local" | "loading">(
    "loading",
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchExerciseProgress();
      if (cancelled) return;
      setProgress(result.progress);
      setSyncSource(result.source);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void persistExerciseProgress(progress).then((source) => {
      if (source === "supabase") setSyncSource("supabase");
    });
  }, [progress, ready]);

  const openExercises = useCallback(() => setIsOpen(true), []);
  const closeExercises = useCallback(() => setIsOpen(false), []);

  const toggleComplete = useCallback((exerciseId: string) => {
    setProgress((prev) => toggleProgressEntry(prev, exerciseId));
  }, []);

  const completedCount = useMemo(
    () => Object.values(progress).filter((item) => item.completed).length,
    [progress],
  );

  const value = useMemo(
    () => ({
      isOpen,
      openExercises,
      closeExercises,
      progress,
      syncSource,
      toggleComplete,
      completedCount,
    }),
    [
      isOpen,
      openExercises,
      closeExercises,
      progress,
      syncSource,
      toggleComplete,
      completedCount,
    ],
  );

  return (
    <ExercisesContext.Provider value={value}>
      {children}
    </ExercisesContext.Provider>
  );
}

export function useExercises() {
  const context = useContext(ExercisesContext);
  if (!context) {
    throw new Error("useExercises must be used within ExercisesProvider");
  }
  return context;
}
