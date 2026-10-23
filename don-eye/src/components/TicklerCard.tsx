import Link from "next/link";
import type { Tickler } from "@/lib/ticklers";

export function TicklerCard({ tickler }: { tickler: Tickler }) {
  return (
    <article
      className={`don-card px-5 py-5 sm:px-6 sm:py-6 ${
        tickler.tone === "royal" ? "don-card-royal" : ""
      }`}
    >
      <p className="don-kicker">Daily tickler</p>
      <h2
        className="mt-2 text-2xl font-semibold text-[color:var(--burgundy-deep)]"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        {tickler.title}
      </h2>
      <p className="mt-3 max-w-3xl text-lg font-semibold leading-relaxed text-[color:var(--ink-soft)]">
        {tickler.summary}
      </p>
      {tickler.href && tickler.linkLabel ? (
        <Link
          href={tickler.href}
          className={`don-btn mt-5 ${
            tickler.tone === "royal" ? "don-btn-royal" : "don-btn-primary"
          }`}
        >
          {tickler.linkLabel}
        </Link>
      ) : null}
    </article>
  );
}
