"use client";

import Link from "next/link";
import { useState } from "react";
import { useViewMode } from "@/components/ViewModeProvider";
import { REG_LINKS, REG_UPDATES } from "@/lib/ticklers";

export function RegulationsPanel() {
  const [query, setQuery] = useState("");
  const [grokReply, setGrokReply] = useState<string | null>(null);
  const [adminBox, setAdminBox] = useState(
    "Admin Grok briefing (editable): Pin surveyor trends, QSO notes, and facility-specific regulatory focus here. Live Grok fill comes next.",
  );
  const { isAdmin } = useViewMode();

  function runGrokSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const sites = REG_LINKS.map((l) => l.label).join("; ");
    setGrokReply(
      `Grok preview search for “${q}” across: ${sites}.\n\nConnect the Grok API to return live excerpts and links from these regulatory sites. For now this confirms the search lane is ready.`,
    );
  }

  return (
    <div className="space-y-5">
      <section className="don-card don-card-royal px-5 py-5 sm:px-6">
        <h2
          className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          New / recent updates
        </h2>
        <ul className="mt-4 space-y-2">
          {REG_UPDATES.map((update) => (
            <li
              key={update.title}
              className="rounded-lg border border-[color:var(--steel)] bg-white/60 px-4 py-3"
            >
              <p className="text-base font-bold text-[color:var(--ink)]">
                {update.title}
              </p>
              <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">
                {update.date}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="don-card px-5 py-5 sm:px-6">
        <h2
          className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Grok regulatory search
        </h2>
        <p className="mt-2 text-base font-semibold text-[color:var(--muted)]">
          Yes — Grok can search/summarize across the regulatory sites below once
          the API is wired. Use this bar to ask.
        </p>
        <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={runGrokSearch}>
          <input
            className="don-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Grok about CMS, CDC, OSHA, Joint Commission…"
            aria-label="Grok regulatory search"
          />
          <button type="submit" className="don-btn don-btn-royal shrink-0">
            Search with Grok
          </button>
        </form>
        {grokReply ? (
          <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-[color:var(--steel)] bg-white/70 px-4 py-3 text-sm font-semibold text-[color:var(--ink-soft)]">
            {grokReply}
          </pre>
        ) : null}
        <ul className="mt-4 flex flex-wrap gap-2">
          {REG_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="don-btn don-btn-ghost text-sm"
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="don-card px-5 py-5 sm:px-6">
        <h2
          className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Admin Grok box
        </h2>
        <p className="mt-1 text-base font-semibold text-[color:var(--muted)]">
          Filled / directed by Admin — clients read; admins edit (toggle Admin
          view).
        </p>
        {isAdmin ? (
          <textarea
            className="don-input don-textarea mt-3"
            value={adminBox}
            onChange={(e) => setAdminBox(e.target.value)}
            aria-label="Admin regulations briefing"
          />
        ) : (
          <p className="mt-3 rounded-lg border border-[color:var(--steel)] bg-white/60 px-4 py-3 text-base font-semibold text-[color:var(--ink-soft)]">
            {adminBox}
          </p>
        )}
      </section>

      <section className="don-card flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
        <div>
          <h2
            className="text-xl font-semibold text-[color:var(--burgundy-deep)]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Discuss with peers
          </h2>
          <p className="mt-1 text-base font-semibold text-[color:var(--muted)]">
            Jump to Forums for shared questions and tips.
          </p>
        </div>
        <Link href="/forums" className="don-btn don-btn-royal">
          Go to Forums
        </Link>
      </section>
    </div>
  );
}
