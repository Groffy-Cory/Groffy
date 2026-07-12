"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const YOUTUBE_URL = "https://www.youtube.com/";

export default function YoutubePage() {
  const router = useRouter();

  useEffect(() => {
    window.open(YOUTUBE_URL, "_blank", "noopener,noreferrer");
    router.replace("/");
  }, [router]);

  return (
    <section className="rof-card p-6 text-lg font-semibold text-muted">
      Opening YouTube…
    </section>
  );
}
