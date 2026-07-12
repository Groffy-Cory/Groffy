import { NextResponse } from "next/server";
import {
  getAllPrayerOptions,
  getDailyPrayer,
} from "@/lib/features/prayer";
import type { PrayerDenominationId } from "@/lib/preferences/types";

export async function GET(request: Request) {
  const denomination = (new URL(request.url).searchParams.get(
    "denomination",
  ) || "mindfulness") as PrayerDenominationId;
  return NextResponse.json({
    daily: getDailyPrayer(denomination),
    options: getAllPrayerOptions(denomination),
  });
}
