"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createReminder,
  getUpcomingReminders,
  loadReminders,
  saveReminders,
  sortReminders,
} from "@/lib/reminders/storage";
import type {
  Reminder,
  ReminderCategoryId,
  ReminderInput,
} from "@/lib/reminders/types";

type RemindersContextValue = {
  reminders: Reminder[];
  upcoming: Reminder[];
  upcomingCount: number;
  isOpen: boolean;
  activeCategory: ReminderCategoryId;
  openReminders: (category?: ReminderCategoryId) => void;
  closeReminders: () => void;
  setActiveCategory: (category: ReminderCategoryId) => void;
  addReminder: (input: ReminderInput) => void;
  updateReminder: (id: string, input: ReminderInput) => void;
  toggleCompleted: (id: string) => void;
  deleteReminder: (id: string) => void;
};

const RemindersContext = createContext<RemindersContextValue | null>(null);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<ReminderCategoryId>("medications");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReminders(sortReminders(loadReminders()));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveReminders(reminders);
  }, [reminders, ready]);

  const openReminders = useCallback((category?: ReminderCategoryId) => {
    if (category) setActiveCategory(category);
    setIsOpen(true);
  }, []);

  const closeReminders = useCallback(() => setIsOpen(false), []);

  const addReminder = useCallback((input: ReminderInput) => {
    setReminders((prev) => sortReminders([createReminder(input), ...prev]));
  }, []);

  const updateReminder = useCallback((id: string, input: ReminderInput) => {
    setReminders((prev) =>
      sortReminders(
        prev.map((reminder) =>
          reminder.id === id
            ? {
                ...reminder,
                ...input,
                title: input.title.trim(),
                notes: input.notes.trim(),
                updatedAt: new Date().toISOString(),
              }
            : reminder,
        ),
      ),
    );
  }, []);

  const toggleCompleted = useCallback((id: string) => {
    setReminders((prev) =>
      sortReminders(
        prev.map((reminder) =>
          reminder.id === id
            ? {
                ...reminder,
                completed: !reminder.completed,
                updatedAt: new Date().toISOString(),
              }
            : reminder,
        ),
      ),
    );
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  }, []);

  const upcoming = useMemo(
    () => getUpcomingReminders(reminders, 5),
    [reminders],
  );

  const value = useMemo(
    () => ({
      reminders,
      upcoming,
      upcomingCount: upcoming.length,
      isOpen,
      activeCategory,
      openReminders,
      closeReminders,
      setActiveCategory,
      addReminder,
      updateReminder,
      toggleCompleted,
      deleteReminder,
    }),
    [
      reminders,
      upcoming,
      isOpen,
      activeCategory,
      openReminders,
      closeReminders,
      addReminder,
      updateReminder,
      toggleCompleted,
      deleteReminder,
    ],
  );

  return (
    <RemindersContext.Provider value={value}>
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error("useReminders must be used within RemindersProvider");
  }
  return context;
}
