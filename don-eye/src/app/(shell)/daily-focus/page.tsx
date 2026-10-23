import { PageIntro } from "@/components/PageIntro";
import { DAILY_FOCUS_ITEMS } from "@/lib/ticklers";

export default function DailyFocusPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Daily Focus"
        blurb="One to three suggested care or business priorities for today. Configurable later."
      />

      {DAILY_FOCUS_ITEMS.map((item, index) => (
        <article key={item.title} className="don-card px-5 py-5 sm:px-6">
          <p className="don-kicker">Focus {index + 1}</p>
          <h2
            className="mt-2 text-2xl font-semibold text-[color:var(--burgundy-deep)]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            {item.title}
          </h2>
          <p className="mt-3 text-lg font-semibold text-[color:var(--ink-soft)]">
            {item.detail}
          </p>
        </article>
      ))}
    </div>
  );
}
