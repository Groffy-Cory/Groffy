"use client";

import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { useReminders } from "@/components/reminders/RemindersProvider";
import { formatReminderWhen } from "@/lib/reminders/storage";
import { getCategoryLabel } from "@/lib/reminders/types";

export function UpcomingReminders() {
  const { upcoming, upcomingCount, openReminders } = useReminders();
  const { prefs } = usePreferences();
  const notificationsOn = prefs.remindersNotificationsEnabled;

  if (!notificationsOn) {
    return (
      <section
        className="border-b-2 border-steel-200 px-4 py-4"
        aria-labelledby="upcoming-reminders-heading"
      >
        <h3
          id="upcoming-reminders-heading"
          className="font-display text-lg font-semibold text-ink"
        >
          Coming up
        </h3>
        <p className="mt-2 text-sm font-semibold text-muted">
          Reminder notifications are off. Turn them on in Settings.
        </p>
      </section>
    );
  }

  return (
    <section
      className="border-b-2 border-steel-200 px-4 py-4"
      aria-labelledby="upcoming-reminders-heading"
    >
      <div className="flex items-center justify-between gap-2">
        <h3
          id="upcoming-reminders-heading"
          className="font-display text-lg font-semibold text-ink"
        >
          Coming up
        </h3>
        {upcomingCount > 0 ? (
          <span
            className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full bg-royal px-2 text-sm font-bold text-white"
            aria-label={`${upcomingCount} upcoming reminders`}
          >
            {upcomingCount}
          </span>
        ) : null}
      </div>

      {upcoming.length === 0 ? (
        <p className="mt-2 text-sm font-semibold text-muted">
          No upcoming reminders. Tap Reminders to add one.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {upcoming.slice(0, 3).map((reminder) => (
            <li key={reminder.id}>
              <button
                type="button"
                onClick={() => openReminders(reminder.category)}
                className="w-full rounded-xl border-2 border-steel-200 bg-[var(--surface-raised)] px-3 py-2 text-left hover:border-royal focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-royal"
              >
                <p className="text-sm font-bold text-ink">{reminder.title}</p>
                <p className="text-xs font-semibold text-muted">
                  {getCategoryLabel(reminder.category)} ·{" "}
                  {formatReminderWhen(reminder)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="rof-btn rof-btn-secondary mt-3 w-full min-h-11 text-sm"
        onClick={() => openReminders()}
      >
        Open Reminders
      </button>
    </section>
  );
}
