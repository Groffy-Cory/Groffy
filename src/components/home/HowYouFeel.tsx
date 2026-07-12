"use client";

import { useState } from "react";
import { DEFAULT_COMPANION_NAME, MOOD_OPTIONS } from "@/lib/constants";
import type { MoodId } from "@/types";

type HowYouFeelProps = {
  companionName?: string;
};

export function HowYouFeel({
  companionName = DEFAULT_COMPANION_NAME,
}: HowYouFeelProps) {
  const [selected, setSelected] = useState<MoodId | null>(null);
  const [note, setNote] = useState("");

  const selectedMood = MOOD_OPTIONS.find((mood) => mood.id === selected);

  return (
    <section className="rof-card p-5 sm:p-6" aria-labelledby="feel-heading">
      <h2 id="feel-heading" className="font-display text-2xl font-semibold text-ink sm:text-3xl">
        Let {companionName} know how you feel
      </h2>
      <p className="mt-1 text-base font-semibold text-muted">
        Tap a mood. Large buttons, easy to see.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selected === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelected(mood.id)}
              className={[
                "rof-btn min-h-[4.25rem] flex-col border-2",
                isSelected
                  ? "rof-paper-tab-active border-royal bg-royal text-white"
                  : "rof-paper-tab border-steel-200 bg-steel-50 text-ink hover:border-royal hover:bg-royal-soft",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              <span className="text-2xl" aria-hidden>
                {mood.emoji}
              </span>
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>

      <label htmlFor="mood-note" className="mt-4 block text-base font-bold text-ink">
        Want to say more? (optional)
      </label>
      <textarea
        id="mood-note"
        className="rof-textarea mt-2"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="A few words about your day…"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rof-btn rof-btn-primary"
          disabled={!selected}
          onClick={() => {
            if (!selectedMood) return;
            setNote("");
            setSelected(null);
          }}
        >
          Share with {companionName}
        </button>
        {selectedMood ? (
          <p className="text-base font-bold text-royal-dark" role="status">
            You selected: {selectedMood.label}
          </p>
        ) : null}
      </div>
    </section>
  );
}
