export const LIST_KINDS = [
  {
    id: "grocery",
    label: "Grocery list",
    shortLabel: "Grocery",
    hint: "Shopping items and recipe ideas",
  },
  {
    id: "coupons",
    label: "Coupon list",
    shortLabel: "Coupons",
    hint: "Coupons to use at the store",
  },
  {
    id: "todo",
    label: "To-do list",
    shortLabel: "To-do",
    hint: "Things to get done",
  },
  {
    id: "custom",
    label: "My lists",
    shortLabel: "Custom",
    hint: "Any list you want to keep",
  },
] as const;

export type ListKindId = (typeof LIST_KINDS)[number]["id"];

export type ListItem = {
  id: string;
  text: string;
  completed: boolean;
  /** Optional daily reminder time as HH:MM (24h) */
  reminderTime: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type RofList = {
  id: string;
  userId: string;
  kind: ListKindId;
  title: string;
  items: ListItem[];
  createdAt: string;
  updatedAt: string;
};

export type ListItemDraft = {
  text: string;
  reminderTime?: string | null;
  notes?: string;
};

export type ListItemUpdate = {
  text?: string;
  completed?: boolean;
  reminderTime?: string | null;
  notes?: string;
};

export const LISTS_STORAGE_KEY = "rof-lists-v1";
export const DEMO_LISTS_USER_ID = "local-demo-user";

export function getListKindLabel(kind: ListKindId): string {
  return LIST_KINDS.find((item) => item.id === kind)?.label ?? "List";
}

export function getListKindShortLabel(kind: ListKindId): string {
  return LIST_KINDS.find((item) => item.id === kind)?.shortLabel ?? "List";
}
