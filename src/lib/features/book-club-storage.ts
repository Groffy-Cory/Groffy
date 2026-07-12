import type {
  BookItem,
  ReadingListEntry,
  ReadingStatus,
} from "@/lib/features/books";

export const BOOK_CLUB_STORAGE_KEY = "rof-book-club-reading-list-v2";

function isEntry(value: unknown): value is ReadingListEntry {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ReadingListEntry>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.authors === "string" &&
    typeof item.prompt === "string" &&
    typeof item.status === "string" &&
    typeof item.addedAt === "string"
  );
}

function migrateLegacy(value: unknown): ReadingListEntry | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<BookItem> & { status?: string };
  if (typeof item.id !== "string" || typeof item.title !== "string") return null;
  const now = new Date().toISOString();
  return {
    id: item.id,
    title: item.title,
    authors: typeof item.authors === "string" ? item.authors : "Unknown author",
    description: typeof item.description === "string" ? item.description : "",
    thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : null,
    infoLink:
      typeof item.infoLink === "string"
        ? item.infoLink
        : "https://openlibrary.org",
    prompt: typeof item.prompt === "string" ? item.prompt : "What did you notice?",
    year: typeof item.year === "string" ? item.year : null,
    iaId: typeof item.iaId === "string" ? item.iaId : null,
    ebookAccess: typeof item.ebookAccess === "string" ? item.ebookAccess : null,
    isbn: typeof item.isbn === "string" ? item.isbn : null,
    canReadFree: Boolean(item.canReadFree),
    status: (item.status as ReadingStatus) || "want_to_read",
    addedAt: now,
    updatedAt: now,
  };
}

export function loadReadingList(): ReadingListEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      window.localStorage.getItem(BOOK_CLUB_STORAGE_KEY) ||
      window.localStorage.getItem("rof-book-club-reading-list-v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (isEntry(item) ? item : migrateLegacy(item)))
      .filter((item): item is ReadingListEntry => item !== null);
  } catch {
    return [];
  }
}

export function saveReadingList(books: ReadingListEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOK_CLUB_STORAGE_KEY, JSON.stringify(books));
}

export function addToReadingList(
  list: ReadingListEntry[],
  book: BookItem,
  status: ReadingStatus = "want_to_read",
): ReadingListEntry[] {
  if (list.some((item) => item.id === book.id)) {
    return updateReadingStatus(list, book.id, status);
  }
  const now = new Date().toISOString();
  const entry: ReadingListEntry = {
    ...book,
    status,
    addedAt: now,
    updatedAt: now,
  };
  return [entry, ...list];
}

export function updateReadingStatus(
  list: ReadingListEntry[],
  bookId: string,
  status: ReadingStatus,
): ReadingListEntry[] {
  return list.map((item) =>
    item.id === bookId
      ? { ...item, status, updatedAt: new Date().toISOString() }
      : item,
  );
}

export function removeFromReadingList(
  list: ReadingListEntry[],
  bookId: string,
): ReadingListEntry[] {
  return list.filter((item) => item.id !== bookId);
}
