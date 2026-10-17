type PageHeadingProps = {
  title: string;
  description: string;
};

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <header className="mb-6 border-b border-[color:var(--border)] pb-5">
      <h1
        className="text-3xl font-semibold text-[color:var(--steel-bright)] sm:text-4xl"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        {title}
      </h1>
      <p className="mt-2 max-w-3xl text-lg font-semibold leading-snug text-[color:var(--muted)]">
        {description}
      </p>
    </header>
  );
}
