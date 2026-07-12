export const APP_NAME = "ROF";
export const APP_TAGLINE = "Real Old Friend";
export const DEFAULT_COMPANION_NAME = "Rofy";

export const SIDEBAR_TABS = [
  { id: "reminders", label: "Reminders", href: "/reminders" },
  { id: "messages", label: "Messages", href: "/messages" },
  { id: "memory-vault", label: "Memory Vault", href: "/memory-vault" },
  { id: "lists", label: "Lists", href: "/lists" },
  { id: "meals-pantry", label: "Meals & Pantry", href: "/meals-pantry" },
  { id: "friends", label: "Friends", href: "/friends" },
  { id: "family-collection", label: "Family Collection", href: "/family-collection" },
  { id: "prayer", label: "Prayer / Meditation", href: "/prayer" },
  { id: "memory-games", label: "Memory Games", href: "/memory-games" },
  { id: "book-club", label: "Book Club", href: "/book-club" },
  { id: "virtual-visit", label: "Virtual Visit", href: "/virtual-visit" },
  { id: "weather", label: "Weather", href: "/weather" },
  { id: "news", label: "News", href: "/news" },
  { id: "sports", label: "Sports", href: "/sports" },
  { id: "facebook", label: "Facebook", href: "/facebook" },
  { id: "youtube", label: "YouTube", href: "/youtube" },
  { id: "search", label: "Search", href: "/search" },
  {
    id: "todays-specials",
    label: "Today's Specials",
    href: "/todays-specials",
    children: [
      "Famous Birthdays",
      "Today in History",
      "Quote of the Day",
      "Fact of the Day",
      "Word of the Day",
      "Joke of the Day",
    ],
  },
  { id: "settings", label: "Settings", href: "/settings" },
] as const;

export const MOOD_OPTIONS = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "okay", label: "Okay", emoji: "🙂" },
  { id: "tired", label: "Tired", emoji: "😴" },
  { id: "lonely", label: "Lonely", emoji: "💙" },
  { id: "worried", label: "Worried", emoji: "😟" },
  { id: "grateful", label: "Grateful", emoji: "🙏" },
] as const;

export const FAMILY_STORY_PROMPTS = [
  "What was your favorite family holiday tradition?",
  "Tell about a time you felt proud of a family member.",
  "What did Sundays look like when you were growing up?",
  "Who was the best cook in your family, and what did they make?",
  "Share a funny story about a sibling, parent, or child.",
];
