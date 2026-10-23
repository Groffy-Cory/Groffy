import Image from "next/image";
import { PageIntro } from "@/components/PageIntro";
import { getRofAppUrl } from "@/lib/config";

export default function RofReportsPage() {
  const rofUrl = getRofAppUrl();

  return (
    <div className="space-y-5">
      <PageIntro
        title="ROF Reports"
        blurb="Open Real Old Friend for companion check-ins, stories, and resident-centered daily signals."
      />

      <section className="don-card don-card-royal flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:px-6">
        <Image
          src="/rof-logo.png"
          alt="Real Old Friend"
          width={88}
          height={88}
          className="h-20 w-20 rounded-full object-cover ring-2 ring-[color:var(--steel)]"
        />
        <div className="min-w-0 flex-1">
          <h2
            className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Real Old Friend
          </h2>
          <p className="mt-2 text-lg font-semibold text-[color:var(--muted)]">
            Use ROF for mood, stories, healthy choices, and Talk with Rofy. Reports
            and deeper analytics can land here later.
          </p>
          <a
            href={rofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="don-btn don-btn-royal mt-4"
          >
            Open Real Old Friend ↗
          </a>
        </div>
      </section>

      <section className="don-card space-y-3 px-5 py-5 sm:px-6">
        <p className="don-kicker">Placeholder report tiles</p>
        <ul className="space-y-2 text-base font-semibold text-[color:var(--ink-soft)]">
          <li className="rounded-lg border border-[color:var(--steel)] bg-white/50 px-4 py-3">
            Check-in trends (coming soon)
          </li>
          <li className="rounded-lg border border-[color:var(--steel)] bg-white/50 px-4 py-3">
            Shared stories this week (coming soon)
          </li>
          <li className="rounded-lg border border-[color:var(--steel)] bg-white/50 px-4 py-3">
            Family portal notes (coming soon)
          </li>
        </ul>
      </section>
    </div>
  );
}
