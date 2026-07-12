"use client";

import { FormEvent, useState } from "react";
import {
  DEFAULT_COMPANION_NAME,
  FAMILY_STORY_PROMPTS,
} from "@/lib/constants";

type ShareStoryProps = {
  companionName?: string;
};

export function ShareStory({
  companionName = DEFAULT_COMPANION_NAME,
}: ShareStoryProps) {
  const [story, setStory] = useState("");
  const [showPrompts, setShowPrompts] = useState(false);
  const [saved, setSaved] = useState(false);

  function applyPrompt(prompt: string) {
    setStory((prev) => (prev ? `${prev.trim()}\n\n${prompt}\n` : `${prompt}\n`));
    setShowPrompts(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!story.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section className="rof-card p-5 sm:p-6" aria-labelledby="story-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="story-heading" className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Share a Story with {companionName}
          </h2>
          <p className="mt-1 text-base font-semibold text-muted">
            Memories matter. Write at your own pace.
          </p>
        </div>
        <button
          type="button"
          className="rof-btn rof-btn-secondary"
          onClick={() => setShowPrompts((open) => !open)}
          aria-expanded={showPrompts}
        >
          Family Story Prompts
        </button>
      </div>

      {showPrompts ? (
        <ul className="mt-4 space-y-2 rounded-xl border-2 border-royal-soft bg-royal-soft p-3">
          {FAMILY_STORY_PROMPTS.map((prompt) => (
            <li key={prompt}>
              <button
                type="button"
                className="w-full rounded-lg border-2 border-transparent bg-[var(--surface-raised)] px-3 py-3 text-left text-base font-semibold text-ink hover:border-royal"
                onClick={() => applyPrompt(prompt)}
              >
                {prompt}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor="story-input" className="sr-only">
          Your story
        </label>
        <textarea
          id="story-input"
          className="rof-textarea min-h-[10rem]"
          value={story}
          onChange={(event) => setStory(event.target.value)}
          placeholder="Once upon a time…"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="submit" className="rof-btn rof-btn-primary">
            Save story
          </button>
          {saved ? (
            <p className="text-base font-bold text-royal-dark" role="status">
              Story saved for {companionName} — cloud sync coming with Supabase.
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
