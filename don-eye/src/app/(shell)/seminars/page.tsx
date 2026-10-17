import { PlaceholderBoard } from "@/components/sections/PlaceholderBoard";

export default function SeminarsPage() {
  return (
    <PlaceholderBoard
      title="Seminars"
      description="Live sessions and recordings — honor the calendar."
      items={[
        {
          title: "Leadership roundtable",
          meta: "Thu 2:00 p.m. · Conference room A",
          status: "Upcoming",
        },
        {
          title: "Care & resilience workshop",
          meta: "Recording · 58 min",
          status: "On demand",
        },
        {
          title: "Guest speaker — service ethics",
          meta: "Next month · Registration open",
          status: "Signup",
        },
      ]}
    />
  );
}
