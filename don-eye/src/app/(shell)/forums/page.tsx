import { ForumsBoard } from "@/components/ForumsBoard";
import { PageIntro } from "@/components/PageIntro";

export default function ForumsPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Forums"
        blurb="Search and discuss. Admin/moderator posting rules are coming. Training videos can open a focused forum window per video."
      />
      <ForumsBoard />
    </div>
  );
}
