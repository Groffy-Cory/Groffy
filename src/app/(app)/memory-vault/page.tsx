"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMemoryVault } from "@/components/memory-vault/MemoryVaultProvider";

export default function MemoryVaultPage() {
  const router = useRouter();
  const { openVault } = useMemoryVault();

  useEffect(() => {
    openVault();
    router.replace("/");
  }, [openVault, router]);

  return (
    <section className="rof-card p-6 text-lg font-semibold text-muted">
      Opening Memory Vault…
    </section>
  );
}
