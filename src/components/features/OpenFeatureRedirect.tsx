"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { FeatureModalId } from "@/lib/preferences/types";

export function OpenFeatureRedirect({ feature }: { feature: FeatureModalId }) {
  const router = useRouter();
  const { openFeatureModal } = usePreferences();

  useEffect(() => {
    openFeatureModal(feature);
    router.replace("/");
  }, [feature, openFeatureModal, router]);

  return (
    <section className="rof-card p-6 text-lg font-semibold text-muted">
      Opening…
    </section>
  );
}
