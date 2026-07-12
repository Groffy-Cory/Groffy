import { SAMPLE_MESSAGES } from "@/lib/messages/sample-data";
import {
  DEMO_USER_ID,
  MESSAGES_STORAGE_KEY,
  type Message,
  type MessageDraft,
} from "@/lib/messages/types";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Message>;
  return (
    typeof item.id === "string" &&
    typeof item.userId === "string" &&
    typeof item.source === "string" &&
    typeof item.sender === "string" &&
    typeof item.body === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.read === "boolean"
  );
}

export function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!raw) {
      saveMessages(SAMPLE_MESSAGES);
      return SAMPLE_MESSAGES;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return SAMPLE_MESSAGES;
    const messages = parsed.filter(isMessage);
    return messages.length > 0 ? sortMessages(messages) : SAMPLE_MESSAGES;
  } catch {
    return SAMPLE_MESSAGES;
  }
}

export function saveMessages(messages: Message[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
}

export function createMessage(draft: MessageDraft, userId = DEMO_USER_ID): Message {
  return {
    id: createId(),
    userId,
    source: draft.source,
    sender: draft.sender.trim() || "You",
    body: draft.body.trim(),
    createdAt: new Date().toISOString(),
    read: true,
    replyToId: draft.replyToId ?? null,
  };
}

export function sortMessages(messages: Message[]): Message[] {
  return [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getUnreadCount(messages: Message[]): number {
  return messages.filter((message) => !message.read && message.source !== "personal")
    .length;
}

export function previewText(body: string, max = 90): string {
  const cleaned = body.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
