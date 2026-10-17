import { PageHeading } from "@/components/PageHeading";

const SECTIONS = [
  {
    title: "Care",
    body: "Treat every person with patience. Escalate when safety or dignity is at risk.",
  },
  {
    title: "Honor",
    body: "Keep promises. Document decisions. Speak accurately even when it is difficult.",
  },
  {
    title: "Service",
    body: "The mission is people — clear communication beats heroic solo effort.",
  },
];

export default function GuidelinesPage() {
  return (
    <div>
      <PageHeading
        title="Guidelines"
        description="How we operate — link PDFs, handbooks, and policy updates here."
      />
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <article key={section.title} className="don-inset p-4 sm:p-5">
            <h2 className="text-lg font-bold text-[color:var(--steel-bright)]">
              {section.title}
            </h2>
            <p className="mt-2 text-base font-semibold text-[color:var(--muted)]">
              {section.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
