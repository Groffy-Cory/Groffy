"use client";

import { FormEvent, useEffect, useState } from "react";
import { ModalShell } from "@/components/features/ModalShell";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { ForecastDay, WeatherSnapshot } from "@/lib/features/weather";

export function WeatherModal() {
  const { openFeature, closeFeatureModal, prefs, updatePrefs, syncSource } =
    usePreferences();
  const [city, setCity] = useState(prefs.weatherCity);
  const [current, setCurrent] = useState<WeatherSnapshot | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openFeature !== "weather") return;
    setCity(prefs.weatherCity);
    void load(prefs.weatherCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFeature]);

  if (openFeature !== "weather") return null;

  async function load(nextCity: string) {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(nextCity)}`,
      );
      const data = (await response.json()) as {
        current: WeatherSnapshot;
        forecast: ForecastDay[];
      };
      setCurrent(data.current);
      setForecast(data.forecast || []);
    } finally {
      setLoading(false);
    }
  }

  function handleSave(event: FormEvent) {
    event.preventDefault();
    updatePrefs({ weatherCity: city.trim() || "Chicago" });
    void load(city.trim() || "Chicago");
  }

  return (
    <ModalShell
      title="Weather"
      subtitle="Current conditions and a few days ahead."
      footerNote={
        syncSource === "supabase"
          ? "City preference saved to Supabase"
          : "City saved on this device"
      }
      onClose={closeFeatureModal}
    >
      <form onSubmit={handleSave} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] flex-1">
          <label htmlFor="weather-city" className="mb-1 block text-base font-bold text-ink">
            Your city
          </label>
          <input
            id="weather-city"
            className="rof-input text-lg"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </div>
        <button type="submit" className="rof-btn rof-btn-primary" disabled={loading}>
          {loading ? "Loading…" : "Update weather"}
        </button>
      </form>

      {current ? (
        <div className="rof-inset mt-5 p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-[color:var(--accent-gold,var(--royal-dark))]">
            {current.city}
          </p>
          <p className="mt-2 font-display text-4xl font-semibold text-ink">
            {current.tempF}°F
          </p>
          <p className="mt-2 text-xl font-bold capitalize text-ink">
            {current.description}
          </p>
          <p className="mt-2 text-lg font-semibold text-muted">
            Feels like {current.feelsLikeF}° · Humidity {current.humidity}% · Wind{" "}
            {current.windMph} mph
          </p>
        </div>
      ) : null}

      <ul className="mt-5 space-y-3">
        {forecast.map((day) => (
          <li key={day.dateLabel} className="rof-inset p-4">
            <p className="text-xl font-bold text-ink">{day.dateLabel}</p>
            <p className="mt-1 text-lg font-semibold text-muted capitalize">
              {day.description} · High {day.highF}° / Low {day.lowF}°
            </p>
          </li>
        ))}
      </ul>
    </ModalShell>
  );
}
