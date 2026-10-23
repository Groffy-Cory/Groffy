type PageIntroProps = {
  title: string;
  blurb: string;
};

export function PageIntro({ title, blurb }: PageIntroProps) {
  return (
    <header className="don-card mb-5 px-5 py-5 sm:px-6">
      <h1
        className="text-3xl font-semibold text-[color:var(--burgundy-deep)] sm:text-4xl"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        {title}
      </h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold leading-snug text-[color:var(--muted)]">
        {blurb}
      </p>
    </header>
  );
}
