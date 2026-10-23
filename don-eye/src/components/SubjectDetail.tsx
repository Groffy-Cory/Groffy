"use client";

import Link from "next/link";
import type { SubjectCard } from "@/lib/subjects";

type SubjectDetailProps = {
  subject: SubjectCard;
};

export function SubjectDetail({ subject }: SubjectDetailProps) {
  return (
    <div className="space-y-4">
      <p className="text-base font-semibold leading-relaxed text-[color:var(--ink-soft)]">
        {subject.blurb}
      </p>
      <ul className="space-y-2">
        {subject.detail.map((line) => (
          <li
            key={line}
            className="rounded-lg border border-[color:var(--steel)] bg-white/55 px-3 py-2 text-sm font-semibold text-[color:var(--ink-soft)]"
          >
            {line}
          </li>
        ))}
      </ul>
      <Link
        href={subject.href}
        className={`don-btn ${subject.tone === "royal" ? "don-btn-royal" : "don-btn-primary"}`}
      >
        Open {subject.title} page
      </Link>
    </div>
  );
}
