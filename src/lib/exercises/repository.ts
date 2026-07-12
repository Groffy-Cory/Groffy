import { createBrowserClient } from "@/lib/supabase/client";
import {
  DEMO_EXERCISE_USER_ID,
  loadProgressLocal,
  saveProgressLocal,
} from "@/lib/exercises/storage";
import type { ExerciseProgressMap } from "@/lib/exercises/types";

type DbRow = {
  user_id: string;
  exercise_id: string;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
};

export async function fetchExerciseProgress(
  userId = DEMO_EXERCISE_USER_ID,
): Promise<{ progress: ExerciseProgressMap; source: "supabase" | "local" }> {
  const supabase = createBrowserClient();
  if (!supabase) {
    return { progress: loadProgressLocal(), source: "local" };
  }

  const { data, error } = await supabase
    .from("exercise_progress")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    return { progress: loadProgressLocal(), source: "local" };
  }

  const progress: ExerciseProgressMap = {};
  for (const row of data as DbRow[]) {
    progress[row.exercise_id] = {
      exerciseId: row.exercise_id,
      completed: row.completed,
      completedAt: row.completed_at,
      updatedAt: row.updated_at,
    };
  }
  saveProgressLocal(progress);
  return { progress, source: "supabase" };
}

export async function persistExerciseProgress(
  progress: ExerciseProgressMap,
  userId = DEMO_EXERCISE_USER_ID,
): Promise<"supabase" | "local"> {
  saveProgressLocal(progress);

  const supabase = createBrowserClient();
  if (!supabase) return "local";

  const rows = Object.values(progress).map((item) => ({
    user_id: userId,
    exercise_id: item.exerciseId,
    completed: item.completed,
    completed_at: item.completedAt,
    updated_at: item.updatedAt,
  }));

  if (rows.length === 0) return "supabase";

  const { error } = await supabase.from("exercise_progress").upsert(rows, {
    onConflict: "user_id,exercise_id",
  });

  return error ? "local" : "supabase";
}
