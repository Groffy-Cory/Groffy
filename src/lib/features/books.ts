export type ReadingStatus = "want_to_read" | "currently_reading" | "finished";

export type BookItem = {
  id: string;
  title: string;
  authors: string;
  description: string;
  thumbnail: string | null;
  infoLink: string;
  prompt: string;
  year: string | null;
  /** Internet Archive item id when an ebook scan exists */
  iaId: string | null;
  /** Open Library ebook_access value, e.g. public / borrowable */
  ebookAccess: string | null;
  isbn: string | null;
  /** True when a free public-domain / full-access ebook is likely available */
  canReadFree: boolean;
};

export type ReadingListEntry = BookItem & {
  status: ReadingStatus;
  addedAt: string;
  updatedAt: string;
};

const DISCUSSION_PROMPTS = [
  "What moment in this book reminded you of your own life?",
  "Who would you recommend this book to, and why?",
  "What feeling did the ending leave you with?",
  "Which character felt most like someone you know?",
  "If you could ask the author one question, what would it be?",
  "What lesson from this story would you share with family?",
];

export function promptForBook(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % DISCUSSION_PROMPTS.length;
  }
  return DISCUSSION_PROMPTS[hash];
}

export function statusLabel(status: ReadingStatus): string {
  if (status === "currently_reading") return "Currently reading";
  if (status === "finished") return "Finished";
  return "Want to read";
}

type OpenLibraryDoc = {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  first_sentence?: string[] | string;
  subtitle?: string;
  ia?: string[];
  ebook_access?: string;
  isbn?: string[];
  has_fulltext?: boolean;
  public_scan_b?: boolean;
};

function coverUrl(coverId?: number): string | null {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

function firstSentence(value: OpenLibraryDoc["first_sentence"]): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] || null;
  return value;
}

function mapDoc(doc: OpenLibraryDoc, index: number): BookItem | null {
  if (!doc.title) return null;
  const id = doc.key || `ol-${index}-${doc.title}`;
  const iaId = doc.ia?.[0] || null;
  const ebookAccess = doc.ebook_access || null;
  const canReadFree = ebookAccess === "public" && Boolean(iaId);

  const sentence = firstSentence(doc.first_sentence);
  const description =
    sentence ||
    (doc.subtitle
      ? doc.subtitle
      : doc.first_publish_year
        ? `First published in ${doc.first_publish_year}.`
        : "A book for our club — open details to learn more.");

  return {
    id,
    title: doc.title,
    authors: (doc.author_name || ["Unknown author"]).join(", "),
    description: description.slice(0, 240),
    thumbnail: coverUrl(doc.cover_i),
    infoLink: doc.key
      ? `https://openlibrary.org${doc.key}`
      : "https://openlibrary.org",
    prompt: promptForBook(id),
    year: doc.first_publish_year ? String(doc.first_publish_year) : null,
    iaId,
    ebookAccess,
    isbn: doc.isbn?.[0] || null,
    canReadFree: Boolean(canReadFree),
  };
}

const FALLBACK_BOOKS: BookItem[] = [
  {
    id: "/works/OL8193W",
    title: "Pride and Prejudice",
    authors: "Jane Austen",
    description: "A beloved classic — free to read from Open Library / Internet Archive.",
    thumbnail: "https://covers.openlibrary.org/b/id/8091016-M.jpg",
    infoLink: "https://openlibrary.org/works/OL8193W",
    prompt: DISCUSSION_PROMPTS[0],
    year: "1813",
    iaId: "prideandprejudic00austuoft",
    ebookAccess: "public",
    isbn: null,
    canReadFree: true,
  },
  {
    id: "/works/OL52122W",
    title: "The Secret Garden",
    authors: "Frances Hodgson Burnett",
    description: "A lonely child finds friendship and a hidden garden.",
    thumbnail: "https://covers.openlibrary.org/b/id/8231856-M.jpg",
    infoLink: "https://openlibrary.org/works/OL52122W",
    prompt: DISCUSSION_PROMPTS[1],
    year: "1911",
    iaId: "secretgarden00burnuoft",
    ebookAccess: "public",
    isbn: null,
    canReadFree: true,
  },
  {
    id: "/works/OL46886W",
    title: "Anne of Green Gables",
    authors: "L. M. Montgomery",
    description:
      "Warm adventures of an imaginative girl on Prince Edward Island.",
    thumbnail: "https://covers.openlibrary.org/b/id/8231991-M.jpg",
    infoLink: "https://openlibrary.org/works/OL46886W",
    prompt: DISCUSSION_PROMPTS[2],
    year: "1908",
    iaId: "anneofgreengable00montuoft",
    ebookAccess: "public",
    isbn: null,
    canReadFree: true,
  },
];

