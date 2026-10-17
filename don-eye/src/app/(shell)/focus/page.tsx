import { PageHeading } from "@/components/PageHeading";
import { getFocusForDay } from "@/lib/daily-content";

export default function FocusPage() {
  return (
    <div>
      <PageHeading
        title="Focus for the Day"
        description="One protected priority — everything else waits its turn."
      />
      <p className="don-inset p-5 text-xl font-semibold leading-relaxed">
        {getFocusForDay()}
      </p>
    </div>
  );
}
