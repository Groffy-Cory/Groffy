"use client";

import { useMemo, useState } from "react";
import { SiteSearch } from "@/components/SiteSearch";
import { useWindows } from "@/components/windows/window-context";
import { FORUM_TOPICS } from "@/lib/ticklers";

type Topic = { title: string; meta: string; body?: string };

export function ForumsBoard() {
  const [topics, setTopics] = useState<Topic[]>(
    FORUM_TOPICS.map((t) => ({ ...t, body: "" })),
  );
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { openWindow } = useWindows();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => {
      const haystack = `${t.title} ${t.meta} ${t.body ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, topics]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setTopics((prev) => [
      {
        title: trimmed,
        body: body.trim(),
        meta: `You · New topic · Just now`,
      },
      ...prev,
    ]);
    setTitle("");
    setBody("");
  }

  function openTopicWindow(topic: Topic) {
    openWindow({
      id: `forum-topic-${topic.title}`,
      title: `Forum · ${topic.title}`,
      width: 480,
      height: 420,
      content: (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[color:var(--muted)]">
            {topic.meta}
          </p>
          <p className="text-base font-semibold text-[color:var(--ink-soft)]">
            {topic.body || "Topic thread placeholder. Replies connect later."}
          </p>
          <p className="rounded-lg border border-[color:var(--steel)] bg-white/60 px-3 py-2 text-sm font-semibold">
            Coming soon: admin / moderator decisions on who can post.
          </p>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-5">
      <section className="don-card px-5 py-5 sm:px-6">
        <h2
          className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Search this site — Forums
        </h2>
        <div className="mt-3">
          <SiteSearch
            id="forum-site-search"
            placeholder="Search forums & the rest of The DON Eye…"
            initialQuery={query}
            onLocalFilter={setQuery}
          />
        </div>
        <p className="mt-3 rounded-lg border border-[color:var(--steel)] bg-white/60 px-3 py-2 text-sm font-semibold text-[color:var(--ink-soft)]">
          Admin / moderator functions (who can post, approvals, moderation) are
          not decided yet — coming later.
        </p>
      </section>

      <section className="don-card px-5 py-5 sm:px-6">
        <h2
          className="text-2xl font-semibold text-[color:var(--burgundy-deep)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Start a topic
        </h2>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input
            className="don-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Topic title"
            aria-label="Topic title"
          />
          <textarea
            className="don-input don-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Optional first post…"
            aria-label="Topic body"
          />
          <button type="submit" className="don-btn don-btn-primary">
            Post topic
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="don-card px-5 py-4 sm:px-6">
          <h2
            className="text-xl font-semibold text-[color:var(--burgundy-deep)]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Topics
          </h2>
          <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">
            Showing {results.length} of {topics.length}
            {query.trim() ? ` matching “${query.trim()}”` : ""}. Click a topic
            for a movable window.
          </p>
        </div>
        {results.length === 0 ? (
          <article className="don-card px-5 py-5 text-base font-semibold text-[color:var(--muted)]">
            No topics match “{query}”.
          </article>
        ) : (
          results.map((topic) => (
            <button
              key={topic.title + topic.meta}
              type="button"
              className="don-card block w-full px-5 py-4 text-left sm:px-6"
              onClick={() => openTopicWindow(topic)}
            >
              <h3 className="text-lg font-bold text-[color:var(--burgundy-deep)]">
                {topic.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">
                {topic.meta}
              </p>
            </button>
          ))
        )}
      </section>
    </div>
  );
}
