import { PageHeading } from "@/components/PageHeading";
import { getMotivationForDay } from "@/lib/daily-content";

export default function MotivationPage() {
  return (
    <div>
      <PageHeading
        title="Motivation for the Day"
        description="Care, honor, and service — stated plainly."
      />
      <p className="don-inset p-5 text-xl font-semibold leading-relaxed">
        {getMotivationForDay()}
      </p>
    </div>
  );
}
