import { PlaceholderBoard } from "@/components/sections/PlaceholderBoard";

export default function TrainingPage() {
  return (
    <PlaceholderBoard
      title="Training"
      description="Modules, certifications, and refreshers — track completion here."
      items={[
        {
          title: "Module 1 — Standards overview",
          meta: "45 min · Required annually",
          status: "Complete",
        },
        {
          title: "Module 2 — Communication under stress",
          meta: "30 min · Due in 14 days",
          status: "In progress",
        },
        {
          title: "Module 3 — Supervisor checklist",
          meta: "60 min · Supervisors only",
          status: "Not started",
        },
      ]}
    />
  );
}
