"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMealsPantry } from "@/components/meals/MealsPantryProvider";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { pickFallbackDay } from "@/lib/meals/fallback";
import type { MealIdea, MealType } from "@/types";

const SECTIONS: { type: MealType; label: string }[] = [
  { type: "breakfast", label: "Breakfast" },
  { type: "lunch", label: "Lunch" },
  { type: "dinner", label: "Dinner" },
];

export function MealIdeas() {
  const { openMealsPantry, addMany } = useMealsPantry();
  const { prefs } = usePreferences();
  const [meals, setMeals] = useState<Record<MealType, MealIdea>>(pickFallbackDay);
  const [loading, setLoading] = useState<MealType | "all" | "scan" | null>(null);
  const [scanNote, setScanNote] = useState<string | null>(null);
  const [rotate, setRotate] = useState(0);
  const fridgeInputRef = useRef<HTMLInputElement>(null);

  const loadMeals = useCallback(async (type?: MealType) => {
    setLoading(type ?? "all");
    try {
      if (type) {
        const nextRotate = rotate + 1;
        const response = await fetch(
          `/api/meals?type=${type}&rotate=${nextRotate}`,
        );
        const data = (await response.json()) as { meal?: MealIdea };
        if (data.meal) {
          setMeals((prev) => ({ ...prev, [type]: data.meal! }));
        }
        setRotate(nextRotate);
      } else {
        const response = await fetch("/api/meals");
        const data = (await response.json()) as {
          meals?: Record<MealType, MealIdea>;
        };
        if (data.meals) setMeals(data.meals);
      }
    } catch {
      // keep current meals
    } finally {
      setLoading(null);
    }
  }, [rotate]);

  useEffect(() => {
    void loadMeals();
    // Initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFridgeScan(file: File | undefined) {
    if (!file) return;
    setLoading("scan");
    setScanNote(null);
    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/pantry/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl,
          mode: "fridge",
          onPremMode: prefs.onPremMode,
        }),
      });
      const data = (await response.json()) as {
        items?: Array<{ name: string; quantity?: string }>;
        recipes?: MealIdea[];
        note?: string;
        error?: string;
      };

      if (!response.ok) {
        setScanNote(data.error || "Could not scan that photo.");
        return;
      }

      if (data.items && data.items.length > 0) {
        addMany(
          data.items.map((item) => ({
            name: item.name,
            quantity: item.quantity || "1",
            source: "fridge_scan",
          })),
        );
      }

      if (data.recipes && data.recipes[0]) {
        setMeals((prev) => ({
          ...prev,
          dinner: {
            ...data.recipes![0],
            type: "dinner",
            source: "pantry",
          },
        }));
      }

      setScanNote(
        data.note ||
          "Scan complete. Open Meals & Pantry to review your inventory.",
      );
    } catch {
      setScanNote("Something went wrong. Please try another photo.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rof-card p-5 sm:p-6" aria-labelledby="meals-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="meals-heading"
            className="font-display text-2xl font-semibold text-ink sm:text-3xl"
          >
            Meal Ideas for Today
          </h2>
          <p className="mt-1 text-base font-semibold text-muted">
            Powered by Spoonacular when connected — warm, simple meal ideas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rof-btn rof-btn-primary"
            disabled={loading !== null}
            onClick={() => fridgeInputRef.current?.click()}
          >
            {loading === "scan" ? "Scanning…" : "Scan Fridge / Pantry"}
          </button>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={() => openMealsPantry()}
          >
            Open pantry
          </button>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={() => void loadMeals()}
            disabled={loading !== null}
          >
            {loading === "all" ? "Refreshing…" : "Refresh all"}
          </button>
          <input
            ref={fridgeInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              void handleFridgeScan(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
      </div>

      {scanNote ? (
        <p className="rof-inset mt-4 p-4 text-lg font-semibold text-ink">
          {scanNote}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {SECTIONS.map(({ type, label }) => {
          const meal = meals[type];
          return (
            <article key={type} className="rof-inset p-4">
              <h3 className="text-lg font-bold uppercase tracking-wide text-[color:var(--accent-gold,var(--royal-dark))]">
                {label}
              </h3>
              <p className="mt-2 font-display text-xl font-semibold text-ink">
                {meal.title}
              </p>
              <p className="mt-2 text-base font-semibold text-muted">
                {meal.description}
              </p>
              {meal.source === "spoonacular" ? (
                <p className="mt-2 text-sm font-bold text-muted">
                  Via Spoonacular
                </p>
              ) : null}
              <button
                type="button"
                className="rof-btn rof-btn-primary mt-4 w-full"
                onClick={() => void loadMeals(type)}
                disabled={loading !== null}
              >
                {loading === type ? "Thinking…" : "New idea"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
