"use client";

import { useState } from "react";
import { PageHeading } from "@/components/PageHeading";

const STARTER_PROMPTS = [
  "Summarize my priorities for today in three bullets.",
  "Draft a respectful reminder email about tomorrow’s meeting.",
  "What should I review in Guidelines before approving time off?",
];

export function AssistantPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: "I’m your Grok-based assistant (preview). Ask a question or pick a starter — live API wiring can mirror Real Old Friend’s chat route when you’re ready.",
    },
  ]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      {
        role: "assistant",
        text: "Preview mode: connect xAI Grok here to answer with your org context. Your message was received.",
      },
    ]);
    setInput("");
  }

  return (
    <div>
      <PageHeading
        title="Assistant"
        description="Virtual assistant powered by Grok — drafts, lookups, and calm explanations on demand."
      />

      <div className="don-inset flex max-h-[min(420px,50vh)] flex-col overflow-hidden">
        <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <li
              key={`${msg.role}-${i}`}
              className={
                msg.role === "user"
                  ? "ml-8 rounded-lg bg-[rgba(139,36,50,0.35)] px-3 py-2 text-base font-semibold"
                  : "mr-8 rounded-lg bg-[rgba(255,255,255,0.06)] px-3 py-2 text-base font-semibold text-[color:var(--muted)]"
              }
            >
              {msg.text}
            </li>
          ))}
        </ul>

        <form
          className="flex flex-col gap-2 border-t border-[color:var(--border)] p-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            className="min-h-12 flex-1 rounded-lg border border-[color:var(--border)] bg-[rgba(0,0,0,0.25)] px-3 text-base font-semibold text-[color:var(--ink)]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the assistant…"
            aria-label="Message to assistant"
          />
          <button type="submit" className="don-btn don-btn-primary shrink-0">
            Send
          </button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="don-btn don-btn-secondary text-sm"
            onClick={() => send(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
