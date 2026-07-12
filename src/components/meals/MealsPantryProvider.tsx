"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchPantry, persistPantry } from "@/lib/pantry/repository";
import {
  mergePantryItems,
  sortPantry,
} from "@/lib/pantry/storage";
import type { PantryItem, PantryItemDraft } from "@/lib/pantry/types";

type MealsPantryContextValue = {
  items: PantryItem[];
  syncSource: "supabase" | "local" | "loading";
  isOpen: boolean;
  openMealsPantry: () => void;
  closeMealsPantry: () => void;
  addItem: (draft: PantryItemDraft) => void;
  addMany: (drafts: PantryItemDraft[]) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<Pick<PantryItem, "name" | "quantity">>) => void;
};

const MealsPantryContext = createContext<MealsPantryContextValue | null>(null);

export function MealsPantryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [syncSource, setSyncSource] = useState<"supabase" | "local" | "loading">(
    "loading",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchPantry();
      if (cancelled) return;
      setItems(result.items);
      setSyncSource(result.source);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void persistPantry(items).then((source) => {
      if (source === "supabase") setSyncSource("supabase");
    });
  }, [items, ready]);

  const openMealsPantry = useCallback(() => setIsOpen(true), []);
  const closeMealsPantry = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((draft: PantryItemDraft) => {
    setItems((prev) => mergePantryItems(prev, [draft]));
  }, []);

  const addMany = useCallback((drafts: PantryItemDraft[]) => {
    setItems((prev) => mergePantryItems(prev, drafts));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback(
    (id: string, patch: Partial<Pick<PantryItem, "name" | "quantity">>) => {
      setItems((prev) =>
        sortPantry(
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        ),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      items,
      syncSource,
      isOpen,
      openMealsPantry,
      closeMealsPantry,
      addItem,
      addMany,
      removeItem,
      updateItem,
    }),
    [
      items,
      syncSource,
      isOpen,
      openMealsPantry,
      closeMealsPantry,
      addItem,
      addMany,
      removeItem,
      updateItem,
    ],
  );

  return (
    <MealsPantryContext.Provider value={value}>
      {children}
    </MealsPantryContext.Provider>
  );
}

export function useMealsPantry() {
  const context = useContext(MealsPantryContext);
  if (!context) {
    throw new Error("useMealsPantry must be used within MealsPantryProvider");
  }
  return context;
}
