"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type ViewMode = "client" | "admin";

type ViewModeContextValue = {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  isAdmin: boolean;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used within ViewModeProvider");
  return ctx;
}

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("client");
  const value = useMemo(
    () => ({ mode, setMode, isAdmin: mode === "admin" }),
    [mode],
  );
  return (
    <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>
  );
}
