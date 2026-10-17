import { PageHeading } from "@/components/PageHeading";
import { getRofAppUrl } from "@/lib/config";

export default function RealOldFriendPage() {
  const rofUrl = getRofAppUrl();

  return (
    <div>
      <PageHeading
        title="Real Old Friend"
        description="The senior companion app — stories, mood, meals, reminders, and Talk with Rofy."
      />

      <div className="don-inset space-y-4 p-5 sm:p-6">
        <p className="text-lg font-semibold leading-snug text-[color:var(--muted)]">
          The DON Eye sits alongside Real Old Friend. Use this command center for
          organization-wide lanes; open ROF for day-to-day companion care.
        </p>
        <ul className="space-y-2 text-base font-semibold">
          <li className="rounded-lg border border-[color:var(--border)] px-4 py-3">
            Share stories and photos with family via the Family Portal
          </li>
          <li className="rounded-lg border border-[color:var(--border)] px-4 py-3">
            Check in on mood, healthy choices, and daily specials
          </li>
          <li className="rounded-lg border border-[color:var(--border)] px-4 py-3">
            Voice-enabled chat with your companion
          </li>
        </ul>
        <a
          href={rofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="don-btn don-btn-primary inline-flex"
        >
          Open Real Old Friend ↗
        </a>
        <p className="text-sm font-semibold text-[color:var(--muted)]">
          Set <code className="text-[color:var(--steel-bright)]">NEXT_PUBLIC_ROF_APP_URL</code>{" "}
          in <code className="text-[color:var(--steel-bright)]">don-eye/.env.local</code> for
          production.
        </p>
      </div>
    </div>
  );
}
