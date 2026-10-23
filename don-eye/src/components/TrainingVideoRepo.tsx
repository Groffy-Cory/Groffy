"use client";

import { useMemo, useState } from "react";
import { SiteSearch } from "@/components/SiteSearch";
import { useViewMode } from "@/components/ViewModeProvider";
import { useWindows } from "@/components/windows/window-context";
import {
  TRAINING_CATEGORIES,
  TRAINING_VIDEOS,
  type TrainingCategory,
  type TrainingVideo,
} from "@/lib/training-videos";

function VideoPlayer({ video }: { video: TrainingVideo }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[color:var(--muted)]">
        {video.meta} · Tier: {video.minTier}
      </p>
      <video
        className="w-full rounded-lg border border-[color:var(--steel)] bg-black"
        controls
        playsInline
        src={video.videoSrc}
      >
        Your browser does not support embedded video.
      </video>
      <p className="text-sm font-semibold text-[color:var(--ink-soft)]">
        Placeholder stream — replace with stored training files. Access later
        gated by subscription level.
      </p>
    </div>
  );
}

function VideoForum({ video }: { video: TrainingVideo }) {
  const [posts, setPosts] = useState<string[]>([
    `Thread for “${video.title}”. Admin/moderator posting rules are coming.`,
  ]);
  const [draft, setDraft] = useState("");

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <p className="text-sm font-semibold text-[color:var(--muted)]">
        Discussion for this exact video.
      </p>
      <p className="rounded-lg border border-[color:var(--steel)] bg-white/60 px-3 py-2 text-sm font-semibold text-[color:var(--ink-soft)]">
        {video.forumPrompt}
      </p>
      <ul className="min-h-0 flex-1 space-y-2 overflow-auto">
        {posts.map((post, i) => (
          <li
            key={`${i}-${post.slice(0, 24)}`}
            className="rounded-lg border border-[color:var(--steel)] bg-white/70 px-3 py-2 text-sm font-semibold"
          >
            {post}
          </li>
        ))}
      </ul>
      <form
        className="space-y-2 border-t border-[color:var(--steel)] pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          const t = draft.trim();
          if (!t) return;
          setPosts((p) => [...p, t]);
          setDraft("");
        }}
      >
        <textarea
          className="don-input don-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add to this video’s forum…"
          aria-label={`Post to forum for ${video.title}`}
        />
        <button type="submit" className="don-btn don-btn-primary">
          Post
        </button>
      </form>
    </div>
  );
}

export function TrainingVideoRepo() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TrainingCategory | "all">("all");
  const [videos, setVideos] = useState<TrainingVideo[]>(TRAINING_VIDEOS);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TrainingCategory>("new-don");
  const [newUrl, setNewUrl] = useState("");
  const [showAdminPost, setShowAdminPost] = useState(false);
  const { openWindow } = useWindows();
  const { isAdmin } = useViewMode();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (!q) return true;
      return `${v.title} ${v.meta} ${v.tags}`.toLowerCase().includes(q);
    });
  }, [query, category, videos]);

  function openVideo(video: TrainingVideo) {
    openWindow({
      id: `video-${video.id}`,
      title: `Video · ${video.title}`,
      width: 640,
      height: 480,
      x: 72,
      y: 88,
      content: <VideoPlayer video={video} />,
    });
  }

  function openForum(video: TrainingVideo) {
    openWindow({
      id: `forum-video-${video.id}`,
      title: `Forum · ${video.title}`,
      width: 440,
      height: 520,
      x: 740,
      y: 100,
      content: <VideoForum video={video} />,
    });
  }

  function postVideo(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const id = `user-${Date.now()}`;
    const video: TrainingVideo = {
      id,
      title,
      meta: "User posted · Video",
      tags: `${title} ${newCategory}`.toLowerCase(),
      category: newCategory,
      videoSrc:
        newUrl.trim() ||
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      forumPrompt: `Discussion for “${title}”`,
      minTier: "basic",
    };
    setVideos((prev) => [video, ...prev]);
    setNewTitle("");
    setNewUrl("");
    setShowAdminPost(false);
  }

  return (
    <div className="space-y-4">
      <div className="don-card px-5 py-5 sm:px-6">
        <h2
          className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Topics
        </h2>
        <p className="mt-1 text-base font-semibold text-[color:var(--muted)]">
          Click a topic to view its videos.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            type="button"
            className="don-topic-btn"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
          >
            All topics
          </button>
          {TRAINING_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className="don-topic-btn"
              aria-pressed={category === cat.id}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="don-btn don-btn-primary"
            onClick={() => setShowAdminPost((v) => !v)}
          >
            Admin — post new video
          </button>
          {isAdmin ? (
            <span className="text-sm font-semibold text-[color:var(--muted)]">
              Admin view on · subscription tiers labeled below
            </span>
          ) : null}
        </div>
      </div>

      {showAdminPost ? (
        <div className="don-card px-5 py-5 sm:px-6">
          <h2
            className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Admin — post a new video
          </h2>
          <p className="mt-1 text-base font-semibold text-[color:var(--muted)]">
            Temporary open posting UI — clean up permissions later.
          </p>
          <form className="mt-4 space-y-3" onSubmit={postVideo}>
            <input
              className="don-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Video title"
              aria-label="Video title"
            />
            <select
              className="don-input"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as TrainingCategory)}
              aria-label="Training category"
            >
              {TRAINING_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <input
              className="don-input"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Video URL (optional — placeholder used if blank)"
              aria-label="Video URL"
            />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="don-btn don-btn-primary">
                Post video
              </button>
              <button
                type="button"
                className="don-btn don-btn-ghost"
                onClick={() => setShowAdminPost(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="don-card px-5 py-5 sm:px-6">
        <h2
          className="text-xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Search this site — Training
        </h2>
        <div className="mt-3">
          <SiteSearch
            id="training-site-search"
            placeholder="Search training & the rest of The DON Eye…"
            initialQuery={query}
            onLocalFilter={setQuery}
          />
        </div>
        <p className="mt-2 text-sm font-semibold text-[color:var(--muted)]">
          Showing {results.length} of {videos.length} in this topic
          {query.trim() ? ` · filter “${query.trim()}”` : ""}.
        </p>
      </div>

      <ul className="space-y-3">
        {results.map((video) => (
          <li key={video.id} className="don-card px-5 py-4 sm:px-6">
            <p className="don-kicker">
              {TRAINING_CATEGORIES.find((c) => c.id === video.category)?.label}
            </p>
            <h3 className="mt-1 text-xl font-bold text-[color:var(--burgundy-deep)]">
              {video.title}
            </h3>
            <p className="mt-1 text-base font-semibold text-[color:var(--muted)]">
              {video.meta}
              {isAdmin ? ` · min tier: ${video.minTier}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="don-btn don-btn-primary"
                onClick={() => openVideo(video)}
              >
                Open video window
              </button>
              <button
                type="button"
                className="don-btn don-btn-royal"
                onClick={() => openForum(video)}
              >
                Forum for this video
              </button>
              <button
                type="button"
                className="don-btn don-btn-ghost"
                onClick={() => {
                  openVideo(video);
                  openForum(video);
                }}
              >
                Open both windows
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
