"use client";

import { HowYouFeel } from "@/components/home/HowYouFeel";
import { MealIdeas } from "@/components/home/MealIdeas";
import { ShareStory } from "@/components/home/ShareStory";
import { TalkWithRofy } from "@/components/home/TalkWithRofy";
import { useAuth } from "@/components/auth/AuthProvider";

export function HomeDashboard() {
  const { companionName } = useAuth();

  return (
    <div className="flex flex-col gap-4 pb-2">
      <TalkWithRofy companionName={companionName} />
      <HowYouFeel companionName={companionName} />
      <ShareStory companionName={companionName} />
      <MealIdeas />
    </div>
  );
}
