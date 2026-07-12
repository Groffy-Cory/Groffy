import { NextResponse } from "next/server";
import { searchDuckDuckGo } from "@/lib/features/search";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") || "";
  const results = await searchDuckDuckGo(q);
  return NextResponse.json({ results });
}
