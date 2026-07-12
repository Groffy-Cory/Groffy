"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const DUCKDUCKGO_URL = "https://duckduckgo.com/";

export default function SearchPage() {
  const router = useRouter();

  useEffect(() => {
    window.open(DUCKDUCKGO_URL, "_blank", "noopener,noreferrer");
    router.replace("/");
  }, [router]);

  return (
    <section className="rof-card p-6 text-lg font-semibold text-muted">
      Opening DuckDuckGo…
    </section>
  );
}
