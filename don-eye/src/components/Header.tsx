"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteSearch } from "@/components/SiteSearch";
import { useViewMode } from "@/components/ViewModeProvider";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";

export function Header() {
  const { mode, setMode } = useViewMode();

  return (
    <header className="don-header don-metal sticky top-0 z-30 rounded-xl px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label={`${APP_NAME} home`}
        >
          <div className="don-logo-frame shrink-0 bg-white">
            <Image
              src="/don-eye-logo.png"
              alt=""
              width={72}
              height={72}
              priority
              className="h-14 w-14 object-contain sm:h-16 sm:w-16"
            />
          </div>
          <span className="min-w-0">
            <span
              className="block truncate text-2xl font-semibold tracking-wide text-[color:var(--steel-bright)] sm:text-3xl"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              {APP_NAME}
            </span>
            <span className="mt-1 block text-sm font-semibold text-[#e8d9c8] sm:text-base">
              {APP_TAGLINE}
            </span>
          </span>
        </Link>

        <div className="flex min-w-[12rem] flex-1 flex-wrap items-center justify-end gap-2 sm:min-w-[18rem]">
          <div className="w-full max-w-sm flex-1 sm:flex-none sm:w-56 md:w-72">
            <SiteSearch
              id="header-site-search"
              placeholder="Search this site…"
              compact
            />
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="View mode">
            <button
              type="button"
              className={`don-btn text-sm ${
                mode === "client" ? "don-btn-royal" : "don-btn-ghost"
              }`}
              onClick={() => setMode("client")}
              aria-pressed={mode === "client"}
            >
              Client view
            </button>
            <button
              type="button"
              className={`don-btn text-sm ${
                mode === "admin" ? "don-btn-primary" : "don-btn-ghost"
              }`}
              onClick={() => setMode("admin")}
              aria-pressed={mode === "admin"}
            >
              Admin view
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
