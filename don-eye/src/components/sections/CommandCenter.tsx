import Link from "next/link";
import {
  formatLongDate,
  getChangesStub,
  getFocusForDay,
  getMotivationForDay,
  getThoughtForDay,
} from "@/lib/daily-content";

export function CommandCenter() {
  const thought = getThoughtForDay();
  const changes = getChangesStub().slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <p className="don-motto">Command center</p>
        <h1
          className="mt-1 text-3xl font-semibold text-[color:var(--steel-bright)] sm:text-4xl"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          {formatLongDate()}
        </h1>
        <p className="mt-2 max-w-2xl text-lg font-semibold text-[color:var(--muted)]">
          Your daily lanes in one view — open a tab on the left for depth, or jump
          straight to Real Old Friend for companion care.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="don-inset p-4 sm:p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--steel)]">
            Focus
          </h2>
          <p className="mt-2 text-lg font-semibold leading-snug">{getFocusForDay()}</p>
          <Link href="/focus" className="don-btn don-btn-secondary mt-4 text-sm">
            Open focus lane
          </Link>
        </article>

        <article className="don-inset p-4 sm:p-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--steel)]">
            Motivation
          </h2>
          <p className="mt-2 text-lg font-semibold leading-snug">
            {getMotivationForDay()}
          </p>
          <Link href="/motivation" className="don-btn don-btn-secondary mt-4 text-sm">
            Open motivation lane
          </Link>
        </article>

        <article className="don-inset p-4 sm:p-5 lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--steel)]">
            Thought of the day
          </h2>
          <blockquote className="mt-2 text-xl font-semibold leading-snug text-[color:var(--ink)]">
            “{thought.quote}”
          </blockquote>
          <p className="mt-2 text-base font-semibold text-[color:var(--muted)]">
            — {thought.attribution}
          </p>
        </article>
      </div>

      <section>
        <h2 className="text-xl font-bold text-[color:var(--steel-bright)]">
          Changes today
        </h2>
        <ul className="mt-3 space-y-2">
          {changes.map((item) => (
            <li key={item} className="don-inset px-4 py-3 text-base font-semibold">
              {item}
            </li>
          ))}
        </ul>
        <Link href="/changes" className="don-btn don-btn-secondary mt-4">
          All changes
        </Link>
      </section>
    </div>
  );
}
