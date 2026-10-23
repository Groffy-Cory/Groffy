import { SIDEBAR_NAV } from "@/lib/nav";

export type SubjectId =
  | "rof-reports"
  | "assistant"
  | "news"
  | "regulations"
  | "daily-focus"
  | "your-spirit"
  | "training"
  | "forums"
  | "survey"
  | "staff"
  | "request-consultant";

export type SubjectCard = {
  id: SubjectId;
  title: string;
  blurb: string;
  detail: string[];
  href: string;
  tone?: "royal";
};

export const SUBJECT_CARDS: SubjectCard[] = [
  {
    id: "rof-reports",
    title: "ROF Reports",
    blurb: "Resident-centered pulse from Real Old Friend — check-ins, stories, and family notes.",
    detail: [
      "Open companion check-in trends and shared stories.",
      "Use this lane when you need a bedside view before a boardroom update.",
      "Deep report tiles and live ROF data will connect here next.",
    ],
    href: "/rof-reports",
    tone: "royal",
  },
  {
    id: "assistant",
    title: "Assistant",
    blurb: "Grok companion plus Important Reminders for time-sensitive issues.",
    detail: [
      "Chat for drafts, lookups, and calm wording.",
      "Add or address Important Reminders with dates.",
      "Live Grok wiring plugs in when keys are ready.",
    ],
    href: "/assistant",
  },
  {
    id: "news",
    title: "News",
    blurb: "Grok-curated healthcare and DON-pertinent links — Admin directs what surfaces.",
    detail: [
      "List of news links and summaries from the Grok API.",
      "Admin controls which sources and themes matter.",
      "Placeholder feed until the API is connected.",
    ],
    href: "/news",
    tone: "royal",
  },
  {
    id: "regulations",
    title: "Regulations",
    blurb: "Recent updates, Grok search across regulatory sites, and an Admin-filled briefing box.",
    detail: [
      "New / recent updates listed first.",
      "Search bar asks Grok to scan CMS, CDC, OSHA, and more.",
      "Admin Grok box for curated regulatory notes.",
    ],
    href: "/regulations",
  },
  {
    id: "daily-focus",
    title: "Daily Focus",
    blurb: "One to three care or business priorities worth protecting today.",
    detail: [
      "Placeholder focuses for now — later configurable per facility.",
      "Keep it short so the day starts with clarity, not clutter.",
    ],
    href: "/daily-focus",
  },
  {
    id: "your-spirit",
    title: "Your Spirit",
    blurb: "Themes, short resets, quotes, and on-the-spot self-care.",
    detail: [
      "Two-minute cleanses you can run between calls.",
      "Positive themes that travel from bedside to boardroom.",
    ],
    href: "/your-spirit",
  },
  {
    id: "training",
    title: "Training",
    blurb: "Category buttons, open video posting, forums per video — gated by subscription later.",
    detail: [
      "New DON, Challenging Building, IJ Strategies, Nurses, Administrators, MDS.",
      "Post new videos openly for now; subscription levels come next.",
      "Open movable video + forum windows side by side.",
    ],
    href: "/training",
    tone: "royal",
  },
  {
    id: "forums",
    title: "Forums",
    blurb: "Open topic posting with search. Admin/moderator rules coming.",
    detail: [
      "Post new topics freely for now.",
      "Search existing threads.",
      "Admin / moderator controls TBD.",
    ],
    href: "/forums",
  },
  {
    id: "survey",
    title: "Survey",
    blurb: "Tools for Survey Prep, Survey Plan, and Survey Response.",
    detail: [
      "Prep checklists and focus areas.",
      "Plan timelines and assignments.",
      "Response drafts and follow-ups.",
    ],
    href: "/survey",
    tone: "royal",
  },
  {
    id: "staff",
    title: "Staff",
    blurb:
      "Today, This Week, This Month, Staff Overview, Staff Training, and Recruiting.",
    detail: [
      "Time lenses: Today, This Week, This Month.",
      "Staff Overview, Staff Training, and Recruiting.",
      "Each box will grow large user-option sets.",
    ],
    href: "/staff",
  },
  {
    id: "request-consultant",
    title: "Request Consultant",
    blurb: "Explore live consult by lane: DON, Nurses, Administrators, MDS, Staffing/Recruiting.",
    detail: [
      "Pick the role or focus that matches your need.",
      "Intake / booking wiring comes next.",
    ],
    href: "/request-consultant",
  },
];

export function subjectById(id: string): SubjectCard | undefined {
  return SUBJECT_CARDS.find((s) => s.id === id);
}

export function subjectFromHref(href: string): SubjectCard | undefined {
  const item = SIDEBAR_NAV.find((n) => n.href === href);
  if (!item) return undefined;
  return subjectById(item.id);
}
