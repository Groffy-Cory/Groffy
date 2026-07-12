"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Finishing sign-in…");

  useEffect(() => {
    const supabase = createBrowserClient();
    if (!supabase) {
      router.replace("/");
      return;
    }

    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setStatus("Sign-in didn’t finish. Taking you back…");
            window.setTimeout(() => router.replace("/"), 1500);
            return;
          }
        } else {
          await supabase.auth.getSession();
        }
        router.replace("/");
      } catch {
        setStatus("Sign-in didn’t finish. Taking you back…");
        window.setTimeout(() => router.replace("/"), 1500);
      }
    })();
  }, [router]);

  return (
    <section className="flex min-h-screen items-center justify-center p-6">
      <p className="fp-card p-6 text-lg font-semibold text-[color:var(--muted)]">
        {status}
      </p>
    </section>
  );
}
