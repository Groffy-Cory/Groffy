"use client";

import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { SettingsModal } from "@/components/auth/SettingsModal";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ExercisesModal } from "@/components/exercises/ExercisesModal";
import { ExercisesProvider } from "@/components/exercises/ExercisesProvider";
import { FeatureModals } from "@/components/features/FeatureModals";
import { ListsModal } from "@/components/lists/ListsModal";
import { ListsProvider } from "@/components/lists/ListsProvider";
import { MealsPantryModal } from "@/components/meals/MealsPantryModal";
import { MealsPantryProvider } from "@/components/meals/MealsPantryProvider";
import { MemoryVaultModal } from "@/components/memory-vault/MemoryVaultModal";
import { MemoryVaultProvider } from "@/components/memory-vault/MemoryVaultProvider";
import { MessagesModal } from "@/components/messages/MessagesModal";
import { MessagesProvider } from "@/components/messages/MessagesProvider";
import { PreferencesProvider } from "@/components/preferences/PreferencesProvider";
import { RemindersModal } from "@/components/reminders/RemindersModal";
import { RemindersProvider } from "@/components/reminders/RemindersProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { ready, needsAuth, companionName, userName } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="rof-card p-6 text-lg font-semibold text-muted">
          Loading…
        </p>
      </div>
    );
  }

  if (needsAuth) {
    return <LoginScreen />;
  }

  return (
    <PreferencesProvider>
      <RemindersProvider>
        <ExercisesProvider>
          <MessagesProvider>
            <MemoryVaultProvider>
              <ListsProvider>
                <MealsPantryProvider>
                  <div className="flex min-h-[100dvh] flex-col">
                    <Header
                      companionName={companionName}
                      userName={userName}
                    />

                    <div className="mx-2 mb-2 mt-2 flex min-h-0 flex-1 flex-col gap-3 sm:mx-4 sm:mb-3 sm:mt-3 lg:flex-row">
                      <div className="max-h-[36vh] shrink-0 sm:max-h-[40vh] lg:max-h-none lg:h-[calc(100dvh-11rem)]">
                        <Sidebar />
                      </div>

                      <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-0.5 pb-4 lg:h-[calc(100dvh-11rem)] lg:pb-2">
                        {children}
                      </main>
                    </div>
                  </div>
                  <RemindersModal />
                  <ExercisesModal />
                  <MessagesModal />
                  <MemoryVaultModal />
                  <ListsModal />
                  <MealsPantryModal />
                  <FeatureModals />
                  <SettingsModal />
                </MealsPantryProvider>
              </ListsProvider>
            </MemoryVaultProvider>
          </MessagesProvider>
        </ExercisesProvider>
      </RemindersProvider>
    </PreferencesProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </AuthProvider>
    </ThemeProvider>
  );
}
