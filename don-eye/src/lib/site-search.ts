import { SIDEBAR_NAV } from "@/lib/nav";
import { STAFF_SECTIONS } from "@/lib/staff";
import { SUBJECT_CARDS } from "@/lib/subjects";
import { TRAINING_CATEGORIES, TRAINING_VIDEOS } from "@/lib/training-videos";
import { FORUM_TOPICS } from "@/lib/ticklers";

export type SiteSearchHit = {
  id: string;
  title: string;
  blurb: string;
  href: string;
  group: "Lane" | "Training" | "Forum" | "Staff";
};

export function searchSite(query: string): SiteSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SiteSearchHit[] = [];

  for (const card of SUBJECT_CARDS) {
    const hay = `${card.title} ${card.blurb} ${card.detail.join(" ")}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        id: `lane-${card.id}`,
        title: card.title,
        blurb: card.blurb,
        href: card.href,
        group: "Lane",
      });
    }
  }

  for (const nav of SIDEBAR_NAV) {
    if (nav.label.toLowerCase().includes(q) && !hits.some((h) => h.href === nav.href)) {
      hits.push({
        id: `nav-${nav.id}`,
        title: nav.label,
        blurb: "Sidebar lane",
        href: nav.href,
        group: "Lane",
      });
    }
  }

  for (const cat of TRAINING_CATEGORIES) {
    if (cat.label.toLowerCase().includes(q)) {
      hits.push({
        id: `train-cat-${cat.id}`,
        title: cat.label,
        blurb: "Training category",
        href: `/training?category=${cat.id}`,
        group: "Training",
      });
    }
  }

  for (const video of TRAINING_VIDEOS) {
    const hay = `${video.title} ${video.meta} ${video.tags}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        id: `train-${video.id}`,
        title: video.title,
        blurb: video.meta,
        href: `/training?q=${encodeURIComponent(video.title)}`,
        group: "Training",
      });
    }
  }

  for (const topic of FORUM_TOPICS) {
    const hay = `${topic.title} ${topic.meta}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        id: `forum-${topic.title}`,
        title: topic.title,
        blurb: topic.meta,
        href: `/forums?q=${encodeURIComponent(topic.title)}`,
        group: "Forum",
      });
    }
  }

  for (const section of STAFF_SECTIONS) {
    const hay = `${section.label} ${section.blurb}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        id: `staff-${section.id}`,
        title: section.label,
        blurb: section.blurb,
        href: `/staff?section=${section.id}`,
        group: "Staff",
      });
    }
  }

  return hits.slice(0, 12);
}
