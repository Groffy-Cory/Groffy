"use client";

import { THEME_OPTIONS } from "@/lib/theme";
import { useTheme } from "@/components/theme/ThemeProvider";

type ThemeSwitcherProps = {
  compact?: boolean;
};

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    return (
      <div
        className="flex shrink-0 gap-1.5"
        role="group"
        aria-label="Look options"
      >
        {THEME_OPTIONS.map((option) => {
          const isActive = theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={[
                "min-h-12 min-w-12 rounded-xl border-2 px-2 text-sm font-bold transition-colors sm:min-h-11 sm:min-w-[4.5rem] sm:px-3 sm:text-base",
                "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-royal",
                "touch-manipulation",
                isActive
                  ? "border-royal bg-royal text-white"
                  : "border-steel-200 bg-steel-50 text-ink hover:border-royal",
              ].join(" ")}
              aria-pressed={isActive}
              title={option.description}
            >
              {option.shortLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="flex w-full shrink-0 flex-col items-stretch gap-1 sm:w-auto sm:items-end"
      role="group"
      aria-label="Look options"
    >
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
        Look
      </p>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {THEME_OPTIONS.map((option) => {
          const isActive = theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              className={[
                "min-h-12 flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors sm:min-h-11 sm:flex-none sm:text-base",
                "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-royal",
                "touch-manipulation",
                isActive
                  ? "border-royal bg-royal text-white"
                  : "border-steel-200 bg-steel-50 text-ink hover:border-royal",
              ].join(" ")}
              aria-pressed={isActive}
              title={option.description}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