const SEARCH_FIELDS =
  "key,title,author_name,cover_i,first_publish_year,first_sentence,subtitle,ia,ebook_access,isbn,has_fulltext,public_scan_b";

async function fetchOpenLibrary(
  params: Record<string, string>,
): Promise<BookItem[]> {
  const url = new URL("https://openlibrary.org/search.json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("fields", SEARCH_FIELDS);
  url.searchParams.set("limit", params.limit || "12");

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(15000),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return [];

  const data = (await response.json()) as { docs?: OpenLibraryDoc[] };
  return (data.docs || [])
    .map((doc, index) => mapDoc(doc, index))
    .filter((book): book is BookItem => book !== null);
}

/** Open Library search — free, no API key required. */
export async function searchBooks(
  query: string,
  options?: { freeOnly?: boolean },
): Promise<BookItem[]> {
  const q = query.trim() || (options?.freeOnly ? "classic literature" : "classic novels");

  try {
    const params: Record<string, string> = {
      q,
      limit: "12",
    };
    if (options?.freeOnly) {
      params.ebook_access = "public";
      params.has_fulltext = "true";
    }

    const books = await fetchOpenLibrary(params);
    if (books.length > 0) return books;
    return options?.freeOnly
      ? FALLBACK_BOOKS.filter((book) => book.canReadFree)
      : FALLBACK_BOOKS;
  } catch {
    return options?.freeOnly
      ? FALLBACK_BOOKS.filter((book) => book.canReadFree)
      : FALLBACK_BOOKS;
  }
}

/** Curated free public-domain / full-access titles for instant reading. */
export async function getFreePublicDomainBooks(): Promise<BookItem[]> {
  try {
    const books = await fetchOpenLibrary({
      q: "subject:Fiction language:eng",
      ebook_access: "public",
      has_fulltext: "true",
      limit: "10",
    });
    const readable = books.filter((book) => book.canReadFree && book.iaId);
    return readable.length > 0 ? readable : FALLBACK_BOOKS.filter((b) => b.canReadFree);
  } catch {
    return FALLBACK_BOOKS.filter((book) => book.canReadFree);
  }
}

/**
 * Resolve a downloadable EPUB URL for an Internet Archive item.
 * Prefer *.epub files listed in IA metadata.
 */
export async function resolveEpubUrl(iaId: string): Promise<string | null> {
  const id = iaId.trim();
  if (!id) return null;

  try {
    const response = await fetch(`https://archive.org/metadata/${id}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      files?: Array<{ name?: string; format?: string }>;
    };
    const epub =
      data.files?.find(
        (file) =>
          file.name?.toLowerCase().endsWith(".epub") &&
          !file.name.toLowerCase().includes("_encrypted"),
      ) ||
      data.files?.find((file) =>
        (file.format || "").toLowerCase().includes("epub"),
      );
    if (epub?.name) {
      return `https://archive.org/download/${id}/${encodeURIComponent(epub.name)}`;
    }
  } catch {
    // fall through to guess
  }

  return `https://archive.org/download/${id}/${id}.epub`;
}

export function librarySearchUrl(options: {
  title: string;
  authors: string;
  isbn?: string | null;
  libraryCatalogUrl?: string;
  city?: string;
}): string {
  const catalog = options.libraryCatalogUrl?.trim();
  const query = options.isbn
    ? options.isbn
    : `${options.title} ${options.authors}`.trim();

  if (catalog) {
    const base = catalog.includes("?") ? `${catalog}&` : `${catalog}${catalog.endsWith("/") ? "" : "/"}?`;
    // Many catalogs accept q= — WorldCat and generic search forms work with this pattern.
    if (catalog.includes("worldcat.org")) {
      return `https://www.worldcat.org/search?q=${encodeURIComponent(query)}`;
    }
    try {
      const url = new URL(catalog);
      url.searchParams.set("q", query);
      return url.toString();
    } catch {
      return `${base}q=${encodeURIComponent(query)}`;
    }
  }

  const place = options.city?.trim() || "library";
  return `https://duckduckgo.com/?q=${encodeURIComponent(
    `${options.title} ${options.authors} reserve borrow ${place} library`,
  )}`;
}
