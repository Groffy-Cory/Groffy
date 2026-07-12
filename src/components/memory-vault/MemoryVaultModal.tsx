"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMemoryVault } from "@/components/memory-vault/MemoryVaultProvider";
import {
  formatVaultDate,
  previewText,
} from "@/lib/memory-vault/storage";
import {
  VAULT_ENTRY_TYPES,
  getEntryTypeLabel,
  getEntryTypeShortLabel,
  type VaultEntry,
  type VaultEntryTypeId,
} from "@/lib/memory-vault/types";

type View =
  | { mode: "list"; filter: VaultEntryTypeId | "all" }
  | { mode: "detail"; entryId: string }
  | { mode: "edit"; entryId: string }
  | { mode: "compose" };

export function MemoryVaultModal() {
  const {
    isOpen,
    closeVault,
    entries,
    syncSource,
    addEntry,
    updateEntry,
    getEntry,
  } = useMemoryVault();

  const [view, setView] = useState<View>({ mode: "list", filter: "all" });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [entryType, setEntryType] = useState<VaultEntryTypeId>("story");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setView({ mode: "list", filter: "all" });
    setTitle("");
    setBody("");
    setEntryType("story");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeVault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeVault]);

  const listEntries = useMemo(() => {
    if (view.mode !== "list") return entries;
    if (view.filter === "all") return entries;
    return entries.filter((entry) => entry.type === view.filter);
  }, [entries, view]);

  if (!isOpen) return null;

  function openDetail(entry: VaultEntry) {
    setView({ mode: "detail", entryId: entry.id });
  }

  function startEdit(entry: VaultEntry) {
    setTitle(entry.title);
    setBody(entry.body);
    setEntryType(entry.type);
    setView({ mode: "edit", entryId: entry.id });
  }

  async function handleCompose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      const created = await addEntry({
        type: entryType,
        title,
        body,
        contributedBy: "You",
        sourceApp: "rof",
      });
      setTitle("");
      setBody("");
      setView({ mode: "detail", entryId: created.id });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (view.mode !== "edit" || !title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await updateEntry(view.entryId, {
        title,
        body,
        type: entryType,
      });
      setView({ mode: "detail", entryId: view.entryId });
    } finally {
      setSaving(false);
    }
  }

  const detailEntry =
    view.mode === "detail" || view.mode === "edit"
      ? getEntry(view.entryId)
      : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
      role="presentation"
      onClick={closeVault}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="memory-vault-title"
        className="rof-card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-steel-200 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="memory-vault-title"
              className="font-display text-3xl font-semibold text-ink"
            >
              Memory Vault
            </h2>
            <p className="mt-1 text-base font-semibold text-muted">
              Stories, photos, voice notes, and family messages — kept safe and
              shared.
            </p>
            <p className="mt-1 text-sm font-bold text-[color:var(--accent-gold,var(--royal-dark))]">
              {syncSource === "supabase"
                ? "Synced with Supabase (shared across ROF and family portal)"
                : syncSource === "loading"
                  ? "Loading vault…"
                  : "Local preview — connect Supabase to share across domains"}
            </p>
          </div>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={closeVault}
          >
            Close
          </button>
        </div>

        {view.mode === "list" ? (
          <>
            <div className="flex gap-2 overflow-x-auto border-b-2 border-steel-200 px-3 py-3 sm:px-4">
              <FilterChip
                label="All"
                active={view.filter === "all"}
                onClick={() => setView({ mode: "list", filter: "all" })}
              />
              {VAULT_ENTRY_TYPES.map((type) => (
                <FilterChip
                  key={type.id}
                  label={type.shortLabel}
                  active={view.filter === type.id}
                  onClick={() => setView({ mode: "list", filter: type.id })}
                />
              ))}
            </div>

            <div className="border-b-2 border-steel-200 px-4 py-3">
              <button
                type="button"
                className="rof-btn rof-btn-primary"
                onClick={() => {
                  setTitle("");
                  setBody("");
                  setEntryType("story");
                  setView({ mode: "compose" });
                }}
              >
                Add a memory
              </button>
            </div>

            <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {listEntries.length === 0 ? (
                <li className="rof-inset p-5 text-lg font-semibold text-muted">
                  No memories here yet. Add one, or wait for family to share.
                </li>
              ) : (
                listEntries.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(entry)}
                      className="rof-inset w-full p-4 text-left transition-colors hover:border-[color:var(--royal)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-royal"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[color:var(--accent-gold,var(--royal-dark))]">
                            {getEntryTypeLabel(entry.type)}
                          </p>
                          <p className="mt-1 text-xl font-bold text-ink">
                            {entry.title}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-muted">
                          {formatVaultDate(entry.updatedAt)}
                        </p>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-muted">
                        {previewText(entry.body)}
                      </p>
                      <p className="mt-2 text-sm font-bold text-muted">
                        From {entry.contributedBy}
                        {entry.sourceApp === "family_portal"
                          ? " · Family portal"
                          : ""}
                      </p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </>
        ) : null}

        {view.mode === "detail" && detailEntry ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b-2 border-steel-200 px-4 py-3">
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                onClick={() => setView({ mode: "list", filter: "all" })}
              >
                Back to list
              </button>
              <button
                type="button"
                className="rof-btn rof-btn-primary"
                onClick={() => startEdit(detailEntry)}
              >
                Edit this memory
              </button>
            </div>

            <article className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-[color:var(--accent-gold,var(--royal-dark))]">
                {getEntryTypeLabel(detailEntry.type)}
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-ink">
                {detailEntry.title}
              </h3>
              <p className="mt-2 text-base font-bold text-muted">
                {formatVaultDate(detailEntry.updatedAt)} · From{" "}
                {detailEntry.contributedBy}
              </p>
              <p className="mt-5 whitespace-pre-wrap text-xl font-semibold leading-relaxed text-ink">
                {detailEntry.body}
              </p>
              {detailEntry.mediaUrl ? (
                <p className="mt-4 text-base font-semibold text-muted">
                  Media: {detailEntry.mediaUrl}
                </p>
              ) : null}
            </article>
          </div>
        ) : null}

        {view.mode === "compose" || view.mode === "edit" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
            <button
              type="button"
              className="rof-btn rof-btn-secondary self-start"
              onClick={() =>
                view.mode === "edit"
                  ? setView({ mode: "detail", entryId: view.entryId })
                  : setView({ mode: "list", filter: "all" })
              }
            >
              Back
            </button>
            <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
              {view.mode === "edit" ? "Edit memory" : "Add a memory"}
            </h3>
            <form
              onSubmit={view.mode === "edit" ? handleSaveEdit : handleCompose}
              className="mt-4 space-y-4"
            >
              <div>
                <p className="mb-2 text-base font-bold text-ink">What kind?</p>
                <div className="flex flex-wrap gap-2">
                  {VAULT_ENTRY_TYPES.map((type) => (
                    <FilterChip
                      key={type.id}
                      label={getEntryTypeShortLabel(type.id)}
                      active={entryType === type.id}
                      onClick={() => setEntryType(type.id)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="vault-title"
                  className="mb-2 block text-base font-bold text-ink"
                >
                  Title
                </label>
                <input
                  id="vault-title"
                  className="rof-input text-lg"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Give this memory a clear title"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="vault-body"
                  className="mb-2 block text-base font-bold text-ink"
                >
                  The story
                </label>
                <textarea
                  id="vault-body"
                  className="rof-textarea min-h-[12rem] text-lg"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Write slowly. Every detail matters."
                  required
                />
              </div>
              <button
                type="submit"
                className="rof-btn rof-btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : view.mode === "edit"
                    ? "Save changes"
                    : "Save memory"}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rof-btn min-h-12 shrink-0 px-4",
        active ? "rof-btn-primary" : "rof-btn-secondary",
      ].join(" ")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
