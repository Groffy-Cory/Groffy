import { NextResponse } from "next/server";
import { getNews } from "@/lib/features/news";

export async function GET(request: Request) {
  const topicsParam = new URL(request.url).searchParams.get("topics") || "general";
  const topics = topicsParam.split(",").map((t) => t.trim()).filter(Boolean);
  const articles = await getNews(topics);
  return NextResponse.json({ articles });
}
