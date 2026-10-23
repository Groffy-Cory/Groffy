"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AboutUsContent } from "@/components/AboutUsContent";
import { SubjectDetail } from "@/components/SubjectDetail";
import { useWindows } from "@/components/windows/window-context";
import { NAVIGATE_IDS, SIDEBAR_NAV } from "@/lib/nav";
import { subjectById, type SubjectId } from "@/lib/subjects";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openWindow } = useWindows();

  function openSubject(id: SubjectId) {
    const subject = subjectById(id);
    if (!subject) return;
    openWindow({
      id: `subject-${subject.id}`,
      title: subject.title,
      width: 560,
      height: 480,
      content: <SubjectDetail subject={subject} />,
    });
  }

  function openAboutUs() {
    openWindow({
      id: "about-us",
      title: "About us",
      width: 520,
      height: 420,
      x: 100,
      y: 100,
      content: <AboutUsContent />,
    });
  }

  return (
    <aside
      className="don-sidebar don-metal relative z-10 flex h-auto min-h-0 w-full flex-col rounded-xl lg:h-full lg:w-72 xl:w-80"
      aria-label="Primary"
    >
      <div className="border-b border-[color:var(--steel-dark)] px-2 py-3">
        <button
          type="button"
          className="don-nav-btn don-nav-rof w-full justify-center text-center font-bold"
          onClick={openAboutUs}
        >
          About us
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Sidebar">
        <ul className="flex flex-col gap-1.5">
          {SIDEBAR_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const className =
              item.kind === "rof" ? "don-nav-btn don-nav-rof" : "don-nav-btn";

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={className}
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    openSubject(item.id as SubjectId);
                    if (NAVIGATE_IDS.has(item.id)) {
                      router.push(item.href);
                    }
                  }}
                >
                  {item.kind === "rof" ? (
                    <Image
                      src="/rof-logo.png"
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-[color:var(--steel-bright)]"
                    />
                  ) : null}
                  <span className="leading-snug">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
