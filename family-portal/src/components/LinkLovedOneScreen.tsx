"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export function LinkLovedOneScreen() {
  const { connectLovedOne, displayName, signOut } = useAuth();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const message = await connectLovedOne(value);
      if (message) setError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <section className="fp-card w-full max-w-lg p-6 sm:p-8">
        <h1
          className="text-4xl font-semibold"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Connect to your loved one
        </h1>
        <p className="mt-3 text-lg font-semibold text-[color:var(--muted)]">
          Hi {displayName}. Enter the email they use in the Real Old Friend app,
          or the Connection ID from their Settings.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="loved-one" className="mb-1 block text-lg font-bold">
              Their email or Connection ID
            </label>
            <input
              id="loved-one"
              className="fp-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="helen@example.com"
              required
            />
          </div>
          {error ? (
            <p className="text-lg font-bold text-[color:var(--danger)]" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="fp-btn fp-btn-primary w-full text-xl"
            disabled={busy}
          >
            {busy ? "Connecting…" : "Connect"}
          </button>
        </form>

        <button
          type="button"
          className="fp-btn fp-btn-secondary mt-4 w-full"
          onClick={() => void signOut()}
        >
          Log out
        </button>
      </section>
    </div>
  );
}
