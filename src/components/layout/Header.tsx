"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { APP_NAME, APP_TAGLINE, DEFAULT_COMPANION_NAME } from "@/lib/constants";
import { formatHeaderDate, getTimeSensitiveGreeting } from "@/lib/greeting";

type HeaderProps = {
  companionName?: string;
  userName?: string;
};

export function Header({
  companionName = DEFAULT_COMPANION_NAME,
  userName = "Friend",
}: HeaderProps) {
  const { openSettings, isGuest } = useAuth();
  const { prefs } = usePreferences();
  const [greeting, setGreeting] = useState("Welcome");
  const [today, setToday] = useState("");

  useEffect(() => {
    setGreeting(getTimeSensitiveGreeting(userName));
    setToday(formatHeaderDate());
  }, [userName]);

  return (
    <div className="sticky top-0 z-20 mx-2 mt-2 space-y-2 sm:mx-4 sm:mt-3">
      <header className="rof-card flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
        <Link
          href="/"
          className="flex min-h-12 min-w-0 items-center focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-royal"
          aria-label={`${APP_NAME} home`}
        >
          <Image
            src="/rof-logo.png"
            alt={`${APP_NAME} logo`}
            width={56}
            height={56}
            priority
            className="rof-logo-ring h-11 w-11 shrink-0 rounded-full object-cover shadow-md sm:h-14 sm:w-14"
          />
          <span className="ml-3 min-w-0 leading-tight">
            <span className="font-display block truncate text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {APP_NAME}
            </span>
            <span className="block truncate text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--accent-gold,#1e44c4)] sm:text-sm">
              {APP_TAGLINE}
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeSwitcher compact />
          <button
            type="button"
            className="rof-btn rof-btn-secondary min-h-12 px-4 text-base sm:min-h-14 sm:px-5 sm:text-lg"
            onClick={openSettings}
          >
            Settings
          </button>
        </div>
      </header>

      <section
        className="rof-card px-4 py-3 sm:px-5 sm:py-3.5"
        aria-label="Today’s greeting"
      >
        <p className="font-display text-xl font-semibold text-ink sm:text-2xl">
          {greeting}
        </p>
        <p className="mt-1 text-base font-semibold leading-snug text-muted sm:text-lg">
          <span className="block sm:inline">{today || "Loading today…"}</span>
          <span className="hidden sm:inline"> · </span>
          <span className="mt-0.5 block sm:mt-0 sm:inline">
            Your companion is{" "}
            <span className="text-[color:var(--accent-gold,var(--royal-dark))]">
              {companionName}
            </span>
            {isGuest ? " · Guest" : ""}
          </span>
        </p>
        {prefs.onPremMode ? (
          <p
            className="mt-3 rounded-xl border-2 border-[color:var(--accent-gold,#9a7428)] bg-[var(--surface-raised)] px-3 py-2 text-base font-bold text-ink sm:text-lg"
            role="status"
          >
            Running on local hardware
          </p>
        ) : null}
      </section>
    </div>
  );
}
