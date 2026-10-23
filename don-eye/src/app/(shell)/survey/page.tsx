import { PageIntro } from "@/components/PageIntro";
import { SurveyTools } from "@/components/SurveyTools";

export default function SurveyPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Survey"
        blurb="Tools for Survey Prep, Survey Plan, and Survey Response."
      />
      <SurveyTools />
    </div>
  );
}
