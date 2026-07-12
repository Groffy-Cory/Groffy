export type WeatherSnapshot = {
  city: string;
  description: string;
  tempF: number;
  feelsLikeF: number;
  humidity: number;
  windMph: number;
  icon: string | null;
  source: "openweather" | "fallback";
};

export type ForecastDay = {
  dateLabel: string;
  highF: number;
  lowF: number;
  description: string;
};

export type WeatherPayload = {
  current: WeatherSnapshot;
  forecast: ForecastDay[];
};

function toF(kelvin: number): number {
  return Math.round(((kelvin - 273.15) * 9) / 5 + 32);
}

function fallbackWeather(city: string): WeatherPayload {
  return {
    current: {
      city,
      description: "Partly cloudy (sample)",
      tempF: 68,
      feelsLikeF: 67,
      humidity: 55,
      windMph: 8,
      icon: null,
      source: "fallback",
    },
    forecast: [
      {
        dateLabel: "Tomorrow",
        highF: 72,
        lowF: 58,
        description: "Mostly sunny",
      },
      {
        dateLabel: "Day after",
        highF: 70,
        lowF: 56,
        description: "Light clouds",
      },
      {
        dateLabel: "In 3 days",
        highF: 66,
        lowF: 54,
        description: "Chance of rain",
      },
    ],
  };
}

export async function getWeather(city: string): Promise<WeatherPayload> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const query = city.trim() || "Chicago";

  if (!apiKey || apiKey === "your_openweather_api_key") {
    return fallbackWeather(query);
  }

  try {
    const currentUrl = new URL(
      "https://api.openweathermap.org/data/2.5/weather",
    );
    currentUrl.searchParams.set("q", query);
    currentUrl.searchParams.set("appid", apiKey);

    const forecastUrl = new URL(
      "https://api.openweathermap.org/data/2.5/forecast",
    );
    forecastUrl.searchParams.set("q", query);
    forecastUrl.searchParams.set("appid", apiKey);

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl, { signal: AbortSignal.timeout(12000) }),
      fetch(forecastUrl, { signal: AbortSignal.timeout(12000) }),
    ]);

    if (!currentRes.ok) return fallbackWeather(query);

    const currentJson = (await currentRes.json()) as {
      name?: string;
      weather?: Array<{ description?: string; icon?: string }>;
      main?: { temp?: number; feels_like?: number; humidity?: number };
      wind?: { speed?: number };
    };

    const current: WeatherSnapshot = {
      city: currentJson.name || query,
      description: currentJson.weather?.[0]?.description || "Clear",
      tempF: toF(currentJson.main?.temp ?? 293),
      feelsLikeF: toF(currentJson.main?.feels_like ?? 293),
      humidity: currentJson.main?.humidity ?? 50,
      windMph: Math.round((currentJson.wind?.speed ?? 0) * 2.237),
      icon: currentJson.weather?.[0]?.icon ?? null,
      source: "openweather",
    };

    const forecast: ForecastDay[] = [];
    if (forecastRes.ok) {
      const forecastJson = (await forecastRes.json()) as {
        list?: Array<{
          dt_txt?: string;
          main?: { temp_max?: number; temp_min?: number };
          weather?: Array<{ description?: string }>;
        }>;
      };
      const byDay = new Map<string, ForecastDay>();
      for (const row of forecastJson.list || []) {
        const dayKey = (row.dt_txt || "").slice(0, 10);
        if (!dayKey) continue;
        const high = toF(row.main?.temp_max ?? 293);
        const low = toF(row.main?.temp_min ?? 288);
        const existing = byDay.get(dayKey);
        if (!existing) {
          byDay.set(dayKey, {
            dateLabel: new Date(`${dayKey}T12:00:00`).toLocaleDateString(
              "en-US",
              { weekday: "short", month: "short", day: "numeric" },
            ),
            highF: high,
            lowF: low,
            description: row.weather?.[0]?.description || "",
          });
        } else {
          existing.highF = Math.max(existing.highF, high);
          existing.lowF = Math.min(existing.lowF, low);
        }
      }
      forecast.push(...Array.from(byDay.values()).slice(0, 5));
    }

    return {
      current,
      forecast: forecast.length > 0 ? forecast : fallbackWeather(query).forecast,
    };
  } catch {
    return fallbackWeather(query);
  }
}
