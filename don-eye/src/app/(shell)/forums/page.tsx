import { PlaceholderBoard } from "@/components/sections/PlaceholderBoard";

export default function ForumsPage() {
  return (
    <PlaceholderBoard
      title="Forums"
      description="Threaded discussion — pin announcements and moderate with care."
      items={[
        {
          title: "General assembly",
          meta: "12 topics · Last post 2h ago",
          status: "Active",
        },
        {
          title: "Training Q&A",
          meta: "8 topics · Last post yesterday",
          status: "Active",
        },
        {
          title: "Field reports",
          meta: "3 topics · Awaiting review",
          status: "Moderated",
        },
      ]}
    />
  );
}
