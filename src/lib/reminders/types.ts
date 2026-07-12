export const REMINDER_CATEGORIES = [
  { id: "medications", label: "Medications", hint: "Pills and medicine times" },
  { id: "appointments", label: "Appointments", hint: "Doctor, dentist, visits" },
  { id: "calls", label: "Calls", hint: "People to phone" },
  { id: "chores", label: "Chores", hint: "Things around the house" },
  { id: "errands", label: "Errands", hint: "Things to do while out" },
] as const;

export type ReminderCategoryId = (typeof REMINDER_CATEGORIES)[number]["id"];

export type Reminder = {
  id: string;
  category: ReminderCategoryId;
  title: string;
  time: string;
  date: string | null;
  notes: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReminderInput = {
  category: ReminderCategoryId;
  title: string;
  time: string;
  date: string | null;
  notes: string;
};

export const REMINDERS_STORAGE_KEY = "rof-reminders-v1";

export function getCategoryLabel(id: ReminderCategoryId): string {
  return (
    REMINDER_CATEGORIES.find((category) => category.id === id)?.label ?? id
  );
}
