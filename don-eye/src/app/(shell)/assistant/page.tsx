import { AssistantChat } from "@/components/AssistantChat";
import { ImportantReminders } from "@/components/ImportantReminders";
import { PageIntro } from "@/components/PageIntro";

export default function AssistantPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Assistant"
        blurb="Grok chat plus Important Reminders for time-sensitive issues."
      />
      <ImportantReminders />
      <AssistantChat />
    </div>
  );
}
