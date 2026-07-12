import { NextResponse } from "next/server";
import { getTodaysSpecials } from "@/lib/specials/service";
import { secondsUntilNextLocalMidnight } from "@/lib/specials/date";
import { isOnPremMode } from "@/lib/specials/grok";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const onPrem = isOnPremMode(searchParams.get("onPrem") === "1");
    const data = await getTodaysSpecials(onPrem);
    const response = NextResponse.json(data);
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${secondsUntilNextLocalMidnight()}, stale-while-revalidate=600`,
    );
    return response;
  } catch (error) {
    console.error("todays-specials failed", error);
    return NextResponse.json(
      { error: "Unable to load Today's Specials right now." },
      { status: 500 },
    );
  }
}
