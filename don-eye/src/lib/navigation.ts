export type NavGroupId = "command" | "daily" | "community" | "standards" | "tools";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  group: NavGroupId;
  description: string;
  external?: boolean;
};

export const NAV_GROUPS: { id: NavGroupId; label: string }[] = [
  { id: "command", label: "Command" },
  { id: "daily", label: "Daily briefing" },
  { id: "tools", label: "Tools" },
  { id: "community", label: "Community & growth" },
  { id: "standards", label: "Standards & care" },
];

export const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Command center",
    href: "/",
    group: "command",
    description: "Today’s overview across every lane.",
  },
  {
    id: "real-old-friend",
    label: "Real Old Friend",
    href: "/real-old-friend",
    group: "command",
    description: "Jump to the companion app for stories, mood, and daily life.",
  },
  {
    id: "focus",
    label: "Focus for the Day",
    href: "/focus",
    group: "daily",
    description: "One priority worth protecting today.",
  },
  {
    id: "motivation",
    label: "Motivation for the Day",
    href: "/motivation",
    group: "daily",
    description: "A steady word before the work begins.",
  },
  {
    id: "news",
    label: "News for the Day",
    href: "/news",
    group: "daily",
    description: "Headlines and context without the noise.",
  },
  {
    id: "changes",
    label: "Changes for the Day",
    href: "/changes",
    group: "daily",
    description: "What shifted — policies, schedules, and expectations.",
  },
  {
    id: "thoughts",
    label: "Thoughts of the Day",
    href: "/thoughts",
    group: "daily",
    description: "Reflection, scripture, or wisdom to carry.",
  },
  {
    id: "assistant",
    label: "Assistant",
    href: "/assistant",
    group: "tools",
    description: "Grok-based virtual assistant for questions and drafts.",
  },
  {
    id: "forums",
    label: "Forums",
    href: "/forums",
    group: "community",
    description: "Discussion threads across the organization.",
  },
  {
    id: "training",
    label: "Training",
    href: "/training",
    group: "community",
    description: "Courses, drills, and skill refreshers.",
  },
  {
    id: "seminars",
    label: "Seminars",
    href: "/seminars",
    group: "community",
    description: "Live and recorded sessions.",
  },
  {
    id: "meetings",
    label: "Meetings",
    href: "/meetings",
    group: "community",
    description: "Agendas, minutes, and standing meetings.",
  },
  {
    id: "spirit-cleanse",
    label: "Spirit Cleanse",
    href: "/spirit-cleanse",
    group: "standards",
    description: "Reset, prayer, and intentional quiet.",
  },
  {
    id: "guidelines",
    label: "Guidelines",
    href: "/guidelines",
    group: "standards",
    description: "Policies, codes, and how we operate.",
  },
];

export function navItemForPath(pathname: string): NavItem | undefined {
  if (pathname === "/") return NAV_ITEMS.find((i) => i.id === "home");
  const match = NAV_ITEMS.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href),
  );
  return match;
}
