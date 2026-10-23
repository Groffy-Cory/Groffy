"use client";

import { useState } from "react";

const STARTERS = [
  "Draft a calm family update about today’s care plan change.",
  "Summarize three survey-ready documentation reminders.",
  "Suggest a 10-minute spirit cleanse for a busy afternoon.",
];

export function AssistantChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: "I’m Donnie’s Grok assistant (preview). Ask about care, regulations, or leadership wording — live Grok wiring can plug in next.",
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
        text: "Preview response: connect Grok here for live answers. Your note was received.",
      },
    ]);
    setInput("");
  }

  return (
    <div className="don-card overflow-hidden">
      <ul className="max-h-[min(420px,50vh)] space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
        {messages.map((msg, i) => (
          <li
            key={`${msg.role}-${i}`}
            className={
              msg.role === "user"
                ? "ml-8 rounded-xl bg-[color:var(--burgundy-soft)] px-3 py-2 text-base font-semibold text-[#f7f2ec]"
                : "mr-8 rounded-xl border border-[color:var(--steel)] bg-white/70 px-3 py-2 text-base font-semibold text-[color:var(--muted)]"
            }
          >
            {msg.text}
          </li>
        ))}
      </ul>

      <form
        className="flex flex-col gap-2 border-t-2 border-[color:var(--steel)] bg-[color:var(--parchment-deep)] p-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          className="don-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the assistant…"
          aria-label="Message to assistant"
        />
        <button type="submit" className="don-btn don-btn-primary shrink-0">
          Send
        </button>
      </form>

      <div className="flex flex-wrap gap-2 border-t border-[color:var(--steel)] px-3 py-3">
        {STARTERS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="don-btn don-btn-ghost text-sm"
            onClick={() => send(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
