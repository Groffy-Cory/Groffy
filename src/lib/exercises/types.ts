export const EXERCISE_PROGRAMS = [
  {
    id: "knee",
    label: "Knee (replacement / recovery)",
    hint: "Gentle knee and leg movements",
  },
  {
    id: "shoulder",
    label: "Shoulder",
    hint: "Easy shoulder mobility",
  },
  {
    id: "general",
    label: "General home therapy",
    hint: "Simple whole-body moves",
  },
] as const;

export type ExerciseProgramId = (typeof EXERCISE_PROGRAMS)[number]["id"];

export type ExerciseStep = {
  text: string;
  /** Path under /public, e.g. /exercises/knee-heel-slide.svg */
  image: string;
};

export type TherapyExercise = {
  id: string;
  program: ExerciseProgramId;
  title: string;
  summary: string;
  /** Suggested timer length in seconds */
  durationSeconds: number;
  coverImage: string;
  steps: ExerciseStep[];
};

export type ExerciseProgress = {
  exerciseId: string;
  completed: boolean;
  completedAt: string | null;
  updatedAt: string;
};

export type ExerciseProgressMap = Record<string, ExerciseProgress>;

export const EXERCISE_PROGRESS_KEY = "rof-exercise-progress-v1";
export const DEMO_EXERCISE_USER_ID = "local-demo-user";

export function getProgramLabel(id: ExerciseProgramId): string {
  return EXERCISE_PROGRAMS.find((item) => item.id === id)?.label ?? id;
}
