"use client";

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footerNote,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footerNote?: string;
}) {
  return (
    <div
      className="rof-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="rof-card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-steel-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-base font-semibold text-muted">
                {subtitle}
              </p>
            ) : null}
            {footerNote ? (
              <p className="mt-1 text-sm font-bold text-[color:var(--accent-gold,var(--royal-dark))]">
                {footerNote}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
