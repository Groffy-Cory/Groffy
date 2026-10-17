"use client";

import Image from "next/image";
import Link from "next/link";
import { APP_MOTTO, APP_NAME } from "@/lib/config";
import { formatLongDate } from "@/lib/daily-content";

export function Header() {
  const today = formatLongDate();

  return (
    <header className="don-card flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4">
      <Link
        href="/"
        className="flex min-w-0 items-center gap-3"
        aria-label={`${APP_NAME} home`}
      >
        <div className="don-logo-frame shrink-0 overflow-hidden rounded-lg">
          <Image
            src="/don-eye-logo.png"
            alt={`${APP_NAME} crest`}
            width={64}
            height={64}
            priority
            className="h-14 w-14 object-cover sm:h-16 sm:w-16"
          />
        </div>
        <span className="min-w-0">
          <span
            className="block truncate text-2xl font-semibold tracking-wide text-[color:var(--steel-bright)] sm:text-3xl"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            {APP_NAME}
          </span>
          <span className="don-motto mt-0.5 block truncate">{APP_MOTTO}</span>
        </span>
      </Link>

      <div className="text-right">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
          Today
        </p>
        <p className="text-base font-semibold text-[color:var(--ink)] sm:text-lg">
          {today}
        </p>
      </div>
    </header>
  );
}
