import Link from "next/link";
import { notFound } from "next/navigation";
import { SIDEBAR_TABS } from "@/lib/constants";

type FeaturePageProps = {
  params: Promise<{ feature: string }>;
};

export function generateStaticParams() {
  return SIDEBAR_TABS.filter(
    (tab) =>
      tab.id !== "todays-specials" &&
      tab.id !== "reminders" &&
      tab.id !== "messages" &&
      tab.id !== "memory-vault" &&
      tab.id !== "lists" &&
      tab.id !== "meals-pantry" &&
      tab.id !== "weather" &&
      tab.id !== "news" &&
      tab.id !== "sports" &&
      tab.id !== "facebook" &&
      tab.id !== "youtube" &&
      tab.id !== "search" &&
      tab.id !== "book-club" &&
      tab.id !== "prayer" &&
      tab.id !== "memory-games",
  ).map((tab) => ({
    feature: tab.href.replace(/^\//, ""),
  }));
}

export default async function FeaturePage({ params }: FeaturePageProps) {
  const { feature } = await params;
  const tab = SIDEBAR_TABS.find((item) => item.href === `/${feature}`);

  if (!tab) {
    notFound();
  }

  const children =
    "children" in tab && Array.isArray(tab.children) ? tab.children : null;

  return (
    <section className="rof-card p-6 sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-royal-dark">
        Coming next
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
        {tab.label}
      </h1>
      <p className="mt-3 max-w-2xl text-lg font-semibold text-muted">
        This section is part of the ROF feature set. The Home page is ready
        first — {tab.label.toLowerCase()} will connect to Supabase and Grok
        next.
      </p>

      {children ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {children.map((item) => (
            <li
              key={item}
              className="rof-inset px-4 py-3 text-base font-bold text-ink"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      <Link href="/" className="rof-btn rof-btn-primary mt-8 inline-flex">
        Back to Home
      </Link>
    </section>
  );
}
