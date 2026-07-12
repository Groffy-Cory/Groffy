import { NextResponse } from "next/server";
import { searchYoutube } from "@/lib/features/youtube";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") || "classic songs";
  const videos = await searchYoutube(q);
  return NextResponse.json({ videos });
}
