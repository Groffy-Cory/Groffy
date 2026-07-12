"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/features/ModalShell";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { PrayerContent } from "@/lib/features/prayer";
import {
  PRAYER_DENOMINATIONS,
  type PrayerDenominationId,
} from "@/lib/preferences/types";

export function PrayerModal() {
  const { openFeature, closeFeatureModal, prefs, updatePrefs, syncSource } =
    usePreferences();
  const [daily, setDaily] = useState<PrayerContent | null>(null);
  const [audioNote, setAudioNote] = useState<string | null>(null);

  useEffect(() => {
    if (openFeature !== "prayer") return;
    void load(prefs.prayerDenomination);
  }, [openFeature, prefs.prayerDenomination]);

  if (openFeature !== "prayer") return null;

  async function load(denomination: PrayerDenominationId) {
    const response = await fetch(
      `/api/prayer?denomination=${encodeURIComponent(denomination)}`,
    );
    const data = (await response.json()) as { daily: PrayerContent };
    setDaily(data.daily);
    setAudioNote(null);
  }

  return (
    <ModalShell
      title="Prayer / Meditation"
      subtitle="Choose a tradition. Receive a calm daily reading."
      footerNote={
        syncSource === "supabase"
          ? "Denomination saved to Supabase"
          : "Denomination saved on this device"
      }
      onClose={closeFeatureModal}
    >
      <p className="mb-2 text-base font-bold text-ink">Your tradition</p>
      <div className="flex flex-wrap gap-2">
        {PRAYER_DENOMINATIONS.map((item) => {
          const active = prefs.prayerDenomination === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={[
                "rof-btn min-h-12",
                active ? "rof-btn-primary" : "rof-btn-secondary",
              ].join(" ")}
              onClick={() => updatePrefs({ prayerDenomination: item.id })}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {daily ? (
        <article className="rof-inset mt-5 p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-[color:var(--accent-gold,var(--royal-dark))]">
            Today
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-ink">
            {daily.title}
          </h3>
          <p className="mt-4 whitespace-pre-wrap text-xl font-semibold leading-relaxed text-ink">
            {daily.body}
          </p>
          <button
            type="button"
            className="rof-btn rof-btn-secondary mt-5"
            onClick={() => setAudioNote(daily.audioStubNote)}
          >
            {daily.audioLabel}
          </button>
          {audioNote ? (
            <p className="mt-3 text-lg font-semibold text-muted">{audioNote}</p>
          ) : null}
        </article>
      ) : null}
    </ModalShell>
  );
}
