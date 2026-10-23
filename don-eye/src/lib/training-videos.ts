export type TrainingCategory =
  | "new-don"
  | "challenging-building"
  | "ij-strategies"
  | "nurses"
  | "administrators"
  | "mds";

export type SubscriptionTier = "basic" | "standard" | "premium";

export type TrainingVideo = {
  id: string;
  title: string;
  meta: string;
  tags: string;
  category: TrainingCategory;
  /** Placeholder stream — swap for real CDN/hosted files later */
  videoSrc: string;
  forumPrompt: string;
  /** Subscription gate — enforced later */
  minTier: SubscriptionTier;
};

export const TRAINING_CATEGORIES: {
  id: TrainingCategory;
  label: string;
}[] = [
  { id: "new-don", label: "New DON" },
  { id: "challenging-building", label: "Challenging Building" },
  { id: "ij-strategies", label: "IJ Strategies" },
  { id: "nurses", label: "Nurses" },
  { id: "administrators", label: "Administrators" },
  { id: "mds", label: "MDS" },
];

export const TRAINING_VIDEOS: TrainingVideo[] = [
  {
    id: "standards-overview",
    title: "Standards overview for DONs",
    meta: "45 min · Annual · Video",
    tags: "standards don annual video",
    category: "new-don",
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    forumPrompt: "Questions or takeaways from Standards overview for DONs?",
    minTier: "basic",
  },
  {
    id: "supervisor-checklist",
    title: "Supervisor checklist",
    meta: "60 min · Supervisors · Video",
    tags: "checklist supervisor video",
    category: "nurses",
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    forumPrompt: "Discuss Supervisor checklist — what did your team change?",
    minTier: "standard",
  },
  {
    id: "infection-control",
    title: "Infection control refresh",
    meta: "30 min · All clinical · Video",
    tags: "infection control clinical video",
    category: "challenging-building",
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    forumPrompt: "Infection control refresh — share floor tips that stuck.",
    minTier: "basic",
  },
  {
    id: "ij-response",
    title: "Immediate Jeopardy response drill",
    meta: "40 min · Leadership · Video",
    tags: "ij jeopardy strategies",
    category: "ij-strategies",
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    forumPrompt: "IJ Strategies — what worked in your last drill?",
    minTier: "premium",
  },
  {
    id: "admin-briefing",
    title: "Boardroom briefing basics",
    meta: "25 min · Admin · Video",
    tags: "boardroom admin briefing video",
    category: "administrators",
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    forumPrompt: "Boardroom briefing basics — what belongs on page one?",
    minTier: "standard",
  },
  {
    id: "mds-coding",
    title: "MDS accuracy essentials",
    meta: "35 min · MDS · Video",
    tags: "mds coding accuracy",
    category: "mds",
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    forumPrompt: "MDS — coding questions from this video?",
    minTier: "standard",
  },
];

export function videoById(id: string): TrainingVideo | undefined {
  return TRAINING_VIDEOS.find((v) => v.id === id);
}
