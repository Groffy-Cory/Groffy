"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, NAV_ITEMS } from "@/lib/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  const byGroup = NAV_GROUPS.map((group) => ({
    ...group,
    items: NAV_ITEMS.filter((item) => item.group === group.id),
  }));

  return (
    <aside className="don-sidebar flex h-full min-h-0 w-full flex-col lg:w-72 xl:w-80">
      <div className="border-b border-[color:var(--border)] px-4 py-4">
        <h2
          className="text-lg font-semibold text-[color:var(--steel-bright)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Navigation
        </h2>
        <p className="mt-1 text-sm font-semibold text-[color:var(--muted)]">
          Scroll for every lane
        </p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Main">
        {byGroup.map((group) => (
          <div key={group.id} className="mb-4 last:mb-2">
            <p className="don-motto mb-2 px-2">{group.label}</p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const className = active ? "don-tab don-tab-active" : "don-tab";

                return (
                  <li key={item.id}>
                    <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[color:var(--border)] px-4 py-3">
        <p className="text-xs font-semibold leading-snug text-[color:var(--muted)]">
          Layout inspired by Real Old Friend &amp; Groffy — adjust tabs and wiring as you review.
        </p>
      </div>
    </aside>
  );
}
