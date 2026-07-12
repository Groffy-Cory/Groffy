"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PrivacyNotice } from "@/components/auth/PrivacyNotice";
import { ModalShell } from "@/components/features/ModalShell";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { DEFAULT_COMPANION_NAME } from "@/lib/constants";

export function SettingsModal() {
  const {
    settingsOpen,
    closeSettings,
    companionName,
    userName,
    isGuest,
    profile,
    updateCompanionName,
    updateDisplayName,
    signOut,
  } = useAuth();
  const { prefs, updatePrefs, syncSource } = usePreferences();

  const [name, setName] = useState(companionName);
  const [displayName, setDisplayName] = useState(userName);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!settingsOpen) return;
    setName(companionName);
    setDisplayName(userName);
    setMessage(null);
    setError(null);
  }, [settingsOpen, companionName, userName]);

  if (!settingsOpen) return null;

  async function handleSaveNames(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const companionError = await updateCompanionName(name);
      const displayError = await updateDisplayName(displayName);
      if (companionError || displayError) {
        setError(companionError || displayError);
        return;
      }
      setMessage(
        `Saved. Your companion is now called ${name.trim() || DEFAULT_COMPANION_NAME}.`,
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    closeSettings();
    await signOut();
  }

  const notificationsOn = prefs.remindersNotificationsEnabled;
  const onPremMode = prefs.onPremMode;

  return (
    <ModalShell
      title="Settings"
      subtitle="Change your companion name, reminders, and account."
      footerNote={
        isGuest
          ? "Guest mode — saved on this device"
          : profile.email
            ? `Signed in as ${profile.email}`
            : "Signed in"
      }
      onClose={closeSettings}
    >
      <div className="mx-auto max-w-xl space-y-8">
        <form onSubmit={handleSaveNames} className="space-y-5">
          <div>
            <label
              htmlFor="companion-name"
              className="mb-2 block text-xl font-bold text-ink"
            >
              Companion name
            </label>
            <input
              id="companion-name"
              className="rof-input text-xl"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={DEFAULT_COMPANION_NAME}
              maxLength={40}
              autoComplete="off"
            />
            <p className="mt-2 text-lg font-semibold text-muted">
              Default is {DEFAULT_COMPANION_NAME}. This name shows in the
              greeting, chat, and everywhere else.
            </p>
          </div>

          <div>
            <label
              htmlFor="settings-display-name"
              className="mb-2 block text-xl font-bold text-ink"
            >
              Your name
            </label>
            <input
              id="settings-display-name"
              className="rof-input text-xl"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Friend"
              maxLength={40}
              autoComplete="given-name"
            />
          </div>

          {error ? (
            <p
              className="text-lg font-bold text-[color:var(--royal-dark,#8b1f2e)]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="text-lg font-semibold text-muted" role="status">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            className="rof-btn rof-btn-primary w-full min-h-14 text-xl"
            disabled={busy}
          >
            {busy ? "Saving…" : "Save names"}
          </button>
          <p className="text-base font-semibold text-muted">
            {isGuest
              ? "Names are saved on this device."
              : "Companion name is saved to your Supabase profile."}
          </p>
        </form>

        <section
          className="rof-inset space-y-3 p-4 sm:p-5"
          aria-labelledby="notifications-heading"
        >
          <h3
            id="notifications-heading"
            className="text-xl font-bold text-ink"
          >
            Reminders &amp; notifications
          </h3>
          <p className="text-lg font-semibold text-muted">
            Turn on to see upcoming reminders in the sidebar.
          </p>
          <button
            type="button"
            role="switch"
            aria-checked={notificationsOn}
            aria-labelledby="notifications-heading"
            className={[
              "flex w-full min-h-16 items-center justify-between gap-4 rounded-2xl border-2 px-4 py-3 text-left transition-colors",
              notificationsOn
                ? "border-royal bg-royal text-white"
                : "border-steel-200 bg-[var(--surface-raised)] text-ink",
            ].join(" ")}
            onClick={() =>
              updatePrefs({
                remindersNotificationsEnabled: !notificationsOn,
              })
            }
          >
            <span className="text-xl font-bold">
              {notificationsOn ? "On" : "Off"}
            </span>
            <span
              className={[
                "inline-flex h-10 w-20 items-center rounded-full border-2 px-1",
                notificationsOn
                  ? "justify-end border-white/40 bg-white/20"
                  : "justify-start border-steel-200 bg-steel-50",
              ].join(" ")}
              aria-hidden
            >
              <span
                className={[
                  "h-7 w-7 rounded-full",
                  notificationsOn ? "bg-white" : "bg-royal",
                ].join(" ")}
              />
            </span>
          </button>
          <p className="text-base font-semibold text-muted">
            Preference saved{" "}
            {syncSource === "supabase" ? "to your account" : "on this device"}.
          </p>
        </section>

        <section
          className="rof-inset space-y-3 p-4 sm:p-5"
          aria-labelledby="onprem-heading"
        >
          <h3 id="onprem-heading" className="text-xl font-bold text-ink">
            On-Prem Mode
          </h3>
          <p className="text-lg font-semibold text-muted">
            Use local hardware for AI instead of the cloud. Ready for a future
            Mac Studio model.
          </p>
          <button
            type="button"
            role="switch"
            aria-checked={onPremMode}
            aria-labelledby="onprem-heading"
            className={[
              "flex w-full min-h-16 items-center justify-between gap-4 rounded-2xl border-2 px-4 py-3 text-left transition-colors",
              onPremMode
                ? "border-royal bg-royal text-white"
                : "border-steel-200 bg-[var(--surface-raised)] text-ink",
            ].join(" ")}
            onClick={() => updatePrefs({ onPremMode: !onPremMode })}
          >
            <span className="text-xl font-bold">
              {onPremMode ? "On" : "Off"}
            </span>
            <span
              className={[
                "inline-flex h-10 w-20 items-center rounded-full border-2 px-1",
                onPremMode
                  ? "justify-end border-white/40 bg-white/20"
                  : "justify-start border-steel-200 bg-steel-50",
              ].join(" ")}
              aria-hidden
            >
              <span
                className={[
                  "h-7 w-7 rounded-full",
                  onPremMode ? "bg-white" : "bg-royal",
                ].join(" ")}
              />
            </span>
          </button>
          {onPremMode ? (
            <p className="text-lg font-bold text-ink" role="status">
              Running on local hardware
            </p>
          ) : (
            <p className="text-base font-semibold text-muted">
              When off, chat and AI features use the cloud (Grok) when
              configured.
            </p>
          )}
        </section>

        <section
          className="rof-inset space-y-2 p-4 sm:p-5"
          aria-labelledby="connection-heading"
        >
          <h3 id="connection-heading" className="text-xl font-bold text-ink">
            Family Portal connection
          </h3>
          <p className="text-lg font-semibold text-muted">
            Share this Connection ID with family so they can link in the Family
            Portal.
          </p>
          {profile.id && profile.id !== "local-guest" ? (
            <p className="break-all rounded-xl border-2 border-steel-200 bg-[var(--surface-raised)] px-4 py-3 text-base font-bold text-ink">
              {profile.id}
            </p>
          ) : (
            <p className="text-base font-semibold text-muted">
              Sign in (not guest) to get a Connection ID for family.
            </p>
          )}
        </section>

        <PrivacyNotice compact />

        <button
          type="button"
          className="rof-btn rof-btn-secondary w-full min-h-14 text-xl"
          onClick={() => void handleLogout()}
        >
          {isGuest ? "Leave guest mode" : "Log out"}
        </button>
      </div>
    </ModalShell>
  );
}
