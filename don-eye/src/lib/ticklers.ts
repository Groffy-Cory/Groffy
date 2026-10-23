/** Placeholder daily tickler content — swap/edit freely later */

export type Tickler = {
  id: string;
  title: string;
  summary: string;
  href?: string;
  linkLabel?: string;
  tone?: "default" | "royal";
};

export const HOME_TICKLERS: Tickler[] = [
  {
    id: "focus",
    title: "Today’s care focus",
    summary:
      "Walk the unit once this morning with a clear eye on fall-risk rooms and call-light response times.",
    href: "/daily-focus",
    linkLabel: "Open Daily Focus",
  },
  {
    id: "news",
    title: "Healthcare pulse",
    summary:
      "CMS posted clarifying QSO guidance on staffing documentation. Two state surveyor tips are worth a five-minute scan.",
    href: "/news",
    linkLabel: "Read News",
    tone: "royal",
  },
  {
    id: "regs",
    title: "Regulation watch",
    summary:
      "Recent update: infection-control documentation reminders for Q4. Jump to Forums if your team needs a shared thread.",
    href: "/regulations",
    linkLabel: "Open Regulations",
  },
  {
    id: "spirit",
    title: "Your Spirit",
    summary:
      "Three-minute reset: breathe, name one person you will protect today, then release one worry you cannot control.",
    href: "/your-spirit",
    linkLabel: "Open Your Spirit"
  },
  {
    id: "training",
    title: "Training nudge",
    summary:
      "Supervisor checklist module is due for two charge nurses this week. Search Training for “checklist.”",
    href: "/training",
    linkLabel: "Browse Training",
  },
  {
    id: "rof",
    title: "ROF Reports",
    summary:
      "Review companion check-ins and shared stories from Real Old Friend when you need a resident-centered pulse.",
    href: "/rof-reports",
    linkLabel: "Open ROF Reports",
    tone: "royal",
  },
];

export const DAILY_FOCUS_ITEMS = [
  {
    title: "Protect morning med-pass calm",
    detail: "Shield the med cart corridor from non-urgent interruptions until 10:00 a.m.",
  },
  {
    title: "One family conversation",
    detail: "Call or meet one family who asked for an update yesterday — close the loop.",
  },
  {
    title: "Boardroom-ready note",
    detail: "Capture one staffing or quality observation you can use in the next leadership brief.",
  },
];

export const NEWS_ITEMS = [
  {
    title: "CMS QSO staffing documentation reminder",
    summary: "Surveyors are asking for clearer shift-level coverage notes in Q4 reviews.",
    tag: "Regulatory",
  },
  {
    title: "Fall prevention: simple lighting audits",
    summary: "Facilities reporting fewer night falls after hallway lux checks and bedside lamp standards.",
    tag: "Clinical",
  },
  {
    title: "Unique: DON peer roundtable — weekend coverage models",
    summary: "A short peer note on hybrid on-call patterns that reduced burnout without raising overtime.",
    tag: "Specialized",
  },
];

export const REG_LINKS = [
  { label: "CMS — Nursing Homes", href: "https://www.cms.gov/medicare/health-safety-standards/quality-safety-oversight-general-information/nursing-homes" },
  { label: "CDC — Infection Control", href: "https://www.cdc.gov/long-term-care-facilities/index.html" },
  { label: "OSHA — Healthcare", href: "https://www.osha.gov/healthcare" },
  { label: "Joint Commission", href: "https://www.jointcommission.org/" },
];

export const REG_UPDATES = [
  {
    title: "Site note: documentation for antibiotic stewardship rounds",
    date: "Posted this week",
  },
  {
    title: "Site note: visitor screening policy language clarified",
    date: "Posted last week",
  },
];

export const TRAININGS = [
  { title: "Standards overview for DONs", meta: "45 min · Annual", tags: "standards don annual" },
  { title: "Supervisor checklist", meta: "60 min · Supervisors", tags: "checklist supervisor" },
  { title: "Infection control refresh", meta: "30 min · All clinical", tags: "infection control clinical" },
  { title: "Family communication under stress", meta: "40 min · Leadership", tags: "family communication" },
  { title: "Boardroom briefing basics", meta: "25 min · Admin", tags: "boardroom admin briefing" },
];

export const FORUM_TOPICS = [
  {
    title: "Weekend staffing coverage ideas",
    meta: "Admin · 6 replies · Updated today",
  },
  {
    title: "Surveyor documentation tips that actually helped",
    meta: "User · 11 replies · Updated yesterday",
  },
  {
    title: "Spirit cleanse routines that fit a 10-minute break",
    meta: "User · 4 replies · Updated 3 days ago",
  },
];
