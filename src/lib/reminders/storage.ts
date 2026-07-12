import {
  REMINDERS_STORAGE_KEY,
  type Reminder,
  type ReminderInput,
} from "@/lib/reminders/types";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `reminder-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isReminder(value: unknown): value is Reminder {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Reminder>;
  return (
    typeof item.id === "string" &&
    typeof item.category === "string" &&
    typeof item.title === "string" &&
    typeof item.time === "string" &&
    (item.date === null || typeof item.date === "string") &&
    typeof item.notes === "string" &&
    typeof item.completed === "boolean"
  );
}

export function loadReminders(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isReminder);
  } catch {
    return [];
  }
}

export function saveReminders(reminders: Reminder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
}

export function createReminder(input: ReminderInput): Reminder {
  const now = new Date().toISOString();
  return {
    id: createId(),
    category: input.category,
    title: input.title.trim(),
    time: input.time,
    date: input.date,
    notes: input.notes.trim(),
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function sortReminders(reminders: Reminder[]): Reminder[] {
  return [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aKey = `${a.date || "9999-99-99"}T${a.time}`;
    const bKey = `${b.date || "9999-99-99"}T${b.time}`;
    return aKey.localeCompare(bKey);
  });
}

export function getUpcomingReminders(
  reminders: Reminder[],
  limit = 5,
): Reminder[] {
  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return sortReminders(reminders)
    .filter((reminder) => {
      if (reminder.completed) return false;
      if (!reminder.date) return true;
      return reminder.date >= todayKey;
    })
    .slice(0, limit);
}

export function formatReminderWhen(reminder: Reminder): string {
  const timeLabel = formatTimeLabel(reminder.time);
  if (!reminder.date) return `Today or soon · ${timeLabel}`;
  const date = new Date(`${reminder.date}T12:00:00`);
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${dateLabel} · ${timeLabel}`;
}

export function formatTimeLabel(time: string): string {
  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
