"use client";

import { useMemo, useState } from "react";
import { TRAININGS } from "@/lib/ticklers";

export function TrainingBrowser() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TRAININGS;
    return TRAININGS.filter((t) => {
      const haystack = `${t.title} ${t.meta} ${t.tags}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="don-card px-5 py-5 sm:px-6">
        <h2
          className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Find a training
        </h2>
        <label htmlFor="training-search" className="mt-3 block text-base font-semibold text-[color:var(--muted)]">
          Search available trainings
        </label>
        <input
          id="training-search"
          className="don-input mt-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a topic, role, or keyword…"
          autoComplete="off"
        />
        <p className="mt-2 text-sm font-semibold text-[color:var(--muted)]">
          Showing {results.length} of {TRAININGS.length} trainings
          {query.trim() ? ` for “${query.trim()}”` : ""}.
        </p>
      </div>

      <ul className="space-y-3">
        {results.length === 0 ? (
          <li className="don-card px-5 py-5 text-base font-semibold text-[color:var(--muted)]">
            No trainings match “{query}”. Try another keyword.
          </li>
        ) : (
          results.map((item) => (
            <li key={item.title} className="don-card px-5 py-4 sm:px-6">
              <h3 className="text-xl font-bold text-[color:var(--burgundy-deep)]">
                {item.title}
              </h3>
              <p className="mt-1 text-base font-semibold text-[color:var(--muted)]">
                {item.meta}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
