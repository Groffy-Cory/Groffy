"use client";

import { useState } from "react";
import { useViewMode } from "@/components/ViewModeProvider";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  tag: string;
};

const SEED: NewsItem[] = [
  {
    id: "1",
    title: "CMS staffing documentation reminder",
    summary: "Surveyors asking for clearer shift-level coverage notes in Q4.",
    href: "https://www.cms.gov/",
    tag: "Regulatory",
  },
  {
    id: "2",
    title: "Fall prevention: lighting audits",
    summary: "Facilities reporting fewer night falls after hallway lux checks.",
    href: "https://www.cdc.gov/",
    tag: "Clinical",
  },
  {
    id: "3",
    title: "DON peer note — weekend coverage models",
    summary: "Hybrid on-call patterns that reduced burnout without raising OT.",
    href: "#",
    tag: "Specialized",
  },
];

export function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>(SEED);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useViewMode();

  function refreshFromGrok() {
    setLoading(true);
    // Placeholder until xAI Grok API is connected
    window.setTimeout(() => {
      setItems((prev) => [
        {
          id: `grok-${Date.now()}`,
          title: "Grok preview: fresh DON-pertinent headline",
          summary:
            "Wire NEXT_PUBLIC / server Grok route to replace this with live curated links Admin selects as pertinent.",
          href: "#",
          tag: "Grok",
        },
        ...prev,
      ]);
      setLoading(false);
    }, 600);
  }

  return (
    <div className="space-y-5">
      <section className="don-card px-5 py-5 sm:px-6">
        <h2
          className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Grok news feed
        </h2>
        <p className="mt-2 text-base font-semibold text-[color:var(--muted)]">
          News is best served by a Grok API list of links and summaries you mark
          as pertinent. Admin directs themes; clients read the feed.
        </p>
        <button
          type="button"
          className="don-btn don-btn-royal mt-4"
          onClick={refreshFromGrok}
          disabled={loading}
        >
          {loading ? "Asking Grok…" : "Refresh from Grok (preview)"}
        </button>
        {isAdmin ? (
          <p className="mt-3 text-sm font-semibold text-[color:var(--muted)]">
            Admin view: connect Grok server route and curation filters here.
          </p>
        ) : null}
      </section>

      {items.map((item) => (
        <article key={item.id} className="don-card px-5 py-5 sm:px-6">
          <p className="don-kicker">{item.tag}</p>
          <h2
            className="mt-2 text-2xl font-semibold text-[color:var(--burgundy-deep)]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            {item.title}
          </h2>
          <p className="mt-3 text-lg font-semibold text-[color:var(--ink-soft)]">
            {item.summary}
          </p>
          {item.href !== "#" ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="don-btn don-btn-ghost mt-4 text-sm"
            >
              Open link ↗
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
