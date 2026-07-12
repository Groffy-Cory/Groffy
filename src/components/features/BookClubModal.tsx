"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { EpubReader } from "@/components/features/EpubReader";
import { ModalShell } from "@/components/features/ModalShell";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import {
  librarySearchUrl,
  statusLabel,
  type BookItem,
  type ReadingListEntry,
  type ReadingStatus,
} from "@/lib/features/books";
import {
  addToReadingList,
  loadReadingList,
  removeFromReadingList,
  saveReadingList,
  updateReadingStatus,
} from "@/lib/features/book-club-storage";

type View = "search" | "free" | "club" | "library";

export function BookClubModal() {
  const { openFeature, closeFeatureModal, prefs, updatePrefs } =
    usePreferences();
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<BookItem[]>([]);
  const [freeBooks, setFreeBooks] = useState<BookItem[]>([]);
  const [readingList, setReadingList] = useState<ReadingListEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>("search");
  const [notice, setNotice] = useState<string | null>(null);
  const [readerBook, setReaderBook] = useState<BookItem | null>(null);
  const [libraryName, setLibraryName] = useState(prefs.libraryName);
  const [libraryUrl, setLibraryUrl] = useState(prefs.libraryCatalogUrl);

  useEffect(() => {
    if (openFeature !== "book-club") return;
    setReadingList(loadReadingList());
    setView("search");
    setNotice(null);
    setQuery("");
    setBooks([]);
    setReaderBook(null);
    setLibraryName(prefs.libraryName);
    setLibraryUrl(prefs.libraryCatalogUrl);
    void loadFreeBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openFeature]);

  const clubCounts = useMemo(() => {
    return {
      reading: readingList.filter((b) => b.status === "currently_reading")
        .length,
      finished: readingList.filter((b) => b.status === "finished").length,
      want: readingList.filter((b) => b.status === "want_to_read").length,
    };
  }, [readingList]);

  if (openFeature !== "book-club") return null;

  async function load(q: string, freeOnly = false) {
    const trimmed = q.trim();
    if (!freeOnly && !trimmed) return;
    setLoading(true);
    setNotice(null);
    try {
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      if (freeOnly) params.set("free", "1");
      const response = await fetch(`/api/books?${params.toString()}`);
      const data = (await response.json()) as { books: BookItem[] };
      setBooks(data.books || []);
      setView(freeOnly ? "free" : "search");
      if ((data.books || []).length === 0) {
        setNotice("No books found. Try a simpler title or author name.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadFreeBooks() {
    try {
      const response = await fetch("/api/books?free=1");
      const data = (await response.json()) as { books: BookItem[] };
      setFreeBooks(data.books || []);
    } catch {
      setFreeBooks([]);
    }
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    void load(query, false);
  }

  function persistList(next: ReadingListEntry[], message: string) {
    setReadingList(next);
    saveReadingList(next);
    setNotice(message);
  }

  function handleAdd(book: BookItem, status: ReadingStatus = "want_to_read") {
    const next = addToReadingList(readingList, book, status);
    persistList(
      next,
      status === "currently_reading"
        ? `Started reading “${book.title}”.`
        : `Added “${book.title}” to your club list.`,
    );
  }

  function handleStatus(bookId: string, title: string, status: ReadingStatus) {
    const next = updateReadingStatus(readingList, bookId, status);
    persistList(next, `“${title}” marked ${statusLabel(status).toLowerCase()}.`);
  }

  function handleRemove(bookId: string, title: string) {
    const next = removeFromReadingList(readingList, bookId);
    persistList(next, `Removed “${title}” from your club list.`);
  }

  function openReader(book: BookItem) {
    if (!book.iaId || !book.canReadFree) {
      setNotice(
        "A free EPUB isn’t available for this title yet. Try Free to read books, or open Open Library.",
      );
      return;
    }
    handleAdd(book, "currently_reading");
    setReaderBook(book);
  }

  function reserveBook(book: BookItem) {
    const href = librarySearchUrl({
      title: book.title,
      authors: book.authors,
      isbn: book.isbn,
      libraryCatalogUrl: prefs.libraryCatalogUrl,
      city: prefs.weatherCity,
    });
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function saveLibrarySettings(event: FormEvent) {
    event.preventDefault();
    updatePrefs({
      libraryName: libraryName.trim() || "Local library",
      libraryCatalogUrl:
        libraryUrl.trim() || "https://www.worldcat.org/search",
    });
    setNotice("Library settings saved.");
  }

  if (readerBook?.iaId) {
    return (
      <EpubReader
        title={readerBook.title}
        iaId={readerBook.iaId}
        onClose={() => setReaderBook(null)}
      />
    );
  }

  return (
    <ModalShell
      title="Book Club"
      subtitle="Search Open Library, read free classics in the app, and reserve from your library."
      onClose={closeFeatureModal}
    >
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["search", "Search books"],
            ["free", "Free to read"],
            [
              "club",
              `My club list${readingList.length ? ` (${readingList.length})` : ""}`,
            ],
            ["library", "My library"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={[
              "rof-btn min-h-12",
              view === id ? "rof-btn-primary" : "rof-btn-secondary",
            ].join(" ")}
            onClick={() => {
              setView(id);
              if (id === "free") void loadFreeBooks();
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "search" ? (
        <form
          onSubmit={handleSearch}
          className="mt-5 flex flex-wrap items-end gap-3"
        >
          <div className="min-w-[12rem] flex-1">
            <label
              htmlFor="books-q"
              className="mb-1 block text-base font-bold text-ink"
            >
              Search by title or author
            </label>
            <input
              id="books-q"
              className="rof-input text-lg"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: The Secret Garden"
            />
          </div>
          <button
            type="submit"
            className="rof-btn rof-btn-primary"
            disabled={loading || !query.trim()}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
      ) : null}

      {notice ? (
        <p className="rof-inset mt-4 p-4 text-lg font-semibold text-ink">
          {notice}
        </p>
      ) : null}

      {view === "library" ? (
        <form onSubmit={saveLibrarySettings} className="mt-5 space-y-4">
          <p className="text-lg font-semibold text-muted">
            Save your local library catalog link. “Reserve from Local Library”
            will search that catalog for the book.
          </p>
          <div>
            <label
              htmlFor="library-name"
              className="mb-1 block text-base font-bold text-ink"
            >
              Library name
            </label>
            <input
              id="library-name"
              className="rof-input text-lg"
              value={libraryName}
              onChange={(event) => setLibraryName(event.target.value)}
              placeholder="Example: Chicago Public Library"
            />
          </div>
          <div>
            <label
              htmlFor="library-url"
              className="mb-1 block text-base font-bold text-ink"
            >
              Catalog search page URL
            </label>
            <input
              id="library-url"
              className="rof-input text-lg"
              value={libraryUrl}
              onChange={(event) => setLibraryUrl(event.target.value)}
              placeholder="https://..."
            />
          </div>
          <p className="text-base font-semibold text-muted">
            Tip: WorldCat works for many towns. Default is already set.
          </p>
          <button type="submit" className="rof-btn rof-btn-primary">
            Save library settings
          </button>
        </form>
      ) : null}

      {view === "club" ? (
        <div className="mt-4 space-y-2 text-base font-bold text-muted">
          <p>
            Currently reading: {clubCounts.reading} · Finished:{" "}
            {clubCounts.finished} · Want to read: {clubCounts.want}
          </p>
        </div>
      ) : null}

      {view === "free" ? (
        <p className="mt-4 text-lg font-semibold text-muted">
          Free public-domain books from Open Library — tap Read Book to open
          the in-app reader.
        </p>
      ) : null}

      {view === "search" || view === "free" ? (
        <ul className="mt-5 space-y-4">
          {(view === "free" ? freeBooks.length ? freeBooks : books : books)
            .length === 0 && !loading ? (
            <li className="text-lg font-semibold text-muted">
              {view === "free"
                ? "Loading free books…"
                : "Type a book title or author name, then tap Search."}
            </li>
          ) : (
            (view === "free" ? freeBooks.length ? freeBooks : books : books).map(
              (book) => (
                <li key={book.id}>
                  <BookRow
                    book={book}
                    inClub={readingList.some((item) => item.id === book.id)}
                    onAdd={() => handleAdd(book)}
                    onRead={() => openReader(book)}
                    onReserve={() => reserveBook(book)}
                  />
                </li>
              ),
            )
          )}
        </ul>
      ) : null}

      {view === "club" ? (
        <ul className="mt-5 space-y-4">
          {readingList.length === 0 ? (
            <li className="rof-inset p-5 text-lg font-semibold text-muted">
              Your club list is empty. Search for a book, then add it.
            </li>
          ) : (
            readingList.map((book) => (
              <li key={book.id}>
                <BookRow
                  book={book}
                  entry={book}
                  showPrompt
                  inClub
                  onAdd={() => undefined}
                  onRead={() => openReader(book)}
                  onReserve={() => reserveBook(book)}
                  onStatus={(status) =>
                    handleStatus(book.id, book.title, status)
                  }
                  onRemove={() => handleRemove(book.id, book.title)}
                />
              </li>
            ))
          )}
        </ul>
      ) : null}
    </ModalShell>
  );
}

function BookRow({
  book,
  entry,
  inClub,
  showPrompt = true,
  onAdd,
  onRead,
  onReserve,
  onStatus,
  onRemove,
}: {
  book: BookItem;
  entry?: ReadingListEntry;
  inClub?: boolean;
  showPrompt?: boolean;
  onAdd: () => void;
  onRead: () => void;
  onReserve: () => void;
  onStatus?: (status: ReadingStatus) => void;
  onRemove?: () => void;
}) {
  return (
    <article className="rof-inset flex flex-col gap-4 p-4 sm:flex-row">
      <div className="mx-auto h-40 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-steel-200 bg-[var(--surface-raised)] sm:mx-0">
        {book.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.thumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-sm font-bold text-muted">
            No cover
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-bold text-ink">{book.title}</p>
        <p className="mt-1 text-base font-bold text-muted">
          {book.authors}
          {book.year ? ` · ${book.year}` : ""}
        </p>
        {entry ? (
          <p className="mt-1 text-sm font-bold uppercase tracking-wide text-[color:var(--accent-gold,var(--royal-dark))]">
            {statusLabel(entry.status)}
          </p>
        ) : null}
        {book.canReadFree ? (
          <p className="mt-1 text-sm font-bold text-royal-dark">
            Free to read in the app
          </p>
        ) : null}
        <p className="mt-2 text-lg font-semibold text-muted">
          {book.description}
        </p>
        {showPrompt ? (
          <p className="mt-3 rounded-xl bg-[var(--surface-raised)] p-3 text-lg font-semibold text-ink">
            Discussion: {book.prompt}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {book.canReadFree ? (
            <button
              type="button"
              className="rof-btn rof-btn-primary"
              onClick={onRead}
            >
              Read Book
            </button>
          ) : null}
          {!inClub ? (
            <button
              type="button"
              className="rof-btn rof-btn-primary"
              onClick={onAdd}
            >
              Add to reading list
            </button>
          ) : null}
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={onReserve}
          >
            Reserve from Local Library
          </button>
          <a
            href={book.infoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rof-btn rof-btn-secondary"
          >
            Open details
          </a>
        </div>
        {entry && onStatus ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rof-btn rof-btn-secondary"
              onClick={() => onStatus("currently_reading")}
            >
              Currently reading
            </button>
            <button
              type="button"
              className="rof-btn rof-btn-secondary"
              onClick={() => onStatus("finished")}
            >
              Finished
            </button>
            <button
              type="button"
              className="rof-btn rof-btn-secondary"
              onClick={() => onStatus("want_to_read")}
            >
              Want to read
            </button>
            {onRemove ? (
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                onClick={onRemove}
              >
                Remove
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
