"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PrivacyNotice } from "@/components/auth/PrivacyNotice";
import { APP_NAME, APP_TAGLINE, DEFAULT_COMPANION_NAME } from "@/lib/constants";

export function LoginScreen() {
  const {
    supabaseConfigured,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    continueAsGuest,
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
            "Account created. If your email needs confirmation, check your inbox, then sign in here.",
          );
          setMode("signin");
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--page-bg,#e8e4dc)] p-4">
      <section className="rof-card w-full max-w-lg p-6 sm:p-8" aria-labelledby="login-heading">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--accent-gold,var(--royal-dark))]">
          {APP_TAGLINE}
        </p>
        <h1
          id="login-heading"
          className="mt-2 font-display text-4xl font-semibold text-ink"
        >
          Welcome to {APP_NAME}
        </h1>
        <p className="mt-3 text-lg font-semibold text-muted">
          Sign in with your email to open the app. Your companion starts as{" "}
          {DEFAULT_COMPANION_NAME} — you can rename them anytime in Settings.
        </p>

        <div className="mt-5">
          <PrivacyNotice />
        </div>

        {!supabaseConfigured ? (
          <p className="rof-inset mt-4 p-4 text-base font-semibold text-muted">
            Supabase isn’t connected yet. Use Continue as guest to explore, or
            add your keys in .env.local.
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Account options">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            className={[
              "rof-btn min-h-12",
              mode === "signin" ? "rof-btn-primary" : "rof-btn-secondary",
            ].join(" ")}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={[
              "rof-btn min-h-12",
              mode === "signup" ? "rof-btn-primary" : "rof-btn-secondary",
            ].join(" ")}
            onClick={() => setMode("signup")}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "signup" ? (
            <div>
              <label
                htmlFor="display-name"
                className="mb-1 block text-base font-bold text-ink"
              >
                Your first name
              </label>
              <input
                id="display-name"
                className="rof-input text-lg"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Example: Helen"
                autoComplete="given-name"
              />
            </div>
          ) : null}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-base font-bold text-ink"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="rof-input text-lg"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-base font-bold text-ink"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="rof-input text-lg"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              placeholder="At least 6 characters"
            />
          </div>

          {error ? (
            <p
              className="text-base font-bold text-[color:var(--royal-dark,#8b1f2e)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="text-base font-semibold text-muted" role="status">
              {info}
            </p>
          ) : null}

          <button
            type="submit"
            className="rof-btn rof-btn-primary w-full min-h-14 text-lg"
            disabled={busy || !supabaseConfigured}
          >
            {busy
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in and continue"
                : "Create account"}
          </button>
        </form>

        <div className="mt-5 space-y-3 border-t border-[color:var(--steel-200,#d4cfc4)] pt-5">
          <button
            type="button"
            className="rof-btn rof-btn-secondary w-full min-h-14 text-lg"
            disabled={busy || !supabaseConfigured}
            onClick={() => void signInWithGoogle()}
          >
            Continue with Google
          </button>

          <button
            type="button"
            className="rof-btn rof-btn-secondary w-full min-h-14 text-lg"
            onClick={() => continueAsGuest(displayName)}
          >
            Continue as guest
          </button>
        </div>
      </section>
    </div>
  );
}
