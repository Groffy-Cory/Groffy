"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { searchSite } from "@/lib/site-search";

type SiteSearchProps = {
  id: string;
  placeholder?: string;
  compact?: boolean;
  /** Prefill from URL ?q= */
  initialQuery?: string;
  onLocalFilter?: (query: string) => void;
};

export function SiteSearch({
  id,
  placeholder = "Search The DON Eye…",
  compact = false,
  initialQuery = "",
  onLocalFilter,
}: SiteSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const hits = useMemo(() => searchSite(query), [query]);

  return (
    <div className={`relative ${compact ? "w-full max-w-xs" : "w-full"}`}>
      <label htmlFor={id} className="sr-only">
        Site search
      </label>
      <input
        id={id}
        className="don-input"
        style={
          compact
            ? { minHeight: "2.5rem", fontSize: "0.95rem", background: "#fffdf8" }
            : undefined
        }
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          setOpen(true);
          onLocalFilter?.(v);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && query.trim() && hits.length > 0 ? (
        <ul className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-lg border-2 border-[color:var(--steel)] bg-[color:var(--parchment)] shadow-lg">
          {hits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left hover:bg-white/70"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  onLocalFilter?.("");
                  router.push(hit.href);
                }}
              >
                <span className="don-kicker">{hit.group}</span>
                <span className="mt-0.5 block text-sm font-bold text-[color:var(--burgundy-deep)]">
                  {hit.title}
                </span>
                <span className="block truncate text-xs font-semibold text-[color:var(--muted)]">
                  {hit.blurb}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && query.trim() && hits.length === 0 ? (
        <p className="absolute z-40 mt-1 w-full rounded-lg border-2 border-[color:var(--steel)] bg-[color:var(--parchment)] px-3 py-2 text-sm font-semibold text-[color:var(--muted)]">
          No matches on this site.
        </p>
      ) : null}
    </div>
  );
}
