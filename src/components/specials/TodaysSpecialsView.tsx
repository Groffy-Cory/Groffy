"use client";

import { useEffect, useState } from "react";
import { SpecialCard } from "@/components/specials/SpecialCard";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { TodaysSpecialsResponse } from "@/lib/specials/types";

const ORDER_HINTS = [
  { id: "birthdays", label: "Famous Birthdays" },
  { id: "history", label: "Today in History" },
  { id: "quote", label: "Quote of the Day" },
  { id: "fact", label: "Fact of the Day" },
  { id: "word", label: "Word of the Day" },
  { id: "joke", label: "Joke of the Day" },
] as const;

export function TodaysSpecialsView() {
  const { prefs } = usePreferences();
  const [data, setData] = useState<TodaysSpecialsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const query = prefs.onPremMode ? "?onPrem=1" : "";
        const response = await fetch(`/api/todays-specials${query}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Could not load today's specials.");
        }
        const payload = (await response.json()) as TodaysSpecialsResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load today's specials.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [prefs.onPremMode]);

  return (
    <div className="flex flex-col gap-4 pb-2">
      <section className="rof-card p-5 sm:p-6">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--accent-gold,var(--royal-dark))]">
          Daily refresh
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Today&apos;s Specials
        </h1>
        <p className="mt-2 text-lg font-semibold text-muted">
          {data?.displayDate || "Loading today\u2026"} — large cards, clear
          reading, one click for more.
        </p>

        <nav
          className="mt-5 flex flex-wrap gap-2"
          aria-label="Jump to a special"
        >
          {ORDER_HINTS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rof-btn rof-btn-secondary min-h-11 px-3 text-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </section>

      {loading ? (
        <section className="rof-card p-6 text-lg font-semibold text-muted">
          Gathering today&apos;s quote, joke, history, and more…
        </section>
      ) : null}

      {error ? (
        <section className="rof-card p-6 text-lg font-bold text-ink">
          {error}
        </section>
      ) : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.items.map((item) => (
            <SpecialCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
