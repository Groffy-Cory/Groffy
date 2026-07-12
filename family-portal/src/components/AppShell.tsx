"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AddMemoryPanel } from "@/components/AddMemoryPanel";
import { LinkLovedOneScreen } from "@/components/LinkLovedOneScreen";
import { LoginScreen } from "@/components/LoginScreen";
import { SendNotePanel } from "@/components/SendNotePanel";
import { VaultPanel } from "@/components/VaultPanel";
import { getRofAppUrl } from "@/lib/supabase/client";

type TabId = "home" | "add" | "note" | "vault";

export function AppShell() {
  const {
    ready,
    needsAuth,
    needsLink,
    displayName,
    activeLovedOne,
    links,
    activeOwnerId,
    setActiveOwnerId,
    connectLovedOne,
    signOut,
  } = useAuth();
  const [tab, setTab] = useState<TabId>("home");
  const [extraLink, setExtraLink] = useState("");
  const [linkMessage, setLinkMessage] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="fp-card p-6 text-lg font-semibold text-[color:var(--muted)]">
          Loading…
        </p>
      </div>
    );
  }

  if (needsAuth) return <LoginScreen />;
  if (needsLink) return <LinkLovedOneScreen />;

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 p-3 sm:p-5">
      <header className="fp-card flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--accent)]">
            Real Family Stories
          </p>
          <h1
            className="text-3xl font-semibold sm:text-4xl"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Family Portal
          </h1>
          <p className="mt-1 text-lg font-semibold text-[color:var(--muted)]">
            Hello {displayName}
            {activeLovedOne ? ` · Sharing with ${activeLovedOne.ownerName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={getRofAppUrl()} className="fp-btn fp-btn-secondary">
            Open ROF app
          </a>
          <button
            type="button"
            className="fp-btn fp-btn-secondary"
            onClick={() => void signOut()}
          >
            Log out
          </button>
        </div>
      </header>

      {links.length > 1 ? (
        <div className="fp-card px-5 py-4">
          <label htmlFor="loved-one-select" className="mb-2 block text-lg font-bold">
            Choose loved one
          </label>
          <select
            id="loved-one-select"
            className="fp-select"
            value={activeOwnerId ?? ""}
            onChange={(e) => setActiveOwnerId(e.target.value)}
          >
            {links.map((link) => (
              <option key={link.ownerId} value={link.ownerId}>
                {link.ownerName}
                {link.ownerEmail ? ` (${link.ownerEmail})` : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <nav className="fp-card grid grid-cols-2 gap-2 p-3 sm:grid-cols-4" aria-label="Portal sections">
        {(
          [
            ["home", "Home"],
            ["add", "Add memory"],
            ["note", "Send note"],
            ["vault", "Memory Vault"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="fp-btn fp-btn-secondary fp-nav-btn text-lg"
            aria-current={tab === id ? "page" : undefined}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="pb-8">
        {tab === "home" ? (
          <section className="fp-card space-y-5 p-5 sm:p-6">
            <h2
              className="text-3xl font-semibold"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Welcome
            </h2>
            <p className="text-lg font-semibold text-[color:var(--muted)]">
              This portal uses the same Supabase database as the main Real Old
              Friend app. What you share here shows up for your loved one.
            </p>
            <ul className="space-y-3 text-lg font-semibold">
              <li className="fp-inset p-4">Add stories, photos, and voice notes</li>
              <li className="fp-inset p-4">Send short notes to their Messages inbox</li>
              <li className="fp-inset p-4">Browse the shared Memory Vault</li>
            </ul>

            <div className="border-t-2 border-[color:var(--border)] pt-5">
              <h3 className="text-xl font-bold">Connect another loved one</h3>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  className="fp-input"
                  value={extraLink}
                  onChange={(e) => setExtraLink(e.target.value)}
                  placeholder="Their email or Connection ID"
                />
                <button
                  type="button"
                  className="fp-btn fp-btn-primary shrink-0"
                  onClick={async () => {
                    const message = await connectLovedOne(extraLink);
                    setLinkMessage(message || "Connected.");
                    if (!message) setExtraLink("");
                  }}
                >
                  Connect
                </button>
              </div>
              {linkMessage ? (
                <p className="mt-2 text-base font-semibold text-[color:var(--muted)]">
                  {linkMessage}
                </p>
              ) : null}
            </div>
          </section>
        ) : null}
        {tab === "add" ? <AddMemoryPanel /> : null}
        {tab === "note" ? <SendNotePanel /> : null}
        {tab === "vault" ? <VaultPanel /> : null}
      </main>
    </div>
  );
}
