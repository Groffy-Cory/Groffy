import { PageHeading } from "@/components/PageHeading";
import { getChangesStub } from "@/lib/daily-content";

export default function ChangesPage() {
  const items = getChangesStub();

  return (
    <div>
      <PageHeading
        title="Changes for the Day"
        description="Schedules, policy updates, and anything that moved since yesterday."
      />
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="don-inset px-4 py-3 text-base font-semibold">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
