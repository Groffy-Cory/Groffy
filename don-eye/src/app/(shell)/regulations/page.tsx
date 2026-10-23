import { PageIntro } from "@/components/PageIntro";
import { RegulationsPanel } from "@/components/RegulationsPanel";

export default function RegulationsPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Regulations"
        blurb="Recent updates, Grok search across regulatory sites, and an Admin-directed briefing box."
      />
      <RegulationsPanel />
    </div>
  );
}
