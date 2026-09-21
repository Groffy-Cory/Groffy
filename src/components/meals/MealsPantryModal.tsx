"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useMealsPantry } from "@/components/meals/MealsPantryProvider";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { MealIdea } from "@/types";

type ScanResult = {
  items: Array<{ name: string; quantity?: string }>;
  recipes: MealIdea[];
  note: string;
  mode: "fridge" | "receipt";
};

export function MealsPantryModal() {
  const {
    isOpen,
    closeMealsPantry,
    items,
    syncSource,
    addItem,
    addMany,
    removeItem,
  } = useMealsPantry();
  const { prefs } = usePreferences();

  const [manualName, setManualName] = useState("");
  const [manualQty, setManualQty] = useState("1");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [pantryRecipes, setPantryRecipes] = useState<MealIdea[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const fridgeInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setScanResult(null);
    setManualName("");
    setManualQty("1");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMealsPantry();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeMealsPantry]);

  if (!isOpen) return null;

  async function fileToDataUrl(file: File): Promise<string> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const element = new Image();
      element.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(element);
      };
      element.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not read photo"));
      };
      element.src = objectUrl;
    });

    for (const maxDimension of [1600, 1200, 900]) {
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare photo");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      if (dataUrl.length <= 3_500_000) return dataUrl;
    }

    throw new Error("Photo is too large. Try a closer, smaller picture.");
  }

  async function handleScan(
    file: File | undefined,
    mode: "fridge" | "receipt",
  ) {
    if (!file) return;
    setScanning(true);
    setScanResult(null);
    try {
      const imageDataUrl = await fileToDataUrl(file);
      const response = await fetch("/api/pantry/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl,
          mode,
          onPremMode: prefs.onPremMode,
        }),
      });
      const data = (await response.json()) as ScanResult & { error?: string };
      if (!response.ok) {
        setScanResult({
          mode,
          items: [],
          recipes: [],
          note: data.error || "Scan failed. Please try again.",
        });
        return;
      }
      setScanResult({
        mode: data.mode,
        items: data.items || [],
        recipes: data.recipes || [],
        note: data.note,
      });
    } catch (error) {
      setScanResult({
        mode,
        items: [],
        recipes: [],
        note:
          error instanceof Error
            ? error.message
            : "Something went wrong reading that photo.",
      });
    } finally {
      setScanning(false);
    }
  }

  function handleAddManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manualName.trim()) return;
    addItem({
      name: manualName,
      quantity: manualQty,
      source: "manual",
    });
    setManualName("");
    setManualQty("1");
  }

  async function loadRecipesFromPantry() {
    setLoadingRecipes(true);
    try {
      const response = await fetch("/api/pantry/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: items.map((item) => item.name),
        }),
      });
      const data = (await response.json()) as { recipes?: MealIdea[] };
      setPantryRecipes(data.recipes || []);
    } catch {
      setPantryRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
      role="presentation"
      onClick={closeMealsPantry}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meals-pantry-title"
        className="rof-card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-steel-200 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="meals-pantry-title"
              className="font-display text-3xl font-semibold text-ink"
            >
              Meals & Pantry
            </h2>
            <p className="mt-1 text-base font-semibold text-muted">
              Scan your fridge, keep inventory, and get simple meal ideas.
            </p>
            <p className="mt-1 text-sm font-bold text-[color:var(--accent-gold,var(--royal-dark))]">
              {syncSource === "supabase"
                ? "Pantry saved to Supabase"
                : syncSource === "loading"
                  ? "Loading pantry…"
                  : "Pantry on this device — connect Supabase to sync"}
            </p>
          </div>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={closeMealsPantry}
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          <section className="rof-inset p-4 sm:p-5">
            <h3 className="font-display text-2xl font-semibold text-ink">
              Scan fridge or pantry
            </h3>
            <p className="mt-1 text-base font-semibold text-muted">
              Take a photo. Grok looks at what’s there and suggests recipes.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="rof-btn rof-btn-primary"
                disabled={scanning}
                onClick={() => fridgeInputRef.current?.click()}
              >
                {scanning ? "Scanning…" : "Scan Fridge / Pantry"}
              </button>
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                disabled={scanning}
                onClick={() => receiptInputRef.current?.click()}
              >
                Upload receipt
              </button>
              <input
                ref={fridgeInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  void handleScan(event.target.files?.[0], "fridge");
                  event.target.value = "";
                }}
              />
              <input
                ref={receiptInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  void handleScan(event.target.files?.[0], "receipt");
                  event.target.value = "";
                }}
              />
            </div>

            {scanResult ? (
              <div className="mt-4 space-y-3">
                <p className="text-lg font-semibold text-ink">{scanResult.note}</p>
                {scanResult.items.length > 0 ? (
                  <>
                    <ul className="space-y-2">
                      {scanResult.items.map((item) => (
                        <li
                          key={`${item.name}-${item.quantity}`}
                          className="rounded-xl bg-[var(--surface-raised)] px-4 py-3 text-lg font-bold text-ink"
                        >
                          {item.name}
                          {item.quantity ? (
                            <span className="font-semibold text-muted">
                              {" "}
                              · {item.quantity}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="rof-btn rof-btn-primary"
                      onClick={() => {
                        addMany(
                          scanResult.items.map((item) => ({
                            name: item.name,
                            quantity: item.quantity || "1",
                            source:
                              scanResult.mode === "receipt"
                                ? "receipt"
                                : "fridge_scan",
                          })),
                        );
                        setScanResult(null);
                      }}
                    >
                      Add these to my pantry
                    </button>
                  </>
                ) : null}
                {scanResult.recipes.length > 0 ? (
                  <div className="pt-2">
                    <p className="text-lg font-bold text-ink">Recipe ideas</p>
                    <ul className="mt-2 space-y-2">
                      {scanResult.recipes.map((recipe) => (
                        <li
                          key={recipe.externalId || recipe.title}
                          className="rounded-xl bg-[var(--surface-raised)] p-3"
                        >
                          <p className="text-xl font-bold text-ink">
                            {recipe.title}
                          </p>
                          <p className="mt-1 text-base font-semibold text-muted">
                            {recipe.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="rof-inset p-4 sm:p-5">
            <h3 className="font-display text-2xl font-semibold text-ink">
              Your pantry
            </h3>
            <form
              onSubmit={handleAddManual}
              className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="pantry-name"
                  className="mb-1 block text-base font-bold text-ink"
                >
                  Food name
                </label>
                <input
                  id="pantry-name"
                  className="rof-input text-lg"
                  value={manualName}
                  onChange={(event) => setManualName(event.target.value)}
                  placeholder="Example: Eggs"
                  required
                />
              </div>
              <div className="sm:w-36">
                <label
                  htmlFor="pantry-qty"
                  className="mb-1 block text-base font-bold text-ink"
                >
                  Amount
                </label>
                <input
                  id="pantry-qty"
                  className="rof-input text-lg"
                  value={manualQty}
                  onChange={(event) => setManualQty(event.target.value)}
                />
              </div>
              <button type="submit" className="rof-btn rof-btn-primary">
                Add
              </button>
            </form>

            <ul className="mt-4 space-y-2">
              {items.length === 0 ? (
                <li className="text-lg font-semibold text-muted">
                  Pantry is empty. Scan a photo or add food by hand.
                </li>
              ) : (
                items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--surface-raised)] px-4 py-3"
                  >
                    <p className="text-lg font-bold text-ink">
                      {item.name}
                      <span className="font-semibold text-muted">
                        {" "}
                        · {item.quantity}
                      </span>
                    </p>
                    <button
                      type="button"
                      className="rof-btn rof-btn-secondary"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))
              )}
            </ul>

            <button
              type="button"
              className="rof-btn rof-btn-secondary mt-4"
              disabled={loadingRecipes || items.length === 0}
              onClick={() => void loadRecipesFromPantry()}
            >
              {loadingRecipes
                ? "Finding recipes…"
                : "Suggest recipes from pantry"}
            </button>
            {pantryRecipes.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {pantryRecipes.map((recipe) => (
                  <li
                    key={recipe.externalId || recipe.title}
                    className="rounded-xl border-2 border-steel-200 p-3"
                  >
                    <p className="text-xl font-bold text-ink">{recipe.title}</p>
                    <p className="mt-1 text-base font-semibold text-muted">
                      {recipe.description}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
