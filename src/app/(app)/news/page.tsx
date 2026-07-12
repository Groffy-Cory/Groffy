"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

export default function NewsPage() {
  const router = useRouter();
  const { prefs } = usePreferences();

  useEffect(() => {
    const useful = prefs.newsTopics.filter((topic) => topic !== "general");
    const query =
      useful.length > 0 ? `${useful.join(" ")} news` : "today's news";
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=news`;
    window.open(url, "_blank", "noopener,noreferrer");
    router.replace("/");
  }, [prefs.newsTopics, router]);

  return (
    <section className="rof-card p-6 text-lg font-semibold text-muted">
      Opening News in DuckDuckGo…
    </section>
  );
}
