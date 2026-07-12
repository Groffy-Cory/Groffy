import type { TherapyExercise } from "@/lib/exercises/types";

/** Curated senior-friendly home therapy exercises (educational — not medical advice). */
export const THERAPY_EXERCISES: TherapyExercise[] = [
  {
    id: "knee-ankle-pumps",
    program: "knee",
    title: "Ankle pumps",
    summary: "Keeps blood moving in the lower leg. Easy to do in a chair or bed.",
    durationSeconds: 60,
    coverImage: "/exercises/ankle-pumps.svg",
    steps: [
      {
        text: "Sit or lie down with your legs out. Keep your knees soft.",
        image: "/exercises/ankle-pumps.svg",
      },
      {
        text: "Point your toes away from you, slowly.",
        image: "/exercises/ankle-pumps.svg",
      },
      {
        text: "Pull your toes back toward you. Repeat in a calm rhythm.",
        image: "/exercises/ankle-pumps.svg",
      },
    ],
  },
  {
    id: "knee-quad-sets",
    program: "knee",
    title: "Quad sets",
    summary: "Gently wakes up the thigh muscle after knee surgery or stiffness.",
    durationSeconds: 45,
    coverImage: "/exercises/quad-sets.svg",
    steps: [
      {
        text: "Sit with your leg straight on a bed or sofa.",
        image: "/exercises/quad-sets.svg",
      },
      {
        text: "Press the back of your knee down into the surface.",
        image: "/exercises/quad-sets.svg",
      },
      {
        text: "Hold for a few seconds, then relax. Do not force pain.",
        image: "/exercises/quad-sets.svg",
      },
    ],
  },
  {
    id: "knee-heel-slides",
    program: "knee",
    title: "Heel slides",
    summary: "Helps bend and straighten the knee a little at a time.",
    durationSeconds: 90,
    coverImage: "/exercises/heel-slides.svg",
    steps: [
      {
        text: "Lie on your back. Place a towel under your heel if it helps slide.",
        image: "/exercises/heel-slides.svg",
      },
      {
        text: "Slowly bend your knee, sliding your heel toward your bottom.",
        image: "/exercises/heel-slides.svg",
      },
      {
        text: "Slide the heel back out to straighten. Move gently.",
        image: "/exercises/heel-slides.svg",
      },
    ],
  },
  {
    id: "shoulder-pendulum",
    program: "shoulder",
    title: "Pendulum swings",
    summary: "Lets the shoulder hang and move with gravity — very gentle.",
    durationSeconds: 60,
    coverImage: "/exercises/pendulum.svg",
    steps: [
      {
        text: "Stand beside a table. Lean forward and rest your good hand on it.",
        image: "/exercises/pendulum.svg",
      },
      {
        text: "Let the sore arm hang down, loose and relaxed.",
        image: "/exercises/pendulum.svg",
      },
      {
        text: "Make small circles, then reverse. Stop if it hurts sharply.",
        image: "/exercises/pendulum.svg",
      },
    ],
  },
  {
    id: "shoulder-wall-walk",
    program: "shoulder",
    title: "Wall finger walks",
    summary: "Slowly raises the arm using your fingers on a wall.",
    durationSeconds: 75,
    coverImage: "/exercises/wall-walk.svg",
    steps: [
      {
        text: "Stand facing a wall. Place your fingers on the wall at waist height.",
        image: "/exercises/wall-walk.svg",
      },
      {
        text: "Walk your fingers upward as high as is comfortable.",
        image: "/exercises/wall-walk.svg",
      },
      {
        text: "Hold briefly, then walk the fingers back down.",
        image: "/exercises/wall-walk.svg",
      },
    ],
  },
  {
    id: "shoulder-rolls",
    program: "shoulder",
    title: "Shoulder rolls",
    summary: "Loosens tight shoulders and neck from sitting still.",
    durationSeconds: 45,
    coverImage: "/exercises/shoulder-rolls.svg",
    steps: [
      {
        text: "Sit tall in a sturdy chair with feet flat on the floor.",
        image: "/exercises/shoulder-rolls.svg",
      },
      {
        text: "Lift both shoulders up toward your ears, then roll them back.",
        image: "/exercises/shoulder-rolls.svg",
      },
      {
        text: "Roll forward the other way. Breathe slowly.",
        image: "/exercises/shoulder-rolls.svg",
      },
    ],
  },
  {
    id: "general-seated-march",
    program: "general",
    title: "Seated marches",
    summary: "Light movement for hips and circulation while seated.",
    durationSeconds: 60,
    coverImage: "/exercises/seated-march.svg",
    steps: [
      {
        text: "Sit in a firm chair. Hold the sides if you need balance.",
        image: "/exercises/seated-march.svg",
      },
      {
        text: "Lift one knee a little, then lower it.",
        image: "/exercises/seated-march.svg",
      },
      {
        text: "Switch legs in a slow marching rhythm.",
        image: "/exercises/seated-march.svg",
      },
    ],
  },
  {
    id: "general-ankle-circles",
    program: "general",
    title: "Ankle circles",
    summary: "Keeps ankles flexible and comfortable.",
    durationSeconds: 45,
    coverImage: "/exercises/ankle-circles.svg",
    steps: [
      {
        text: "Sit comfortably. Lift one foot slightly off the floor.",
        image: "/exercises/ankle-circles.svg",
      },
      {
        text: "Draw slow circles with your toes one way.",
        image: "/exercises/ankle-circles.svg",
      },
      {
        text: "Switch direction, then do the other ankle.",
        image: "/exercises/ankle-circles.svg",
      },
    ],
  },
];

export function getExerciseById(id: string): TherapyExercise | undefined {
  return THERAPY_EXERCISES.find((exercise) => exercise.id === id);
}

export function getExercisesByProgram(
  program: TherapyExercise["program"] | "all",
): TherapyExercise[] {
  if (program === "all") return THERAPY_EXERCISES;
  return THERAPY_EXERCISES.filter((exercise) => exercise.program === program);
}
