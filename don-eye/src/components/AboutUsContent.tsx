"use client";

import { useViewMode } from "@/components/ViewModeProvider";
import { useState } from "react";

const DEFAULT_COPY =
  "About The DON Eye — placeholder. Tell the story of care from bedside to boardroom, Anchor Pointe roots, and how Donnie supports Directors of Nursing. Fill this in later.";

export function AboutUsContent() {
  const { isAdmin } = useViewMode();
  const [copy, setCopy] = useState(DEFAULT_COPY);

  return (
    <div className="space-y-4">
      <p className="don-kicker">About us</p>
      {isAdmin ? (
        <>
          <p className="text-sm font-semibold text-[color:var(--muted)]">
            Admin can edit this copy for now — wire CMS later.
          </p>
          <textarea
            className="don-input don-textarea"
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            aria-label="About us content"
          />
        </>
      ) : (
        <p className="whitespace-pre-wrap text-base font-semibold leading-relaxed text-[color:var(--ink-soft)]">
          {copy}
        </p>
      )}
    </div>
  );
}
