import { PageIntro } from "@/components/PageIntro";

const BLOCKS = [
  {
    title: "Today’s theme",
    body: "Protect one person with your full attention — even for ninety seconds. Presence is leadership.",
  },
  {
    title: "Two-minute spirit cleanse",
    body: "Feet on the floor. Inhale for four. Exhale for six. Name one worry you will set down until the next break.",
  },
  {
    title: "Quote to carry",
    body: "“Well done is better than well said.” — Benjamin Franklin",
  },
  {
    title: "On-the-spot self-care",
    body: "Drink water, stretch your shoulders, and step into daylight for one corridor length before the next meeting.",
  },
];

export default function YourSpiritPage() {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Your Spirit"
        blurb="Positive themes, short exercises, quotes, and guidance you can use between calls."
      />

      {BLOCKS.map((block) => (
        <article key={block.title} className="don-card px-5 py-5 sm:px-6">
          <h2
            className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            {block.title}
          </h2>
          <p className="mt-3 text-lg font-semibold leading-relaxed text-[color:var(--ink-soft)]">
            {block.body}
          </p>
        </article>
      ))}
    </div>
  );
}
