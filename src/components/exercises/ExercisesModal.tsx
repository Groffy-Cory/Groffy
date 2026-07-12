"use client";

import { useEffect, useMemo, useState } from "react";
import { useExercises } from "@/components/exercises/ExercisesProvider";
import {
  getExerciseById,
  getExercisesByProgram,
} from "@/lib/exercises/catalog";
import {
  EXERCISE_PROGRAMS,
  type ExerciseProgramId,
  type TherapyExercise,
} from "@/lib/exercises/types";

type View =
  | { mode: "list"; program: ExerciseProgramId | "all" }
  | { mode: "detail"; exerciseId: string };

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ExercisesModal() {
  const {
    isOpen,
    closeExercises,
    progress,
    syncSource,
    toggleComplete,
    completedCount,
  } = useExercises();

  const [view, setView] = useState<View>({ mode: "list", program: "all" });
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setView({ mode: "list", program: "all" });
    setRunning(false);
    setStepIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeExercises();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeExercises]);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      return;
    }
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

  const list = useMemo(() => {
    if (view.mode !== "list") return [];
    return getExercisesByProgram(view.program);
  }, [view]);

  const active =
    view.mode === "detail" ? getExerciseById(view.exerciseId) : undefined;

  if (!isOpen) return null;

  function openDetail(exercise: TherapyExercise) {
    setView({ mode: "detail", exerciseId: exercise.id });
    setSecondsLeft(exercise.durationSeconds);
    setRunning(false);
    setStepIndex(0);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-6"
      role="presentation"
      onClick={closeExercises}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercises-title"
        className="rof-card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-steel-200 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="exercises-title"
              className="font-display text-3xl font-semibold text-ink"
            >
              Exercises / Home Therapy
            </h2>
            <p className="mt-1 text-base font-semibold text-muted">
              Simple moves with big steps, a timer, and a check when you’re done.
            </p>
            <p className="mt-1 text-sm font-bold text-[color:var(--accent-gold,var(--royal-dark))]">
              {completedCount} completed ·{" "}
              {syncSource === "supabase"
                ? "Progress saved to Supabase"
                : syncSource === "loading"
                  ? "Loading…"
                  : "Progress saved on this device"}
            </p>
            <p className="mt-2 text-sm font-semibold text-muted">
              This is general home practice — follow your clinician’s advice for
              your recovery.
            </p>
          </div>
          <button
            type="button"
            className="rof-btn rof-btn-secondary"
            onClick={closeExercises}
          >
            Close
          </button>
        </div>

        {view.mode === "list" ? (
          <>
            <div className="flex gap-2 overflow-x-auto border-b-2 border-steel-200 px-3 py-3">
              <FilterChip
                label="All"
                active={view.program === "all"}
                onClick={() => setView({ mode: "list", program: "all" })}
              />
              {EXERCISE_PROGRAMS.map((program) => (
                <FilterChip
                  key={program.id}
                  label={program.label}
                  active={view.program === program.id}
                  onClick={() =>
                    setView({ mode: "list", program: program.id })
                  }
                />
              ))}
            </div>

            <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              {list.map((exercise) => {
                const done = progress[exercise.id]?.completed;
                return (
                  <li key={exercise.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(exercise)}
                      className="rof-inset flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={exercise.coverImage}
                        alt=""
                        className="h-28 w-full rounded-xl border-2 border-steel-200 object-cover sm:h-24 sm:w-32"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold uppercase tracking-wide text-[color:var(--accent-gold,var(--royal-dark))]">
                          {EXERCISE_PROGRAMS.find((p) => p.id === exercise.program)
                            ?.label ?? "Exercise"}
                        </p>
                        <p className="mt-1 text-xl font-bold text-ink">
                          {exercise.title}
                          {done ? (
                            <span className="ml-2 rounded-full bg-royal px-2 py-0.5 text-xs font-bold text-white">
                              Done
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-muted">
                          {exercise.summary}
                        </p>
                        <p className="mt-2 text-base font-bold text-ink">
                          Timer: {formatSeconds(exercise.durationSeconds)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {view.mode === "detail" && active ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b-2 border-steel-200 px-4 py-3">
              <button
                type="button"
                className="rof-btn rof-btn-secondary"
                onClick={() => {
                  setRunning(false);
                  setView({ mode: "list", program: active.program });
                }}
              >
                Back to list
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
              <h3 className="font-display text-3xl font-semibold text-ink">
                {active.title}
              </h3>
              <p className="text-lg font-semibold text-muted">{active.summary}</p>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.steps[stepIndex]?.image || active.coverImage}
                alt=""
                className="max-h-56 w-full rounded-xl border-2 border-steel-200 object-contain bg-[var(--surface-raised)]"
              />

              <div className="rof-inset p-4">
                <p className="text-sm font-bold uppercase tracking-wide text-[color:var(--accent-gold,var(--royal-dark))]">
                  Step {stepIndex + 1} of {active.steps.length}
                </p>
                <p className="mt-2 text-2xl font-bold leading-relaxed text-ink">
                  {active.steps[stepIndex]?.text}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rof-btn rof-btn-secondary"
                    disabled={stepIndex === 0}
                    onClick={() => setStepIndex((n) => Math.max(0, n - 1))}
                  >
                    Previous step
                  </button>
                  <button
                    type="button"
                    className="rof-btn rof-btn-primary"
                    disabled={stepIndex >= active.steps.length - 1}
                    onClick={() =>
                      setStepIndex((n) =>
                        Math.min(active.steps.length - 1, n + 1),
                      )
                    }
                  >
                    Next step
                  </button>
                </div>
              </div>

              <div className="rof-inset p-5 text-center">
                <p className="text-base font-bold text-ink">Exercise timer</p>
                <p className="mt-2 font-display text-5xl font-semibold text-ink">
                  {formatSeconds(secondsLeft)}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    className="rof-btn rof-btn-primary"
                    onClick={() => setRunning(true)}
                    disabled={running || secondsLeft <= 0}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className="rof-btn rof-btn-secondary"
                    onClick={() => setRunning(false)}
                    disabled={!running}
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    className="rof-btn rof-btn-secondary"
                    onClick={() => {
                      setRunning(false);
                      setSecondsLeft(active.durationSeconds);
                    }}
                  >
                    Reset
                  </button>
                </div>
                {secondsLeft === 0 ? (
                  <p className="mt-3 text-lg font-bold text-[color:var(--accent-gold,var(--royal-dark))]">
                    Time’s up — nice work. Mark it done below if you finished.
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                className={[
                  "rof-btn w-full min-h-14 text-lg",
                  progress[active.id]?.completed
                    ? "rof-btn-secondary"
                    : "rof-btn-primary",
                ].join(" ")}
                onClick={() => toggleComplete(active.id)}
                aria-pressed={Boolean(progress[active.id]?.completed)}
              >
                {progress[active.id]?.completed
                  ? "✓ Completed — tap to undo"
                  : "Mark exercise completed"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rof-btn min-h-12 shrink-0 px-4",
        active ? "rof-btn-primary" : "rof-btn-secondary",
      ].join(" ")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
