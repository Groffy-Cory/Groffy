"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const FACEBOOK_URL = "https://www.facebook.com/";

export default function FacebookPage() {
  const router = useRouter();

  useEffect(() => {
    window.open(FACEBOOK_URL, "_blank", "noopener,noreferrer");
    router.replace("/");
  }, [router]);

  return (
    <section className="rof-card p-6 text-lg font-semibold text-muted">
      Opening Facebook…
    </section>
  );
}
