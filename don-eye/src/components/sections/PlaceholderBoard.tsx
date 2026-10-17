import { PageHeading } from "@/components/PageHeading";

type PlaceholderBoardProps = {
  title: string;
  description: string;
  items: { title: string; meta: string; status?: string }[];
};

export function PlaceholderBoard({
  title,
  description,
  items,
}: PlaceholderBoardProps) {
  return (
    <div>
      <PageHeading title={title} description={description} />
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.title}
            className="don-inset flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          >
            <div>
              <p className="text-lg font-bold text-[color:var(--ink)]">{item.title}</p>
              <p className="text-sm font-semibold text-[color:var(--muted)]">{item.meta}</p>
            </div>
            {item.status ? (
              <span className="rounded-md border border-[color:var(--border)] px-2 py-1 text-xs font-bold uppercase tracking-wide text-[color:var(--steel)]">
                {item.status}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
