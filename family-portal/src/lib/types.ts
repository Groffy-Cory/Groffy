export type VaultEntryTypeId = "story" | "photo" | "voice" | "family_message";

export type VaultEntry = {
  id: string;
  ownerId: string;
  type: VaultEntryTypeId;
  title: string;
  body: string;
  mediaUrl: string | null;
  contributedBy: string;
  sourceApp: "family_portal";
  createdAt: string;
  updatedAt: string;
};

export type VaultEntryDraft = {
  type: VaultEntryTypeId;
  title: string;
  body: string;
  mediaUrl?: string | null;
  contributedBy: string;
};

export type FamilyLink = {
  ownerId: string;
  ownerName: string;
  ownerEmail: string | null;
  role: "family" | "caregiver";
};

export const ENTRY_TYPE_OPTIONS: Array<{
  id: VaultEntryTypeId;
  label: string;
  hint: string;
}> = [
  {
    id: "story",
    label: "Story",
    hint: "A memory or family story for them to enjoy",
  },
  {
    id: "photo",
    label: "Photo",
    hint: "Add a photo with a short caption",
  },
  {
    id: "voice",
    label: "Voice note",
    hint: "Record a short spoken message",
  },
  {
    id: "family_message",
    label: "Family note",
    hint: "A short note that also appears in their Messages",
  },
];

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `fp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
