"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLists } from "@/components/lists/ListsProvider";

export default function ListsPage() {
  const router = useRouter();
  const { openLists } = useLists();

  useEffect(() => {
    openLists();
    router.replace("/");
  }, [openLists, router]);

  return (
    <section className="rof-card p-6 text-lg font-semibold text-muted">
      Opening Lists…
    </section>
  );
}
