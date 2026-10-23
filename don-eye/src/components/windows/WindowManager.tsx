"use client";

import { useCallback, useMemo, useState } from "react";
import { FloatingWindow, type WindowState } from "@/components/windows/FloatingWindow";
import {
  WindowContext,
  type OpenWindowArgs,
} from "@/components/windows/window-context";

type WindowRecord = WindowState & { content: React.ReactNode };

let zCounter = 1;

export function WindowManager({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowRecord[]>([]);

  const openWindow = useCallback((args: OpenWindowArgs) => {
    setWindows((prev) => {
      const z = ++zCounter;
      const existing = prev.find((w) => w.id === args.id);
      if (existing) {
        return prev.map((w) =>
          w.id === args.id
            ? { ...w, title: args.title, content: args.content, z }
            : w,
        );
      }
      const offset = (prev.length % 5) * 28;
      return [
        ...prev,
        {
          id: args.id,
          title: args.title,
          content: args.content,
          x: args.x ?? 72 + offset,
          y: args.y ?? 72 + offset,
          width: args.width ?? 520,
          height: args.height ?? 420,
          z,
        },
      ];
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focus = useCallback((id: string) => {
    const z = ++zCounter;
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, z } : w)));
  }, []);

  const move = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const resize = useCallback((id: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, width, height } : w)),
    );
  }, []);

  const value = useMemo(
    () => ({ openWindow, closeWindow }),
    [openWindow, closeWindow],
  );

  return (
    <WindowContext.Provider value={value}>
      {children}
      <div className="don-window-layer" data-window-count={windows.length}>
        {windows.map((win) => (
          <FloatingWindow
            key={win.id}
            win={win}
            onClose={closeWindow}
            onFocus={focus}
            onMove={move}
            onResize={resize}
          >
            {win.content}
          </FloatingWindow>
        ))}
      </div>
    </WindowContext.Provider>
  );
}

export { useWindows } from "@/components/windows/window-context";
