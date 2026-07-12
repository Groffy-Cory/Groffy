import type { MealIdea, MealType } from "@/types";

export const FALLBACK_MEALS: Record<MealType, MealIdea[]> = {
  breakfast: [
    {
      type: "breakfast",
      title: "Warm oatmeal with berries",
      description: "Easy, gentle on the stomach, and ready in minutes.",
    },
    {
      type: "breakfast",
      title: "Scrambled eggs and toast",
      description: "Soft eggs with buttered toast — familiar and filling.",
    },
    {
      type: "breakfast",
      title: "Yogurt with banana",
      description: "No cooking needed. Sweet, cool, and simple.",
    },
  ],
  lunch: [
    {
      type: "lunch",
      title: "Turkey sandwich & tomato soup",
      description: "A classic comfort combo — soft bread, clear flavors.",
    },
    {
      type: "lunch",
      title: "Grilled cheese and fruit",
      description: "Crispy cheese sandwich with apple slices on the side.",
    },
    {
      type: "lunch",
      title: "Chicken noodle soup",
      description: "Warm broth with noodles — easy to eat and soothing.",
    },
  ],
  dinner: [
    {
      type: "dinner",
      title: "Baked chicken with vegetables",
      description: "Simple sheet-pan meal with familiar seasoning.",
    },
    {
      type: "dinner",
      title: "Meatloaf with mashed potatoes",
      description: "Homestyle dinner that reheats well the next day.",
    },
    {
      type: "dinner",
      title: "Baked salmon and rice",
      description: "Mild fish with soft rice — light but satisfying.",
    },
  ],
};

export function pickFallbackMeal(
  type: MealType,
  index = 0,
): MealIdea {
  const list = FALLBACK_MEALS[type];
  return list[index % list.length];
}

export function pickFallbackDay(): Record<MealType, MealIdea> {
  return {
    breakfast: pickFallbackMeal("breakfast", 0),
    lunch: pickFallbackMeal("lunch", 0),
    dinner: pickFallbackMeal("dinner", 0),
  };
}
