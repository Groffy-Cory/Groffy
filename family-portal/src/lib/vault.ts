import { createBrowserClient } from "@/lib/supabase/client";
import {
  createId,
  type FamilyLink,
  type VaultEntry,
  type VaultEntryDraft,
  type VaultEntryTypeId,
} from "@/lib/types";

type VaultRow = {
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

type AccessRow = {
  owner_id: string;
  family_user_id: string;
  role: "family" | "caregiver";
};

type ProfileRow = {
  id: string;
  display_name: string;
  email: string | null;
};

function rowToEntry(row: VaultRow): VaultEntry {
  return {
    id: row.id,
    ownerId: row.owner_id,
    type: row.entry_type as VaultEntryTypeId,
    title: row.title,
    body: row.body,
    mediaUrl: row.media_url,
    contributedBy: row.contributed_by,
    sourceApp: "family_portal",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function lookupSeniorByEmail(
  email: string,
): Promise<{ id: string; displayName: string; email: string | null } | null> {
  const supabase = createBrowserClient();
  if (!supabase) return null;

  const cleaned = email.trim().toLowerCase();
  if (!cleaned) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .ilike("email", cleaned)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as ProfileRow;
  return {
    id: row.id,
    displayName: row.display_name || "Loved one",
    email: row.email,
  };
}

export async function lookupSeniorById(
  ownerId: string,
): Promise<{ id: string; displayName: string; email: string | null } | null> {
  const supabase = createBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("id", ownerId.trim())
    .maybeSingle();

  if (error || !data) return null;
  const row = data as ProfileRow;
  return {
    id: row.id,
    displayName: row.display_name || "Loved one",
    email: row.email,
  };
}

export async function fetchFamilyLinks(
  familyUserId: string,
): Promise<FamilyLink[]> {
  const supabase = createBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("memory_vault_access")
    .select("owner_id, family_user_id, role")
    .eq("family_user_id", familyUserId);

  if (error || !data) return [];

  const links: FamilyLink[] = [];
  for (const row of data as AccessRow[]) {
    const profile = await lookupSeniorById(row.owner_id);
    links.push({
      ownerId: row.owner_id,
      ownerName: profile?.displayName || "Loved one",
      ownerEmail: profile?.email ?? null,
      role: row.role,
    });
  }
  return links;
}

export async function linkToLovedOne(params: {
  familyUserId: string;
  ownerId: string;
  role?: "family" | "caregiver";
}): Promise<string | null> {
  const supabase = createBrowserClient();
  if (!supabase) return "Supabase is not configured.";

  const { error } = await supabase.from("memory_vault_access").upsert(
    {
      owner_id: params.ownerId,
      family_user_id: params.familyUserId,
      role: params.role || "family",
    },
    { onConflict: "owner_id,family_user_id" },
  );

  return error?.message ?? null;
}

export async function fetchVaultEntries(
  ownerId: string,
): Promise<VaultEntry[]> {
  const supabase = createBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("memory_vault_entries")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return (data as VaultRow[]).map(rowToEntry);
}

export async function addVaultEntry(
  ownerId: string,
  draft: VaultEntryDraft,
): Promise<{ entry: VaultEntry | null; error: string | null }> {
  const supabase = createBrowserClient();
  if (!supabase) return { entry: null, error: "Supabase is not configured." };

  const now = new Date().toISOString();
  const entry: VaultEntry = {
    id: createId(),
    ownerId,
    type: draft.type,
    title: draft.title.trim(),
    body: draft.body.trim(),
    mediaUrl: draft.mediaUrl ?? null,
    contributedBy: draft.contributedBy.trim() || "Family",
    sourceApp: "family_portal",
    createdAt: now,
    updatedAt: now,
  };

  const { error } = await supabase.from("memory_vault_entries").upsert({
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
  });

  if (error) return { entry: null, error: error.message };
  return { entry, error: null };
}

export async function uploadFamilyMedia(params: {
  familyUserId: string;
  ownerId: string;
  file: Blob;
  fileName: string;
  contentType: string;
}): Promise<{ url: string | null; error: string | null }> {
  const supabase = createBrowserClient();
  if (!supabase) return { url: null, error: "Supabase is not configured." };

  const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${params.ownerId}/${params.familyUserId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from("family-media")
    .upload(path, params.file, {
      contentType: params.contentType,
      upsert: false,
    });

  if (error) {
    return {
      url: null,
      error:
        error.message.includes("Bucket not found")
          ? "Media storage isn’t set up yet. Run supabase/family-media-storage.sql, or paste a photo URL instead."
          : error.message,
    };
  }

  const { data } = supabase.storage.from("family-media").getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function sendFamilyMessage(params: {
  ownerId: string;
  sender: string;
  body: string;
}): Promise<string | null> {
  const supabase = createBrowserClient();
  if (!supabase) return "Supabase is not configured.";

  const { error } = await supabase.from("messages").insert({
    user_id: params.ownerId,
    source: "family",
    sender: params.sender.trim() || "Family",
    body: params.body.trim(),
    read: false,
    reply_to_id: null,
  });

  return error?.message ?? null;
}
