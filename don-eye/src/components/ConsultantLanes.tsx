"use client";

import { useState } from "react";

const LANES = [
  {
    id: "don",
    label: "Director of Nursing",
    blurb: "DON-focused coaching — survey readiness, systems, leadership coverage.",
  },
  {
    id: "nurses",
    label: "Nurses",
    blurb: "Clinical team support, documentation clarity, and floor leadership.",
  },
  {
    id: "administrators",
    label: "Administrators",
    blurb: "Boardroom-ready ops, compliance framing, and facility priorities.",
  },
  {
    id: "mds",
    label: "MDS",
    blurb: "Coding accuracy, process discipline, and audit readiness.",
  },
  {
    id: "staffing",
    label: "Staffing/Recruiting",
    blurb: "Coverage models, recruiting support, and retention focus.",
  },
] as const;

export function ConsultantLanes() {
  const [active, setActive] = useState<(typeof LANES)[number]["id"]>("don");
  const lane = LANES.find((l) => l.id === active)!;

  return (
    <div className="space-y-5">
      <div className="don-card px-5 py-5 sm:px-6">
        <h1
          className="text-3xl font-semibold text-[color:var(--burgundy-deep)] sm:text-4xl"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Request Consultant
        </h1>
        <p className="mt-2 text-lg font-semibold text-[color:var(--muted)]">
          Choose a lane, then explore a live consultant for that focus.
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Consultant lanes">
          {LANES.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={active === l.id}
              className={`don-btn text-sm ${
                active === l.id ? "don-btn-primary" : "don-btn-ghost"
              }`}
              onClick={() => setActive(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <section className="don-card flex min-h-[28vh] flex-col items-start justify-center gap-4 px-5 py-8 sm:px-6">
        <p className="don-kicker">{lane.label}</p>
        <p className="max-w-2xl text-lg font-semibold text-[color:var(--ink-soft)]">
          {lane.blurb}
        </p>
        <button type="button" className="don-btn don-btn-primary min-h-12 px-6">
          Explore a live consultant — {lane.label}
        </button>
      </section>
    </div>
  );
}
