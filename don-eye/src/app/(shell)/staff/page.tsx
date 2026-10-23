import { Suspense } from "react";
import { PageIntro } from "@/components/PageIntro";
import { StaffPanel } from "@/components/StaffPanel";

export default function StaffPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Staff"
        blurb="Today, This Week, This Month, Staff Overview, Staff Training, and Recruiting — with room for large option sets in each."
      />
      <Suspense
        fallback={
          <div className="don-card px-5 py-6 text-base font-semibold text-[color:var(--muted)]">
            Loading Staff…
          </div>
        }
      >
        <StaffPanel />
      </Suspense>
    </div>
  );
}
