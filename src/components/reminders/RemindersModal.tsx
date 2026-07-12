"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useExercises } from "@/components/exercises/ExercisesProvider";
import { useReminders } from "@/components/reminders/RemindersProvider";
import {
  formatReminderWhen,
  formatTimeLabel,
} from "@/lib/reminders/storage";
import {
  REMINDER_CATEGORIES,
  type Reminder,
  type ReminderCategoryId,
  type ReminderInput,
} from "@/lib/reminders/types";

const EMPTY_FORM: ReminderInput = {
  category: "medications",
  title: "",
  time: "09:00",
  date: null,
  notes: "",
};

export function RemindersModal() {
  const {
    isOpen,
    closeReminders,
    activeCategory,
    setActiveCategory,
    reminders,
    addReminder,
    updateReminder,
    toggleCompleted,
    deleteReminder,
  } = useReminders();
  const { openExercises } = useExercises();

  const [form, setForm] = useState<ReminderInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm((prev) => ({ ...prev, category: activeCategory }));
  }, [activeCategory, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeReminders();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeReminders]);

  const categoryReminders = useMemo(
    () => reminders.filter((reminder) => reminder.category === activeCategory),
    [reminders, activeCategory],
  );

  if (!isOpen) return null;

  function resetForm(category: ReminderCategoryId = activeCategory) {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category, time: "09:00" });
  }

  function startEdit(reminder: Reminder) {
    setEditingId(reminder.id);
    setActiveCategory(reminder.category);
    setForm({
      category: reminder.category,
      title: reminder.title,
      time: reminder.time,
      date: reminder.date,
      notes: reminder.notes,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) return;

    const payload: ReminderInput = {
      ...form,
      title: form.title.trim(),
      notes: form.notes.trim(),
      date: form.date || null,
    };

    if (editingId) {
      updateReminder(editingId, payload);
    } else {
      addReminder(payload);
    }
    resetForm(payload.category);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
      role="presentation"
      onClick={closeReminders}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminders-title"
        className="rof-card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-steel-200 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="reminders-title"
              className="font-display text-3xl font-semibold text-ink"
            >
              Reminders
            </h2>
            <p className="mt-1 text-base font-semibold text-muted">
              Medications, appointments, calls, chores, and errands — each with
              a time reminder.
            </p>
            <button
              type="button"
              className="rof-btn rof-btn-primary mt-4 min-h-14 text-lg"
              onClick={() => openExercises()}
            >
              Exercises / Home Therapy
            </button>
          </div>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={closeReminders}
          >
            Close
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b-2 border-steel-200 px-3 py-3 sm:px-4">
          {REMINDER_CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            const count = reminders.filter(
              (reminder) =>
                reminder.category === category.id && !reminder.completed,
            ).length;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setActiveCategory(category.id);
                  if (!editingId) {
                    setForm((prev) => ({ ...prev, category: category.id }));
                  }
                }}
                className={[
                  "rof-btn min-h-14 shrink-0 px-4",
                  isActive ? "rof-btn-primary" : "rof-btn-secondary",
                ].join(" ")}
                aria-pressed={isActive}
              >
                {category.label}
                {count > 0 ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section aria-labelledby="reminder-form-heading">
            <h3
              id="reminder-form-heading"
              className="font-display text-2xl font-semibold text-ink"
            >
              {editingId ? "Edit reminder" : "Add a reminder"}
            </h3>
            <p className="mt-1 text-base font-semibold text-muted">
              {
                REMINDER_CATEGORIES.find((item) => item.id === activeCategory)
                  ?.hint
              }
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="reminder-title"
                  className="mb-2 block text-base font-bold text-ink"
                >
                  What is it?
                </label>
                <input
                  id="reminder-title"
                  className="rof-input text-lg"
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Example: Take blood pressure pill"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="reminder-time"
                    className="mb-2 block text-base font-bold text-ink"
                  >
                    What time?
                  </label>
                  <input
                    id="reminder-time"
                    type="time"
                    className="rof-input text-lg"
                    value={form.time}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, time: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="reminder-date"
                    className="mb-2 block text-base font-bold text-ink"
                  >
                    Date (optional)
                  </label>
                  <input
                    id="reminder-date"
                    type="date"
                    className="rof-input text-lg"
                    value={form.date ?? ""}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        date: event.target.value || null,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reminder-notes"
                  className="mb-2 block text-base font-bold text-ink"
                >
                  Notes (optional)
                </label>
                <textarea
                  id="reminder-notes"
                  className="rof-textarea text-lg"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  placeholder="Any helpful details"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rof-btn rof-btn-primary">
                  {editingId ? "Save changes" : "Add reminder"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    className="rof-btn rof-btn-secondary"
                    onClick={() => resetForm()}
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section aria-labelledby="reminder-list-heading">
            <h3
              id="reminder-list-heading"
              className="font-display text-2xl font-semibold text-ink"
            >
              Your list
            </h3>
            <p className="mt-1 text-base font-semibold text-muted">
              Tap Done when finished.
            </p>

            <ul className="mt-4 space-y-3">
              {categoryReminders.length === 0 ? (
                <li className="rof-inset p-4 text-base font-semibold text-muted">
                  No reminders here yet. Add one on the left.
                </li>
              ) : (
                categoryReminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className={[
                      "rof-inset p-4",
                      reminder.completed ? "opacity-70" : "",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className={[
                            "text-xl font-bold text-ink",
                            reminder.completed ? "line-through" : "",
                          ].join(" ")}
                        >
                          {reminder.title}
                        </p>
                        <p className="mt-1 text-base font-semibold text-muted">
                          {formatReminderWhen(reminder)}
                        </p>
                        {reminder.notes ? (
                          <p className="mt-2 text-base font-semibold text-ink">
                            {reminder.notes}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className={[
                          "rof-btn min-h-12",
                          reminder.completed
                            ? "rof-btn-secondary"
                            : "rof-btn-primary",
                        ].join(" ")}
                        onClick={() => toggleCompleted(reminder.id)}
                        aria-pressed={reminder.completed}
                      >
                        {reminder.completed ? "Not done" : "Done"}
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rof-btn rof-btn-secondary min-h-11 px-3 text-sm"
                        onClick={() => startEdit(reminder)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rof-btn min-h-11 border-2 border-[color:var(--royal)] px-3 text-sm font-bold text-[color:var(--royal-dark)]"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete “${reminder.title}”? This cannot be undone.`,
                            )
                          ) {
                            deleteReminder(reminder.id);
                            if (editingId === reminder.id) resetForm();
                          }
                        }}
                      >
                        Delete
                      </button>
                      <span className="self-center text-sm font-bold text-muted">
                        {formatTimeLabel(reminder.time)}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
