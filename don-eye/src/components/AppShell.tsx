"use client";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ViewModeProvider } from "@/components/ViewModeProvider";
import { WindowManager } from "@/components/windows/WindowManager";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ViewModeProvider>
      <WindowManager>
        <div className="mx-auto flex min-h-[100dvh] max-w-[1600px] flex-col gap-3 p-2 sm:p-3">
          <Header />

          <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
            <div className="shrink-0 lg:sticky lg:top-[6.5rem] lg:h-[calc(100dvh-7.5rem)] lg:self-start">
              <Sidebar />
            </div>

            <main className="don-main relative z-0 min-w-0 flex-1 pb-6 lg:min-h-[calc(100dvh-7.5rem)]">
              {children}
            </main>
          </div>
        </div>
      </WindowManager>
    </ViewModeProvider>
  );
}
