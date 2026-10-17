import { PageHeading } from "@/components/PageHeading";
import { getThoughtForDay } from "@/lib/daily-content";

export default function ThoughtsPage() {
  const thought = getThoughtForDay();

  return (
    <div>
      <PageHeading
        title="Thoughts of the Day"
        description="Reflection to carry — swap in scripture, quotes, or leadership notes."
      />
      <blockquote className="don-inset p-6">
        <p className="text-2xl font-semibold leading-snug">“{thought.quote}”</p>
        <footer className="mt-4 text-lg font-semibold text-[color:var(--muted)]">
          — {thought.attribution}
        </footer>
      </blockquote>
    </div>
  );
}
