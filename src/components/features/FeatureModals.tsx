"use client";

import { BookClubModal } from "@/components/features/BookClubModal";
import { MemoryGamesModal } from "@/components/features/MemoryGamesModal";
import { PrayerModal } from "@/components/features/PrayerModal";
import { SportsModal } from "@/components/features/SportsModal";
import { WeatherModal } from "@/components/features/WeatherModal";

export function FeatureModals() {
  return (
    <>
      <WeatherModal />
      <SportsModal />
      <BookClubModal />
      <PrayerModal />
      <MemoryGamesModal />
    </>
  );
}
