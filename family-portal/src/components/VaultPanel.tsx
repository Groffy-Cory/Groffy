"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { VaultEntry } from "@/lib/types";
import { fetchVaultEntries } from "@/lib/vault";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function VaultPanel() {
  const { activeOwnerId, activeLovedOne } = useAuth();
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!activeOwnerId) {
        setEntries([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const next = await fetchVaultEntries(activeOwnerId);
      if (cancelled) return;
      setEntries(next);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeOwnerId]);

  return (
    <section className="fp-card p-5 sm:p-6">
      <h2
        className="text-3xl font-semibold"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        Memory Vault
      </h2>
      <p className="mt-2 text-lg font-semibold text-[color:var(--muted)]">
        Shared memories for {activeLovedOne?.ownerName || "your loved one"}.
      </p>

      {loading ? (
        <p className="mt-5 text-lg font-semibold text-[color:var(--muted)]">
          Loading…
        </p>
      ) : null}
      {error ? (
        <p className="mt-5 text-lg font-bold text-[color:var(--danger)]">{error}</p>
      ) : null}

      {!loading && entries.length === 0 ? (
        <p className="fp-inset mt-5 p-4 text-lg font-semibold text-[color:var(--muted)]">
          No memories yet. Add a story, photo, or voice note to get started.
        </p>
      ) : null}

      <ul className="mt-5 space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="fp-inset p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xl font-bold">{entry.title}</p>
              <span className="rounded-full border-2 border-[color:var(--border)] px-3 py-1 text-sm font-bold uppercase tracking-wide text-[color:var(--muted)]">
                {entry.type.replace("_", " ")}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold whitespace-pre-wrap">
              {entry.body}
            </p>
            {entry.mediaUrl && entry.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.mediaUrl}
                alt={entry.title}
                className="mt-3 max-h-72 w-full rounded-xl object-cover"
              />
            ) : null}
            {entry.mediaUrl && entry.type === "voice" ? (
              <audio controls src={entry.mediaUrl} className="mt-3 w-full">
                Your browser does not support audio.
              </audio>
            ) : null}
            <p className="mt-3 text-base font-semibold text-[color:var(--muted)]">
              From {entry.contributedBy} · {formatWhen(entry.updatedAt)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
