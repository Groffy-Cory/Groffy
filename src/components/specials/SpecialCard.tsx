"use client";

import { useState } from "react";
import type { SpecialItem } from "@/lib/specials/types";

type SpecialCardProps = {
  item: SpecialItem;
};

export function SpecialCard({ item }: SpecialCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      id={item.id}
      className="rof-card flex h-full flex-col p-5 sm:p-6 scroll-mt-28"
    >
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--accent-gold,var(--royal-dark))]">
        {item.sourceLabel}
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
        {item.title}
      </h2>
      <p className="mt-3 text-lg font-semibold leading-relaxed text-ink">
        {item.summary}
      </p>

      {expanded ? (
        <div className="rof-inset mt-4 whitespace-pre-wrap p-4 text-base font-semibold leading-relaxed text-muted">
          {item.detail}
          {item.attribution ? (
            <p className="mt-4 text-sm font-bold text-ink">
              Source:{" "}
              {item.attributionUrl ? (
                <a
                  href={item.attributionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-2 underline-offset-2 text-[color:var(--accent-gold,var(--royal-dark))]"
                >
                  {item.attribution}
                </a>
              ) : (
                item.attribution
              )}
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        className="rof-btn rof-btn-primary mt-5 self-start"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </article>
  );
}
