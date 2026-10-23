import { NewsFeed } from "@/components/NewsFeed";
import { PageIntro } from "@/components/PageIntro";

export default function NewsPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        title="News"
        blurb="Grok-curated links and summaries — Admin directs what is pertinent for DONs."
      />
      <NewsFeed />
    </div>
  );
}
