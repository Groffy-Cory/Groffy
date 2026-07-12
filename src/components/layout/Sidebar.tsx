"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLists } from "@/components/lists/ListsProvider";
import { useMealsPantry } from "@/components/meals/MealsPantryProvider";
import { useMemoryVault } from "@/components/memory-vault/MemoryVaultProvider";
import { useMessages } from "@/components/messages/MessagesProvider";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { UpcomingReminders } from "@/components/reminders/UpcomingReminders";
import { useReminders } from "@/components/reminders/RemindersProvider";
import { SIDEBAR_TABS } from "@/lib/constants";
import type { FeatureModalId } from "@/lib/preferences/types";

const MODAL_TAB_IDS = new Set([
  "reminders",
  "messages",
  "memory-vault",
  "lists",
  "meals-pantry",
  "weather",
  "sports",
  "book-club",
  "prayer",
  "memory-games",
  "settings",
]);

const EXTERNAL_TAB_HREFS: Record<string, string> = {
  facebook: "https://www.facebook.com/",
  youtube: "https://www.youtube.com/",
  search: "https://duckduckgo.com/",
};

function duckDuckGoNewsUrl(topics: string[]): string {
  const useful = topics.filter((topic) => topic && topic !== "general");
  const query =
    useful.length > 0
      ? `${useful.join(" ")} news`
      : "today's news";
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=news`;
}

export function Sidebar() {
  const pathname = usePathname();
  const { openSettings } = useAuth();
  const { openReminders, upcomingCount } = useReminders();
  const { openMessages, unreadCount } = useMessages();
  const { openVault } = useMemoryVault();
  const { openLists } = useLists();
  const { openMealsPantry, items: pantryItems } = useMealsPantry();
  const { openFeatureModal, prefs } = usePreferences();

  return (
    <aside
      className="rof-card flex h-full min-h-0 w-full flex-col lg:w-72 xl:w-80"
      aria-label="Main features"
    >
      <div className="border-b-2 border-steel-200 px-4 py-4">
        <h2 className="font-display text-xl font-semibold text-ink">Features</h2>
        <p className="mt-1 text-sm font-semibold text-muted">
          Scroll to browse every tool
        </p>
      </div>

      <UpcomingReminders />

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Sidebar">
        <ul className="flex flex-col gap-1.5">
          {SIDEBAR_TABS.map((tab) => {
            const opensModal = MODAL_TAB_IDS.has(tab.id);
            const externalHref =
              tab.id === "news"
                ? duckDuckGoNewsUrl(prefs.newsTopics)
                : EXTERNAL_TAB_HREFS[tab.id];
            const isExternal = Boolean(externalHref);
            const isActive =
              opensModal || isExternal
                ? false
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const hasChildren = "children" in tab && Array.isArray(tab.children);

            const className = [
              "block w-full min-h-14 px-3 py-3.5 text-left text-base font-bold transition-colors sm:text-lg",
              "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-royal",
              isActive
                ? "rof-paper-tab-active border-2 border-royal bg-royal text-white rounded-xl"
                : "rof-paper-tab border-2 border-transparent bg-steel-50 text-ink rounded-xl hover:border-steel-200 hover:bg-[var(--surface-raised)]",
            ].join(" ");

            const badge =
              tab.id === "reminders" &&
              prefs.remindersNotificationsEnabled &&
              upcomingCount > 0
                ? upcomingCount
                : tab.id === "messages" && unreadCount > 0
                  ? unreadCount
                  : tab.id === "meals-pantry" && pantryItems.length > 0
                    ? pantryItems.length
                    : null;

            return (
              <li key={tab.id}>
                {opensModal ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (tab.id === "reminders") openReminders();
                      else if (tab.id === "messages") openMessages();
                      else if (tab.id === "memory-vault") openVault();
                      else if (tab.id === "lists") openLists();
                      else if (tab.id === "meals-pantry") openMealsPantry();
                      else if (tab.id === "settings") openSettings();
                      else openFeatureModal(tab.id as FeatureModalId);
                    }}
                    className={className}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>{tab.label}</span>
                      {badge !== null ? (
                        <span className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-royal px-2 text-sm font-bold text-white">
                          {badge}
                        </span>
                      ) : null}
                    </span>
                  </button>
                ) : isExternal && externalHref ? (
                  <a
                    href={externalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {tab.label}
                  </a>
                ) : (
                  <Link href={tab.href} className={className}>
                    {tab.label}
                  </Link>
                )}
                {hasChildren ? (
                  <ul className="mt-1 mb-2 ml-3 space-y-1 border-l-2 border-steel-200 pl-3">
                    {tab.children.map((child) => {
                      const anchor = child
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      const hrefMap: Record<string, string> = {
                        "famous-birthdays": "/todays-specials#birthdays",
                        "today-in-history": "/todays-specials#history",
                        "quote-of-the-day": "/todays-specials#quote",
                        "fact-of-the-day": "/todays-specials#fact",
                        "word-of-the-day": "/todays-specials#word",
                        "joke-of-the-day": "/todays-specials#joke",
                      };
                      const href =
                        hrefMap[anchor] || `/todays-specials#${anchor}`;

                      return (
                        <li key={child}>
                          <Link
                            href={href}
                            className="block py-1 text-sm font-semibold text-muted hover:text-royal-dark focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-royal"
                          >
                            {child}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
