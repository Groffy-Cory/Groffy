import { SAMPLE_PANTRY } from "@/lib/pantry/sample-data";
import {
  DEMO_PANTRY_USER_ID,
  PANTRY_STORAGE_KEY,
  type PantryItem,
  type PantryItemDraft,
} from "@/lib/pantry/types";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `pantry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isPantryItem(value: unknown): value is PantryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PantryItem>;
  return (
    typeof item.id === "string" &&
    typeof item.userId === "string" &&
    typeof item.name === "string" &&
    typeof item.quantity === "string" &&
    typeof item.source === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

export function loadPantryLocal(): PantryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PANTRY_STORAGE_KEY);
    if (!raw) {
      savePantryLocal(SAMPLE_PANTRY);
      return SAMPLE_PANTRY;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return SAMPLE_PANTRY;
    const items = parsed.filter(isPantryItem);
    return items.length > 0 ? sortPantry(items) : SAMPLE_PANTRY;
  } catch {
    return SAMPLE_PANTRY;
  }
}

export function savePantryLocal(items: PantryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(items));
}

export function sortPantry(items: PantryItem[]): PantryItem[] {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function createPantryItem(
  draft: PantryItemDraft,
  userId = DEMO_PANTRY_USER_ID,
): PantryItem {
  const now = new Date().toISOString();
  return {
    id: createId(),
    userId,
    name: draft.name.trim(),
    quantity: draft.quantity?.trim() || "1",
    source: draft.source ?? "manual",
    createdAt: now,
    updatedAt: now,
  };
}

export function mergePantryItems(
  existing: PantryItem[],
  incoming: PantryItemDraft[],
  userId = DEMO_PANTRY_USER_ID,
): PantryItem[] {
  const next = [...existing];
  for (const draft of incoming) {
    const name = draft.name.trim();
    if (!name) continue;
    const found = next.find(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    );
    if (found) {
      found.quantity = draft.quantity?.trim() || found.quantity;
      found.source = draft.source ?? found.source;
      found.updatedAt = new Date().toISOString();
    } else {
      next.push(createPantryItem(draft, userId));
    }
  }
  return sortPantry(next);
}
