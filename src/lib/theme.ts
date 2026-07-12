export const THEME_STORAGE_KEY = "rof-theme";

export const THEME_OPTIONS = [
  {
    id: "option-1",
    label: "Option 1",
    shortLabel: "1",
    description: "Steel grey skeleton",
  },
  {
    id: "option-2",
    label: "Option 2",
    shortLabel: "2",
    description: "Parchment — crisp edges",
  },
] as const;

export type ThemeId = (typeof THEME_OPTIONS)[number]["id"];

export const DEFAULT_THEME: ThemeId = "option-2";

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value === "option-1" || value === "option-2";
}

export function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute("data-theme", theme);
}
