import { SAMPLE_VAULT_ENTRIES } from "@/lib/memory-vault/sample-data";
import {
  DEMO_VAULT_OWNER_ID,
  VAULT_STORAGE_KEY,
  type VaultEntry,
  type VaultEntryDraft,
  type VaultEntryUpdate,
} from "@/lib/memory-vault/types";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `vault-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isVaultEntry(value: unknown): value is VaultEntry {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<VaultEntry>;
  return (
    typeof item.id === "string" &&
    typeof item.ownerId === "string" &&
    typeof item.type === "string" &&
    typeof item.title === "string" &&
    typeof item.body === "string" &&
    typeof item.contributedBy === "string" &&
    typeof item.sourceApp === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

export function loadVaultEntriesLocal(): VaultEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) {
      saveVaultEntriesLocal(SAMPLE_VAULT_ENTRIES);
      return SAMPLE_VAULT_ENTRIES;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return SAMPLE_VAULT_ENTRIES;
    const entries = parsed.filter(isVaultEntry);
    return entries.length > 0 ? sortVaultEntries(entries) : SAMPLE_VAULT_ENTRIES;
  } catch {
    return SAMPLE_VAULT_ENTRIES;
  }
}

export function saveVaultEntriesLocal(entries: VaultEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(entries));
}

export function createVaultEntry(
  draft: VaultEntryDraft,
  ownerId = DEMO_VAULT_OWNER_ID,
): VaultEntry {
  const now = new Date().toISOString();
  return {
    id: createId(),
    ownerId,
    type: draft.type,
    title: draft.title.trim() || "Untitled memory",
    body: draft.body.trim(),
    mediaUrl: draft.mediaUrl ?? null,
    contributedBy: draft.contributedBy?.trim() || "You",
    sourceApp: draft.sourceApp ?? "rof",
    createdAt: now,
    updatedAt: now,
  };
}

export function applyVaultUpdate(
  entry: VaultEntry,
  update: VaultEntryUpdate,
): VaultEntry {
  return {
    ...entry,
    title: update.title.trim() || entry.title,
    body: update.body.trim(),
    type: update.type ?? entry.type,
    mediaUrl:
      update.mediaUrl === undefined ? entry.mediaUrl : update.mediaUrl,
    updatedAt: new Date().toISOString(),
  };
}

export function sortVaultEntries(entries: VaultEntry[]): VaultEntry[] {
  return [...entries].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function previewText(body: string, max = 100): string {
  const cleaned = body.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

export function formatVaultDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
