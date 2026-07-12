import { NextResponse } from "next/server";
import { getWeather } from "@/lib/features/weather";

export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city") || "Chicago";
  const data = await getWeather(city);
  return NextResponse.json(data);
}
