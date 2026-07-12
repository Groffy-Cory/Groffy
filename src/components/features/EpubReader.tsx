"use client";

import { useEffect, useRef, useState } from "react";
import ePub, { type Book, type Rendition } from "epubjs";

type EpubReaderProps = {
  title: string;
  iaId: string;
  onClose: () => void;
};

export function EpubReader({ title, iaId, onClose }: EpubReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [status, setStatus] = useState("Loading book…");
  const [error, setError] = useState<string | null>(null);
  const [fontScale, setFontScale] = useState(1.25);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!viewerRef.current) return;
      setError(null);
      setStatus("Loading book…");

      try {
        const book = ePub(`/api/books/epub?ia=${encodeURIComponent(iaId)}`);
        bookRef.current = book;
        const rendition = book.renderTo(viewerRef.current, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          allowScriptedContent: false,
        });
        renditionRef.current = rendition;

        rendition.themes.default({
          body: {
            "font-size": `${fontScale}em !important`,
            "line-height": "1.7 !important",
            "font-family": "Georgia, 'Times New Roman', serif !important",
            color: "#1f1c1a !important",
            background: "#f7f2e8 !important",
            padding: "0.5rem !important",
          },
          p: {
            "font-size": "1em !important",
            "line-height": "1.7 !important",
          },
        });

        await book.ready;
        if (cancelled) return;
        await rendition.display();
        setStatus("");
      } catch {
        if (!cancelled) {
          setError(
            "Could not open this EPUB in the app. You can still read it on Open Library.",
          );
          setStatus("");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
      try {
        renditionRef.current?.destroy();
        bookRef.current?.destroy();
      } catch {
        // ignore cleanup errors
      }
      renditionRef.current = null;
      bookRef.current = null;
    };
    // Recreate when book changes; font updates applied separately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iaId]);

  useEffect(() => {
    const rendition = renditionRef.current;
    if (!rendition) return;
    rendition.themes.fontSize(`${Math.round(fontScale * 100)}%`);
  }, [fontScale]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") void renditionRef.current?.next();
      if (event.key === "ArrowLeft") void renditionRef.current?.prev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[color:var(--parchment,#f7f2e8)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-steel-200 bg-[var(--surface)] px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-display text-2xl font-semibold text-ink">
            {title}
          </p>
          {status ? (
            <p className="text-base font-semibold text-muted">{status}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={() => setFontScale((n) => Math.max(1, n - 0.1))}
          >
            Smaller text
          </button>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={() => setFontScale((n) => Math.min(1.8, n + 0.1))}
          >
            Larger text
          </button>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={() => void renditionRef.current?.prev()}
          >
            Previous page
          </button>
          <button
            type="button"
            className="rof-btn rof-btn-primary"
            onClick={() => void renditionRef.current?.next()}
          >
            Next page
          </button>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={onClose}
          >
            Close reader
          </button>
        </div>
      </div>

      {error ? (
        <div className="m-4 rof-inset p-5 text-lg font-semibold text-ink">
          {error}
          <div className="mt-3">
            <a
              href={`https://archive.org/details/${iaId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rof-btn rof-btn-primary inline-flex"
            >
              Read on Internet Archive
            </a>
          </div>
        </div>
      ) : (
        <div ref={viewerRef} className="min-h-0 flex-1 bg-[#f7f2e8]" />
      )}
    </div>
  );
}
