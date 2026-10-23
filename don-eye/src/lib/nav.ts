export type NavItem = {
  id: string;
  label: string;
  href: string;
  kind?: "rof";
};

/** Sidebar order */
export const SIDEBAR_NAV: NavItem[] = [
  { id: "rof-reports", label: "ROF Reports", href: "/rof-reports", kind: "rof" },
  { id: "assistant", label: "Assistant", href: "/assistant" },
  { id: "news", label: "News", href: "/news" },
  { id: "regulations", label: "Regulations", href: "/regulations" },
  { id: "daily-focus", label: "Daily Focus", href: "/daily-focus" },
  { id: "your-spirit", label: "Your Spirit", href: "/your-spirit" },
  { id: "training", label: "Training", href: "/training" },
  { id: "forums", label: "Forums", href: "/forums" },
  { id: "survey", label: "Survey", href: "/survey" },
  { id: "staff", label: "Staff", href: "/staff" },
  {
    id: "request-consultant",
    label: "Request Consultant",
    href: "/request-consultant",
  },
];

/** Pages that should navigate (in addition to opening a detail window) */
export const NAVIGATE_IDS = new Set([
  "training",
  "forums",
  "survey",
  "staff",
  "request-consultant",
  "regulations",
  "assistant",
  "news",
  "rof-reports",
  "daily-focus",
  "your-spirit",
]);
