import { NextResponse } from "next/server";
import { getSports } from "@/lib/features/sports";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagues = (searchParams.get("leagues") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const teams = (searchParams.get("teams") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const events = await getSports(leagues, teams);
  return NextResponse.json({ events });
}
