"use client";

import { PRIVACY_HEADING, PRIVACY_STATEMENT } from "@/lib/privacy";

type PrivacyNoticeProps = {
  /** Slightly tighter padding for Settings vs login */
  compact?: boolean;
};

export function PrivacyNotice({ compact = false }: PrivacyNoticeProps) {
  return (
    <aside
      className={[
        "rof-inset border-2 border-[color:var(--accent-gold,#9a7428)]",
        compact ? "space-y-2 p-4 sm:p-5" : "space-y-3 p-4 sm:p-5",
      ].join(" ")}
      aria-labelledby="privacy-notice-heading"
      role="note"
    >
      <h2
        id="privacy-notice-heading"
        className={[
          "font-bold text-ink",
          compact ? "text-xl" : "text-xl sm:text-2xl",
        ].join(" ")}
      >
        {PRIVACY_HEADING}
      </h2>
      <p
        className={[
          "font-semibold leading-relaxed text-ink",
          compact ? "text-lg" : "text-lg sm:text-xl",
        ].join(" ")}
      >
        {PRIVACY_STATEMENT}
      </p>
      <p className="text-base font-semibold text-muted">
        We built this for peace of mind — your stories stay yours.
      </p>
    </aside>
  );
}
