import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <section className="rof-card w-full max-w-lg p-6 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--accent-gold,var(--royal-dark))]">
          {APP_TAGLINE}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink">
          You’re offline
        </h1>
        <p className="mt-3 text-lg font-semibold leading-relaxed text-muted">
          {APP_NAME} will reconnect when your internet is back. You can still
          open the home screen and use what was saved on this device.
        </p>
        <Link href="/" className="rof-btn rof-btn-primary mt-6 inline-flex min-h-14 w-full text-lg">
          Try home again
        </Link>
      </section>
    </main>
  );
}
