import { PageHeading } from "@/components/PageHeading";

export default function SpiritCleansePage() {
  return (
    <div>
      <PageHeading
        title="Spirit Cleanse"
        description="Intentional reset — quiet, prayer, or reflection without distraction."
      />
      <div className="don-inset space-y-4 p-5 sm:p-6">
        <p className="text-lg font-semibold leading-relaxed text-[color:var(--muted)]">
          This lane is deliberately calm. Add guided audio, scripture rotation, or a
          timed breathing exercise when you are ready.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-base font-semibold">
          <li>Silence notifications for ten minutes.</li>
          <li>Name one person you will serve well today.</li>
          <li>Release one grudge — write it down and discard it.</li>
        </ol>
        <button type="button" className="don-btn don-btn-primary" disabled>
          Start 10-minute cleanse (preview)
        </button>
      </div>
    </div>
  );
}
