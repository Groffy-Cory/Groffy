"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { addVaultEntry, sendFamilyMessage } from "@/lib/vault";

export function SendNotePanel() {
  const { activeOwnerId, displayName } = useAuth();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!activeOwnerId || !body.trim()) return;
    setBusy(true);
    setError(null);
    setStatus(null);

    const messageError = await sendFamilyMessage({
      ownerId: activeOwnerId,
      sender: displayName,
      body: body.trim(),
    });

    const vaultResult = await addVaultEntry(activeOwnerId, {
      type: "family_message",
      title: "Note from family",
      body: body.trim(),
      contributedBy: displayName,
    });

    if (messageError && vaultResult.error) {
      setError(messageError);
      setBusy(false);
      return;
    }

    if (messageError) {
      setStatus(
        "Saved to Memory Vault. Inbox delivery needs the updated messages SQL policies.",
      );
    } else {
      setStatus("Sent! They’ll see it under Messages → From Family.");
    }

    setBody("");
    setBusy(false);
  }

  return (
    <section className="fp-card p-5 sm:p-6">
      <h2
        className="text-3xl font-semibold"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        Send a note
      </h2>
      <p className="mt-2 text-lg font-semibold text-[color:var(--muted)]">
        A short message for their ROF Messages inbox.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="note" className="mb-1 block text-lg font-bold">
            Your note
          </label>
          <textarea
            id="note"
            className="fp-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Thinking of you today…"
            required
          />
        </div>
        {error ? (
          <p className="text-lg font-bold text-[color:var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="text-lg font-semibold text-[color:var(--muted)]" role="status">
            {status}
          </p>
        ) : null}
        <button
          type="submit"
          className="fp-btn fp-btn-primary w-full text-xl"
          disabled={busy || !activeOwnerId}
        >
          {busy ? "Sending…" : "Send note"}
        </button>
      </form>
    </section>
  );
}
