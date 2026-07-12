"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getRofAppUrl } from "@/lib/supabase/client";

export function LoginScreen() {
  const {
    supabaseConfigured,
    signInWithPassword,
    signUpWithPassword,
  } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signin") {
        const message = await signInWithPassword(email, password);
        if (message) setError(message);
      } else {
        const message = await signUpWithPassword(email, password, displayName);
        if (message) setError(message);
        else {
          setInfo(
            "Account created. If email confirmation is on, check your inbox, then sign in.",
          );
          setMode("signin");
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <section className="fp-card w-full max-w-lg p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--accent)]">
          Real Family Stories
        </p>
        <h1
          className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Family Portal
        </h1>
        <p className="mt-3 text-lg font-semibold text-[color:var(--muted)]">
          Sign in to share stories, photos, and notes with your loved one’s Real
          Old Friend app.
        </p>

        {!supabaseConfigured ? (
          <p className="fp-inset mt-4 p-4 text-base font-semibold text-[color:var(--muted)]">
            Add the same Supabase keys as the main ROF app in
            family-portal/.env.local.
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={`fp-btn ${mode === "signin" ? "fp-btn-primary" : "fp-btn-secondary"}`}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`fp-btn ${mode === "signup" ? "fp-btn-primary" : "fp-btn-secondary"}`}
            onClick={() => setMode("signup")}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "signup" ? (
            <div>
              <label htmlFor="name" className="mb-1 block text-lg font-bold">
                Your first name
              </label>
              <input
                id="name"
                className="fp-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Example: Sarah"
                autoComplete="given-name"
              />
            </div>
          ) : null}
          <div>
            <label htmlFor="email" className="mb-1 block text-lg font-bold">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="fp-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-lg font-bold">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="fp-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          {error ? (
            <p className="text-lg font-bold text-[color:var(--danger)]" role="alert">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="text-lg font-semibold text-[color:var(--muted)]" role="status">
              {info}
            </p>
          ) : null}
          <button
            type="submit"
            className="fp-btn fp-btn-primary w-full text-xl"
            disabled={busy || !supabaseConfigured}
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <a
          href={getRofAppUrl()}
          className="fp-btn fp-btn-secondary mt-4 w-full text-lg"
        >
          Open main ROF app
        </a>
      </section>
    </div>
  );
}
