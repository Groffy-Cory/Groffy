import { NextResponse } from "next/server";
import { resolveEpubUrl } from "@/lib/features/books";

/**
 * Proxy Internet Archive EPUB files so the in-app reader can load them
 * without browser CORS blocks.
 */
export async function GET(request: Request) {
  const iaId = new URL(request.url).searchParams.get("ia");
  if (!iaId) {
    return NextResponse.json({ error: "Missing ia id" }, { status: 400 });
  }

  const epubUrl = await resolveEpubUrl(iaId);
  if (!epubUrl) {
    return NextResponse.json(
      { error: "Could not find an EPUB for this book." },
      { status: 404 },
    );
  }

  try {
    const upstream = await fetch(epubUrl, {
      signal: AbortSignal.timeout(60000),
      headers: {
        "User-Agent": "ROF-SeniorCompanion/1.0",
      },
      redirect: "follow",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        {
          error:
            "This book’s EPUB isn’t available for download right now. Try Open Library in a new tab.",
          epubUrl,
        },
        { status: 502 },
      );
    }

    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/epub+zip",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not download the EPUB. Please try again." },
      { status: 500 },
    );
  }
}
