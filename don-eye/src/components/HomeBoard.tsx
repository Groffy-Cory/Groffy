"use client";

import { SubjectDetail } from "@/components/SubjectDetail";
import { useWindows } from "@/components/windows/window-context";
import { SUBJECT_CARDS } from "@/lib/subjects";

export function HomeBoard() {
  const { openWindow } = useWindows();

  return (
    <div className="space-y-5">
      <section className="don-card px-5 py-5 sm:px-6">
        <p className="don-kicker">Home</p>
        <h1
          className="mt-1 text-3xl font-semibold text-[color:var(--burgundy-deep)] sm:text-4xl"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Choose a lane
        </h1>
        <p className="mt-2 max-w-3xl text-lg font-semibold text-[color:var(--muted)]">
          Large cards below match the left menu. Click a card or a sidebar button
          to open a movable detail window for that subject.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {SUBJECT_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => {
              openWindow({
                id: `subject-${card.id}`,
                title: card.title,
                width: 560,
                height: 480,
                content: <SubjectDetail subject={card} />,
              });
            }}
            className={`don-card don-select-card px-5 py-5 text-left sm:px-6 sm:py-6 ${
              card.tone === "royal" ? "don-card-royal" : ""
            }`}
          >
            <p className="don-kicker">Selection</p>
            <h2
              className="mt-2 text-2xl font-semibold text-[color:var(--burgundy-deep)]"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              {card.title}
            </h2>
            <p className="mt-3 text-base font-semibold leading-relaxed text-[color:var(--ink-soft)]">
              {card.blurb}
            </p>
            <ul className="mt-4 space-y-1.5">
              {card.detail.slice(0, 2).map((line) => (
                <li
                  key={line}
                  className="text-sm font-semibold text-[color:var(--muted)]"
                >
                  • {line}
                </li>
              ))}
            </ul>
            <span className="don-btn don-btn-ghost mt-5 pointer-events-none">
              Open detail window
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
