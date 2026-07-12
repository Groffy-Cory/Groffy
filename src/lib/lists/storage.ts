import { SAMPLE_LISTS } from "@/lib/lists/sample-data";
import {
  DEMO_LISTS_USER_ID,
  LISTS_STORAGE_KEY,
  type ListItem,
  type ListItemDraft,
  type ListItemUpdate,
  type ListKindId,
  type RofList,
} from "@/lib/lists/types";

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isListItem(value: unknown): value is ListItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ListItem>;
  return (
    typeof item.id === "string" &&
    typeof item.text === "string" &&
    typeof item.completed === "boolean" &&
    (item.reminderTime === null || typeof item.reminderTime === "string") &&
    typeof item.notes === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

function isRofList(value: unknown): value is RofList {
  if (!value || typeof value !== "object") return false;
  const list = value as Partial<RofList>;
  return (
    typeof list.id === "string" &&
    typeof list.userId === "string" &&
    typeof list.kind === "string" &&
    typeof list.title === "string" &&
    Array.isArray(list.items) &&
    list.items.every(isListItem) &&
    typeof list.createdAt === "string" &&
    typeof list.updatedAt === "string"
  );
}

export function loadListsLocal(): RofList[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LISTS_STORAGE_KEY);
    if (!raw) {
      saveListsLocal(SAMPLE_LISTS);
      return SAMPLE_LISTS;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return SAMPLE_LISTS;
    const lists = parsed.filter(isRofList);
    return lists.length > 0 ? sortLists(lists) : SAMPLE_LISTS;
  } catch {
    return SAMPLE_LISTS;
  }
}

export function saveListsLocal(lists: RofList[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
}

export function sortLists(lists: RofList[]): RofList[] {
  return [...lists].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function createList(
  kind: ListKindId,
  title: string,
  userId = DEMO_LISTS_USER_ID,
): RofList {
  const now = new Date().toISOString();
  return {
    id: createId("list"),
    userId,
    kind,
    title: title.trim() || defaultTitleForKind(kind),
    items: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function defaultTitleForKind(kind: ListKindId): string {
  if (kind === "grocery") return "Grocery list";
  if (kind === "coupons") return "Coupon list";
  if (kind === "todo") return "To-do list";
  return "My list";
}

export function createListItem(draft: ListItemDraft): ListItem {
  const now = new Date().toISOString();
  return {
    id: createId("item"),
    text: draft.text.trim(),
    completed: false,
    reminderTime: draft.reminderTime ?? null,
    notes: draft.notes?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
  };
}

export function applyItemUpdate(
  item: ListItem,
  update: ListItemUpdate,
): ListItem {
  return {
    ...item,
    text: update.text !== undefined ? update.text.trim() : item.text,
    completed:
      update.completed !== undefined ? update.completed : item.completed,
    reminderTime:
      update.reminderTime !== undefined
        ? update.reminderTime
        : item.reminderTime,
    notes: update.notes !== undefined ? update.notes.trim() : item.notes,
    updatedAt: new Date().toISOString(),
  };
}

export function touchList(list: RofList, items: ListItem[]): RofList {
  return {
    ...list,
    items,
    updatedAt: new Date().toISOString(),
  };
}

export function formatReminderTime(time: string | null): string | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function openItemCount(list: RofList): number {
  return list.items.filter((item) => !item.completed).length;
}
