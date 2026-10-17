import { PageHeading } from "@/components/PageHeading";
import { getNewsStub } from "@/lib/daily-content";

export default function NewsPage() {
  const items = getNewsStub();

  return (
    <div>
      <PageHeading
        title="News for the Day"
        description="Headlines and briefings — connect to your news API or Grok digest."
      />
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.headline} className="don-inset p-4 sm:p-5">
            <h2 className="text-lg font-bold text-[color:var(--steel-bright)]">
              {item.headline}
            </h2>
            <p className="mt-2 text-base font-semibold text-[color:var(--muted)]">
              {item.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
