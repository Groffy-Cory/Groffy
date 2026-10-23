"use client";

import { useEffect, useRef, useState } from "react";

export type WindowState = {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
};

type FloatingWindowProps = {
  win: WindowState;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  children: React.ReactNode;
};

export function FloatingWindow({
  win,
  onClose,
  onFocus,
  onMove,
  onResize,
  children,
}: FloatingWindowProps) {
  const dragRef = useRef<{ ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{ ox: number; oy: number; ow: number; oh: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function onMovePointer(e: PointerEvent) {
      if (dragRef.current) {
        onMove(
          win.id,
          Math.max(0, e.clientX - dragRef.current.ox),
          Math.max(0, e.clientY - dragRef.current.oy),
        );
      }
      if (resizeRef.current) {
        const w = Math.max(320, resizeRef.current.ow + (e.clientX - resizeRef.current.ox));
        const h = Math.max(220, resizeRef.current.oh + (e.clientY - resizeRef.current.oy));
        onResize(win.id, w, h);
      }
    }
    function onUp() {
      dragRef.current = null;
      resizeRef.current = null;
      setDragging(false);
    }
    window.addEventListener("pointermove", onMovePointer);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMovePointer);
      window.removeEventListener("pointerup", onUp);
    };
  }, [onMove, onResize, win.id]);

  return (
    <div
      role="dialog"
      aria-label={win.title}
      className="don-float-window fixed flex flex-col overflow-hidden"
      style={{
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: 6000 + win.z,
      }}
      onPointerDown={() => onFocus(win.id)}
    >
      <div
        className="don-float-titlebar flex shrink-0 cursor-grab items-center justify-between gap-2 px-3 py-2 active:cursor-grabbing"
        onPointerDown={(e) => {
          e.preventDefault();
          onFocus(win.id);
          dragRef.current = { ox: e.clientX - win.x, oy: e.clientY - win.y };
          setDragging(true);
        }}
      >
        <h2
          className="min-w-0 truncate text-sm font-bold tracking-wide text-[#f5f0ea]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          {win.title}
        </h2>
        <button
          type="button"
          className="don-float-close"
          aria-label={`Close ${win.title}`}
          onClick={() => onClose(win.id)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          ✕
        </button>
      </div>

      <div
        className={`min-h-0 flex-1 overflow-auto bg-[color:var(--parchment)] p-4 ${
          dragging ? "pointer-events-none" : ""
        }`}
      >
        {children}
      </div>

      <div
        className="don-float-resize absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFocus(win.id);
          resizeRef.current = {
            ox: e.clientX,
            oy: e.clientY,
            ow: win.width,
            oh: win.height,
          };
        }}
        aria-hidden
      />
    </div>
  );
}
