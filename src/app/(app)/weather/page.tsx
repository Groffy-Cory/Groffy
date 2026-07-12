"use client";

import { OpenFeatureRedirect } from "@/components/features/OpenFeatureRedirect";

export default function WeatherPage() {
  return <OpenFeatureRedirect feature="weather" />;
}
