"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  STAFF_SECTIONS,
  type StaffSectionId,
} from "@/lib/staff";

function initialSection(param: string | null): StaffSectionId {
  if (param && STAFF_SECTIONS.some((s) => s.id === param)) {
    return param as StaffSectionId;
  }
  return "today";
}

export function StaffPanel() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<StaffSectionId>(() =>
    initialSection(searchParams.get("section")),
  );
  const section = STAFF_SECTIONS.find((s) => s.id === active)!;

  return (
    <div className="space-y-4">
      <div className="don-card px-5 py-5 sm:px-6">
        <h2
          className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Staff menu
        </h2>
        <p className="mt-1 text-base font-semibold text-[color:var(--muted)]">
          Pick a lane. Large option sets (filters, people, actions) land inside
          each box next.
        </p>
        <div
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Staff sections"
        >
          {STAFF_SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="don-topic-btn"
              aria-pressed={active === item.id}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="don-card px-5 py-6 sm:px-6" aria-label={section.label}>
        <p className="don-kicker">Staff · {section.label}</p>
        <h2
          className="mt-2 text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          {section.label}
        </h2>
        <p className="mt-3 text-lg font-semibold text-[color:var(--ink-soft)]">
          {section.blurb}
        </p>
        <p className="mt-3 rounded-lg border border-[color:var(--steel)] bg-white/60 px-3 py-2 text-sm font-semibold text-[color:var(--ink-soft)]">
          This box will hold a large set of user options (people, filters,
          actions, reports). Placeholders below mark where those land.
        </p>
        <ul className="mt-4 space-y-2 text-base font-semibold text-[color:var(--muted)]">
          {section.optionSlots.map((slot) => (
            <li
              key={slot}
              className="rounded-lg border border-[color:var(--steel)] bg-white/50 px-4 py-3"
            >
              {slot}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
