"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMessages } from "@/components/messages/MessagesProvider";

export default function MessagesPage() {
  const router = useRouter();
  const { openMessages } = useMessages();

  useEffect(() => {
    openMessages();
    router.replace("/");
  }, [openMessages, router]);

  return (
    <section className="rof-card p-6 text-lg font-semibold text-muted">
      Opening Messages…
    </section>
  );
}
