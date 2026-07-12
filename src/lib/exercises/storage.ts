import {
  DEMO_EXERCISE_USER_ID,
  EXERCISE_PROGRESS_KEY,
  type ExerciseProgress,
  type ExerciseProgressMap,
} from "@/lib/exercises/types";

function isProgress(value: unknown): value is ExerciseProgress {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ExerciseProgress>;
  return (
    typeof item.exerciseId === "string" &&
    typeof item.completed === "boolean" &&
    (item.completedAt === null || typeof item.completedAt === "string") &&
    typeof item.updatedAt === "string"
  );
}

export function loadProgressLocal(): ExerciseProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(EXERCISE_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const map: ExerciseProgressMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isProgress(value)) map[key] = value;
    }
    return map;
  } catch {
    return {};
  }
}

export function saveProgressLocal(map: ExerciseProgressMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EXERCISE_PROGRESS_KEY, JSON.stringify(map));
}

export function toggleProgressEntry(
  map: ExerciseProgressMap,
  exerciseId: string,
): ExerciseProgressMap {
  const current = map[exerciseId];
  const now = new Date().toISOString();
  const completed = !(current?.completed ?? false);
  return {
    ...map,
    [exerciseId]: {
      exerciseId,
      completed,
      completedAt: completed ? now : null,
      updatedAt: now,
    },
  };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export { DEMO_EXERCISE_USER_ID };
