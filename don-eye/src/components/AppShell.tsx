"use client";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col p-2 sm:p-3">
      <Header />

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <div className="max-h-[40vh] shrink-0 lg:max-h-none lg:h-[calc(100dvh-8.5rem)]">
          <Sidebar />
        </div>

        <main className="don-card min-h-[50vh] min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:h-[calc(100dvh-8.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
