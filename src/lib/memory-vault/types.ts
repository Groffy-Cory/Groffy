export const VAULT_ENTRY_TYPES = [
  {
    id: "story",
    label: "Legacy story",
    shortLabel: "Story",
  },
  {
    id: "photo",
    label: "Photo memory",
    shortLabel: "Photo",
  },
  {
    id: "voice",
    label: "Voice note",
    shortLabel: "Voice",
  },
  {
    id: "family_message",
    label: "Family message",
    shortLabel: "Family",
  },
] as const;

export type VaultEntryTypeId = (typeof VAULT_ENTRY_TYPES)[number]["id"];

export type VaultSourceApp = "rof" | "family_portal";

export type VaultEntry = {
  id: string;
  /** Loved one / senior this vault belongs to — shared across ROF + family portal */
  ownerId: string;
  type: VaultEntryTypeId;
  title: string;
  body: string;
  /** Optional photo or voice media URL (Supabase Storage later) */
  mediaUrl: string | null;
  contributedBy: string;
  sourceApp: VaultSourceApp;
  createdAt: string;
  updatedAt: string;
};

export type VaultEntryDraft = {
  type: VaultEntryTypeId;
  title: string;
  body: string;
  mediaUrl?: string | null;
  contributedBy?: string;
  sourceApp?: VaultSourceApp;
};

export type VaultEntryUpdate = {
  title: string;
  body: string;
  type?: VaultEntryTypeId;
  mediaUrl?: string | null;
};

export const VAULT_STORAGE_KEY = "rof-memory-vault-v1";
/** Shared demo owner id — same value used by family portal when pointing at this vault */
export const DEMO_VAULT_OWNER_ID = "local-demo-user";

export function getEntryTypeLabel(type: VaultEntryTypeId): string {
  return (
    VAULT_ENTRY_TYPES.find((item) => item.id === type)?.label ?? "Memory"
  );
}

export function getEntryTypeShortLabel(type: VaultEntryTypeId): string {
  return (
    VAULT_ENTRY_TYPES.find((item) => item.id === type)?.shortLabel ?? "Memory"
  );
}
