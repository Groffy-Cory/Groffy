"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReminders } from "@/components/reminders/RemindersProvider";

export default function RemindersPage() {
  const router = useRouter();
  const { openReminders } = useReminders();

  useEffect(() => {
    openReminders();
    router.replace("/");
  }, [openReminders, router]);

  return (
    <section className="rof-card p-6 text-lg font-semibold text-muted">
      Opening Reminders…
    </section>
  );
}
