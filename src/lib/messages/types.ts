export const MESSAGE_SOURCES = [
  {
    id: "family",
    label: "From Family",
    shortLabel: "Family",
    hint: "Notes from realfamilystories.com",
  },
  {
    id: "doctor",
    label: "From Doctor",
    shortLabel: "Doctor",
    hint: "Notes from your doctor or caregiver",
  },
  {
    id: "personal",
    label: "My Notes",
    shortLabel: "Mine",
    hint: "Notes you write for yourself",
  },
  {
    id: "group",
    label: "Family Group",
    shortLabel: "Group",
    hint: "Family group chat (coming soon)",
  },
] as const;

export type MessageSourceId = (typeof MESSAGE_SOURCES)[number]["id"];

export type Message = {
  id: string;
  userId: string;
  source: MessageSourceId;
  sender: string;
  body: string;
  createdAt: string;
  read: boolean;
  /** Optional parent for replies in a thread */
  replyToId: string | null;
};

export type MessageDraft = {
  source: MessageSourceId;
  sender: string;
  body: string;
  replyToId?: string | null;
};

export const MESSAGES_STORAGE_KEY = "rof-messages-v1";
export const DEMO_USER_ID = "local-demo-user";

export function getSourceLabel(source: MessageSourceId): string {
  return (
    MESSAGE_SOURCES.find((item) => item.id === source)?.label ?? "Message"
  );
}

export function getSourceShortLabel(source: MessageSourceId): string {
  return (
    MESSAGE_SOURCES.find((item) => item.id === source)?.shortLabel ?? "Message"
  );
}
