"use client";

import { createContext, useContext } from "react";

export type OpenWindowArgs = {
  id: string;
  title: string;
  content: React.ReactNode;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
};

export type WindowContextValue = {
  openWindow: (args: OpenWindowArgs) => void;
  closeWindow: (id: string) => void;
};

export const WindowContext = createContext<WindowContextValue | null>(null);

export function useWindows() {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error("useWindows must be used within WindowManager");
  return ctx;
}
