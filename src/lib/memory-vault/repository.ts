import { createBrowserClient } from "@/lib/supabase/client";
import {
  applyVaultUpdate,
  createVaultEntry,
  loadVaultEntriesLocal,
  saveVaultEntriesLocal,
  sortVaultEntries,
} from "@/lib/memory-vault/storage";
import {
  DEMO_VAULT_OWNER_ID,
  type VaultEntry,
  type VaultEntryDraft,
  type VaultEntryTypeId,
  type VaultEntryUpdate,
  type VaultSourceApp,
} from "@/lib/memory-vault/types";

type DbRow = {
  id: string;
  owner_id: string;
  entry_type: string;
  title: string;
  body: string;
  media_url: string | null;
  contributed_by: string;
  source_app: string;
  created_at: string;
  updated_at: string;
};

function rowToEntry(row: DbRow): VaultEntry {
  return {
    id: row.id,
    ownerId: row.owner_id,
    type: row.entry_type as VaultEntryTypeId,
    title: row.title,
    body: row.body,
    mediaUrl: row.media_url,
    contributedBy: row.contributed_by,
    sourceApp: row.source_app as VaultSourceApp,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function entryToRow(entry: VaultEntry): DbRow {
  return {
    id: entry.id,
    owner_id: entry.ownerId,
    entry_type: entry.type,
    title: entry.title,
    body: entry.body,
    media_url: entry.mediaUrl,
    contributed_by: entry.contributedBy,
    source_app: entry.sourceApp,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  };
}

/**
 * Shared Memory Vault repository.
 * Both the main ROF app and the family portal should use the same
 * `memory_vault_entries` table (keyed by owner_id) so data stays in sync.
 * Falls back to localStorage when Supabase is not configured.
 */
export async function fetchVaultEntries(
  ownerId = DEMO_VAULT_OWNER_ID,
): Promise<{ entries: VaultEntry[]; source: "supabase" | "local" }> {
  const supabase = createBrowserClient();
  if (!supabase) {
    return { entries: loadVaultEntriesLocal(), source: "local" };
  }

  const { data, error } = await supabase
    .from("memory_vault_entries")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return { entries: loadVaultEntriesLocal(), source: "local" };
  }

  const entries = sortVaultEntries((data as DbRow[]).map(rowToEntry));
  saveVaultEntriesLocal(entries);
  return { entries, source: "supabase" };
}

export async function persistVaultEntries(
  entries: VaultEntry[],
  ownerId = DEMO_VAULT_OWNER_ID,
): Promise<"supabase" | "local"> {
  saveVaultEntriesLocal(entries);

  const supabase = createBrowserClient();
  if (!supabase) return "local";

  const rows = entries
    .filter((entry) => entry.ownerId === ownerId)
    .map(entryToRow);

  const { error } = await supabase.from("memory_vault_entries").upsert(rows, {
    onConflict: "id",
  });

  return error ? "local" : "supabase";
}

export async function addVaultEntryRemote(
  draft: VaultEntryDraft,
  ownerId = DEMO_VAULT_OWNER_ID,
): Promise<VaultEntry> {
  const entry = createVaultEntry(draft, ownerId);
  const local = sortVaultEntries([entry, ...loadVaultEntriesLocal()]);
  saveVaultEntriesLocal(local);

  const supabase = createBrowserClient();
  if (supabase) {
    await supabase.from("memory_vault_entries").upsert(entryToRow(entry), {
      onConflict: "id",
    });
  }

  return entry;
}

export async function updateVaultEntryRemote(
  id: string,
  update: VaultEntryUpdate,
): Promise<VaultEntry | null> {
  const local = loadVaultEntriesLocal();
  const current = local.find((entry) => entry.id === id);
  if (!current) return null;

  const next = applyVaultUpdate(current, update);
  const updated = sortVaultEntries(
    local.map((entry) => (entry.id === id ? next : entry)),
  );
  saveVaultEntriesLocal(updated);

  const supabase = createBrowserClient();
  if (supabase) {
    await supabase
      .from("memory_vault_entries")
      .update(entryToRow(next))
      .eq("id", id);
  }

  return next;
}
