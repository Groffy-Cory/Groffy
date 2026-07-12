"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMealsPantry } from "@/components/meals/MealsPantryProvider";

export default function MealsPantryPage() {
  const router = useRouter();
  const { openMealsPantry } = useMealsPantry();

  useEffect(() => {
    openMealsPantry();
    router.replace("/");
  }, [openMealsPantry, router]);

  return (
    <section className="rof-card p-6 text-lg font-semibold text-muted">
      Opening Meals & Pantry…
    </section>
  );
}
