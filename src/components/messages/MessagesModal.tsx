"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMessages } from "@/components/messages/MessagesProvider";
import {
  formatMessageTime,
  previewText,
} from "@/lib/messages/storage";
import {
  MESSAGE_SOURCES,
  getSourceLabel,
  type Message,
  type MessageSourceId,
} from "@/lib/messages/types";

type View =
  | { mode: "list"; filter: MessageSourceId | "all" }
  | { mode: "detail"; messageId: string }
  | { mode: "compose"; replyToId?: string | null }
  | { mode: "group" };

export function MessagesModal() {
  const {
    isOpen,
    closeMessages,
    messages,
    unreadCount,
    addMessage,
    markRead,
    markAllRead,
    getThread,
  } = useMessages();

  const [view, setView] = useState<View>({ mode: "list", filter: "all" });
  const [composeBody, setComposeBody] = useState("");
  const [composeSource, setComposeSource] =
    useState<MessageSourceId>("personal");
  const [replyBody, setReplyBody] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setView({ mode: "list", filter: "all" });
    setComposeBody("");
    setReplyBody("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMessages();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeMessages]);

  const listMessages = useMemo(() => {
    const roots = messages.filter((message) => !message.replyToId);
    if (view.mode !== "list") return roots;
    if (view.filter === "all") {
      return roots.filter((message) => message.source !== "group");
    }
    return roots.filter((message) => message.source === view.filter);
  }, [messages, view]);

  if (!isOpen) return null;

  function openDetail(message: Message) {
    markRead(message.id);
    setReplyBody("");
    setView({ mode: "detail", messageId: message.id });
  }

  async function handleCompose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!composeBody.trim()) return;
    const created = await addMessage({
      source: composeSource,
      sender: composeSource === "personal" ? "You" : "You",
      body: composeBody,
      replyToId: view.mode === "compose" ? view.replyToId ?? null : null,
    });
    setComposeBody("");
    setView({ mode: "detail", messageId: created.replyToId || created.id });
  }

  async function handleReply(event: FormEvent<HTMLFormElement>, messageId: string) {
    event.preventDefault();
    if (!replyBody.trim()) return;
    const root = messages.find((message) => message.id === messageId);
    if (!root) return;
    await addMessage({
      source: root.source === "group" ? "group" : "personal",
      sender: "You",
      body: replyBody,
      replyToId: messageId,
    });
    setReplyBody("");
  }

  const detailThread =
    view.mode === "detail" ? getThread(view.messageId) : [];
  const detailRoot = detailThread[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
      role="presentation"
      onClick={closeMessages}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="messages-title"
        className="rof-card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-steel-200 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="messages-title"
              className="font-display text-3xl font-semibold text-ink"
            >
              Messages
            </h2>
            <p className="mt-1 text-base font-semibold text-muted">
              Family notes, doctor notes, and your own — large and easy to read.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 ? (
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                onClick={markAllRead}
              >
                Mark all read
              </button>
            ) : null}
            <button
              type="button"
              className="rof-btn rof-btn-secondary"
              onClick={closeMessages}
            >
              Close
            </button>
          </div>
        </div>

        {view.mode === "list" ? (
          <>
            <div className="flex gap-2 overflow-x-auto border-b-2 border-steel-200 px-3 py-3 sm:px-4">
              <FilterChip
                label="All"
                active={view.filter === "all"}
                onClick={() => setView({ mode: "list", filter: "all" })}
              />
              {MESSAGE_SOURCES.map((source) => (
                <FilterChip
                  key={source.id}
                  label={source.shortLabel}
                  active={view.filter === source.id}
                  onClick={() =>
                    source.id === "group"
                      ? setView({ mode: "group" })
                      : setView({ mode: "list", filter: source.id })
                  }
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-3 border-b-2 border-steel-200 px-4 py-3">
              <button
                type="button"
                className="rof-btn rof-btn-primary"
                onClick={() => {
                  setComposeSource("personal");
                  setView({ mode: "compose" });
                }}
              >
                Write a new message
              </button>
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                onClick={() => setView({ mode: "group" })}
              >
                Family group chat
              </button>
            </div>

            <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {listMessages.length === 0 ? (
                <li className="rof-inset p-5 text-lg font-semibold text-muted">
                  No messages here yet.
                </li>
              ) : (
                listMessages.map((message) => (
                  <li key={message.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(message)}
                      className="rof-inset w-full p-4 text-left transition-colors hover:border-[color:var(--royal)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-royal"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[color:var(--accent-gold,var(--royal-dark))]">
                            {getSourceLabel(message.source)}
                          </p>
                          <p className="mt-1 text-xl font-bold text-ink">
                            {message.sender}
                            {!message.read ? (
                              <span className="ml-2 rounded-full bg-royal px-2 py-0.5 text-xs font-bold text-white">
                                New
                              </span>
                            ) : null}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-muted">
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-muted">
                        {previewText(message.body)}
                      </p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </>
        ) : null}

        {view.mode === "detail" && detailRoot ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b-2 border-steel-200 px-4 py-3">
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                onClick={() => setView({ mode: "list", filter: "all" })}
              >
                Back to list
              </button>
              <p className="text-base font-bold text-muted">
                {getSourceLabel(detailRoot.source)}
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              {detailThread.map((message) => (
                <article key={message.id} className="rof-inset p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-xl font-bold text-ink">{message.sender}</p>
                    <p className="text-sm font-bold text-muted">
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-lg font-semibold leading-relaxed text-ink">
                    {message.body}
                  </p>
                </article>
              ))}
            </div>

            <form
              onSubmit={(event) => handleReply(event, detailRoot.id)}
              className="border-t-2 border-steel-200 p-4 sm:p-5"
            >
              <label
                htmlFor="message-reply"
                className="mb-2 block text-base font-bold text-ink"
              >
                Write a reply
              </label>
              <textarea
                id="message-reply"
                className="rof-textarea text-lg"
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                placeholder="Type your reply here…"
                required
              />
              <button type="submit" className="rof-btn rof-btn-primary mt-3">
                Send reply
              </button>
            </form>
          </div>
        ) : null}

        {view.mode === "compose" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
            <button
              type="button"
              className="rof-btn rof-btn-secondary self-start"
              onClick={() => setView({ mode: "list", filter: "all" })}
            >
              Back to list
            </button>
            <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
              Write a new message
            </h3>
            <form onSubmit={handleCompose} className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-base font-bold text-ink">Who is it for?</p>
                <div className="flex flex-wrap gap-2">
                  {MESSAGE_SOURCES.filter((source) => source.id !== "group").map(
                    (source) => (
                      <FilterChip
                        key={source.id}
                        label={source.label}
                        active={composeSource === source.id}
                        onClick={() => setComposeSource(source.id)}
                      />
                    ),
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="compose-body"
                  className="mb-2 block text-base font-bold text-ink"
                >
                  Your message
                </label>
                <textarea
                  id="compose-body"
                  className="rof-textarea min-h-[10rem] text-lg"
                  value={composeBody}
                  onChange={(event) => setComposeBody(event.target.value)}
                  placeholder="Write clearly. Take your time."
                  required
                />
              </div>
              <button type="submit" className="rof-btn rof-btn-primary">
                Send message
              </button>
            </form>
          </div>
        ) : null}

        {view.mode === "group" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
            <button
              type="button"
              className="rof-btn rof-btn-secondary self-start"
              onClick={() => setView({ mode: "list", filter: "all" })}
            >
              Back to list
            </button>
            <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
              Family group chat
            </h3>
            <p className="mt-2 text-lg font-semibold text-muted">
              Coming soon — a shared place for the whole family to talk together.
              For now, here is a preview.
            </p>
            <div className="mt-5 space-y-3">
              {messages
                .filter((message) => message.source === "group")
                .map((message) => (
                  <article key={message.id} className="rof-inset p-4">
                    <p className="text-lg font-bold text-ink">{message.sender}</p>
                    <p className="mt-1 text-sm font-bold text-muted">
                      {formatMessageTime(message.createdAt)}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-ink">
                      {message.body}
                    </p>
                  </article>
                ))}
            </div>
            <button
              type="button"
              className="rof-btn rof-btn-secondary mt-5 self-start"
              disabled
            >
              Group chat opens soon
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rof-btn min-h-12 shrink-0 px-4",
        active ? "rof-btn-primary" : "rof-btn-secondary",
      ].join(" ")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
