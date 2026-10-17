/** Placeholder daily copy until Grok / CMS wiring lands. Rotates by calendar day. */

function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length]!;
}

export function formatLongDate(d = new Date()): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getFocusForDay(): string {
  const seed = daySeed();
  return pick(
    [
      "Protect one hour of uninterrupted work on your highest-value task.",
      "Finish what you started yesterday before opening anything new.",
      "Reach out to one person who depends on you — clarity beats speed.",
      "Document one decision so the team is not guessing later.",
      "Close the loop on a promise you made this week.",
    ],
    seed,
  );
}

export function getMotivationForDay(): string {
  const seed = daySeed();
  return pick(
    [
      "Steady service outlasts loud enthusiasm. Show up again today.",
      "Honor is doing the right thing when nobody is watching.",
      "Care is attention — give someone yours without multitasking.",
      "Small disciplined actions compound into trust.",
      "You do not need perfect conditions to act with integrity.",
    ],
    seed + 3,
  );
}

export function getThoughtForDay(): { quote: string; attribution: string } {
  const seed = daySeed();
  return pick(
    [
      {
        quote: "Well done is better than well said.",
        attribution: "Benjamin Franklin",
      },
      {
        quote: "The best way out is always through.",
        attribution: "Robert Frost",
      },
      {
        quote: "Duty is the essence of honor.",
        attribution: "Traditional maxim",
      },
      {
        quote: "Let your light shine before others, that they may see your good deeds.",
        attribution: "Matthew 5:16",
      },
      {
        quote: "Character is how you treat those who can do nothing for you.",
        attribution: "Unknown",
      },
    ],
    seed + 7,
  );
}

export function getNewsStub(): { headline: string; summary: string }[] {
  return [
    {
      headline: "Daily digest (preview)",
      summary:
        "Wire this panel to your news API or Grok briefing. For now it shows the layout and reading rhythm.",
    },
    {
      headline: "Local & organizational updates",
      summary:
        "Pin division notices, weather, and travel advisories here so the command center stays one glance away.",
    },
  ];
}

export function getChangesStub(): string[] {
  const seed = daySeed();
  return pick(
    [
      [
        "Meeting room B AV upgrade — expect 30 min downtime at noon.",
        "Updated parking pass policy posted under Guidelines.",
        "New seminar series signup opens Friday.",
      ],
      [
        "Training module 3 due for all supervisors by month end.",
        "Forums moderation hours extended to 8 p.m. local.",
        "Spirit Cleanse room reserved Sundays 7–8 a.m.",
      ],
      [
        "Assistant (Grok VA) beta — internal use only until review.",
        "Real Old Friend link verified for production URL in settings.",
        "Quarterly guidelines review scheduled next Tuesday.",
      ],
    ],
    seed + 11,
  );
}
