import { NextResponse } from "next/server";
import { searchBooks, getFreePublicDomainBooks } from "@/lib/features/books";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const freeOnly = searchParams.get("free") === "1";
  const q = searchParams.get("q") || "";

  if (freeOnly && !q.trim()) {
    const books = await getFreePublicDomainBooks();
    return NextResponse.json({ books });
  }

  const books = await searchBooks(q || "classic novels", { freeOnly });
  return NextResponse.json({ books });
}
