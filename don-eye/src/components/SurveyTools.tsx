"use client";

import { useState } from "react";

const TOOLS = [
  {
    id: "prep",
    label: "Survey Prep",
    body: "Checklists, focus areas, and documentation readiness before surveyors arrive.",
  },
  {
    id: "plan",
    label: "Survey Plan",
    body: "Timelines, assignments, and communication plans for survey week.",
  },
  {
    id: "response",
    label: "Survey Response",
    body: "Draft responses, POC framing, and follow-up tracking after findings.",
  },
] as const;

export function SurveyTools() {
  const [active, setActive] = useState<(typeof TOOLS)[number]["id"]>("prep");
  const tool = TOOLS.find((t) => t.id === active)!;

  return (
    <div className="space-y-5">
      <div className="don-card px-5 py-5 sm:px-6">
        <div className="mt-1 flex flex-wrap gap-2" role="tablist" aria-label="Survey tools">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active === t.id}
              className={`don-btn text-sm ${
                active === t.id ? "don-btn-royal" : "don-btn-ghost"
              }`}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section className="don-card px-5 py-6 sm:px-6">
        <h2
          className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          {tool.label}
        </h2>
        <p className="mt-3 text-lg font-semibold text-[color:var(--ink-soft)]">
          {tool.body}
        </p>
        <ul className="mt-4 space-y-2 text-base font-semibold text-[color:var(--muted)]">
          <li className="rounded-lg border border-[color:var(--steel)] bg-white/50 px-4 py-3">
            Tool content placeholder — expand checklists and templates next.
          </li>
          <li className="rounded-lg border border-[color:var(--steel)] bg-white/50 px-4 py-3">
            Save / share actions can plug in with Auth later.
          </li>
        </ul>
      </section>
    </div>
  );
}
