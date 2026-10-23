"use client";

import { useState } from "react";

type Reminder = {
  id: string;
  title: string;
  due?: string;
  notes: string;
  done: boolean;
};

const SEED: Reminder[] = [
  {
    id: "1",
    title: "QAPI packet for Thursday",
    due: "2026-10-23",
    notes: "Confirm staffing variance narrative is attached.",
    done: false,
  },
  {
    id: "2",
    title: "Follow up on fall huddle action items",
    due: "2026-10-24",
    notes: "Two rooms still need lighting audit sign-off.",
    done: false,
  },
];

export function ImportantReminders() {
  const [items, setItems] = useState<Reminder[]>(SEED);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [notes, setNotes] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = items.find((i) => i.id === activeId) ?? null;

  function addReminder(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const item: Reminder = {
      id: `r-${Date.now()}`,
      title: t,
      due: due || undefined,
      notes: notes.trim(),
      done: false,
    };
    setItems((prev) => [item, ...prev]);
    setTitle("");
    setDue("");
    setNotes("");
    setActiveId(item.id);
  }

  return (
    <div className="don-card px-5 py-5 sm:px-6">
      <h2
        className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        Important Reminders
      </h2>
      <p className="mt-1 text-base font-semibold text-[color:var(--muted)]">
        Click a reminder to address it. Add time/date-sensitive items below.
      </p>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`w-full rounded-lg border px-4 py-3 text-left ${
                activeId === item.id
                  ? "border-[color:var(--royal)] bg-[color:var(--royal-soft)]/20"
                  : "border-[color:var(--steel)] bg-white/60"
              } ${item.done ? "opacity-60" : ""}`}
              onClick={() => setActiveId(item.id)}
            >
              <span className="block text-base font-bold text-[color:var(--burgundy-deep)]">
                {item.done ? "✓ " : ""}
                {item.title}
              </span>
              {item.due ? (
                <span className="mt-1 block text-sm font-semibold text-[color:var(--muted)]">
                  Due {item.due}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <div className="mt-4 rounded-lg border border-[color:var(--steel)] bg-white/70 p-4">
          <h3 className="text-lg font-bold text-[color:var(--burgundy-deep)]">
            {active.title}
          </h3>
          <p className="mt-2 text-base font-semibold text-[color:var(--ink-soft)]">
            {active.notes || "No notes yet."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="don-btn don-btn-primary text-sm"
              onClick={() =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === active.id ? { ...i, done: !i.done } : i,
                  ),
                )
              }
            >
              {active.done ? "Reopen" : "Mark addressed"}
            </button>
            <button
              type="button"
              className="don-btn don-btn-ghost text-sm"
              onClick={() => setActiveId(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <form className="mt-5 space-y-3 border-t border-[color:var(--steel)] pt-4" onSubmit={addReminder}>
        <h3 className="text-lg font-bold text-[color:var(--burgundy-deep)]">
          Add reminder
        </h3>
        <input
          className="don-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs attention?"
          aria-label="Reminder title"
        />
        <input
          className="don-input"
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          aria-label="Due date"
        />
        <textarea
          className="don-input don-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          aria-label="Reminder notes"
        />
        <button type="submit" className="don-btn don-btn-primary">
          Add Important Reminder
        </button>
      </form>
    </div>
  );
}
