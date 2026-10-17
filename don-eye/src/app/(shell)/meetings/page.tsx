import { PlaceholderBoard } from "@/components/sections/PlaceholderBoard";

export default function MeetingsPage() {
  return (
    <PlaceholderBoard
      title="Meetings"
      description="Standing meetings, agendas, and minutes in one place."
      items={[
        {
          title: "Weekly ops sync",
          meta: "Mon 9:00 a.m. · Agenda posted",
          status: "Recurring",
        },
        {
          title: "Safety briefing",
          meta: "Wed 7:30 a.m. · Room 204",
          status: "Recurring",
        },
        {
          title: "Quarterly review",
          meta: "Draft minutes available",
          status: "Archive",
        },
      ]}
    />
  );
}
