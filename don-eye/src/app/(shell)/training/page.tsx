import { PageIntro } from "@/components/PageIntro";
import { TrainingVideoRepo } from "@/components/TrainingVideoRepo";

export default function TrainingPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Training"
        blurb="Category buttons, open video posting, and per-video forums. Subscription tiers will gate access later."
      />
      <TrainingVideoRepo />
    </div>
  );
}
