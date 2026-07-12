export type RecipeSuggestion = {
  id: string;
  title: string;
  /** Ingredient names used for matching grocery items */
  ingredients: string[];
  steps: string;
};

/** Curated senior-friendly recipes matched against grocery items on hand. */
export const RECIPE_CATALOG: RecipeSuggestion[] = [
  {
    id: "recipe-omelet",
    title: "Simple cheese omelet",
    ingredients: ["eggs", "cheese", "butter", "milk"],
    steps:
      "Beat 2 eggs with a splash of milk. Melt butter in a pan. Pour eggs, add cheese, fold gently. Done in minutes.",
  },
  {
    id: "recipe-grilled-cheese",
    title: "Grilled cheese sandwich",
    ingredients: ["bread", "cheese", "butter"],
    steps:
      "Butter two slices of bread. Add cheese between them. Toast in a pan until golden on both sides.",
  },
  {
    id: "recipe-chicken-rice",
    title: "Easy chicken and rice",
    ingredients: ["chicken", "rice", "butter"],
    steps:
      "Cook rice as usual. Warm butter in a pan and brown chicken pieces. Serve chicken over rice. Season simply with salt and pepper.",
  },
  {
    id: "recipe-tomato-eggs",
    title: "Tomatoes and scrambled eggs",
    ingredients: ["eggs", "tomatoes", "butter"],
    steps:
      "Chop tomatoes. Melt butter, soft-cook tomatoes, then scramble in eggs. Soft, warm, and filling.",
  },
  {
    id: "recipe-milk-toast",
    title: "Warm milk toast",
    ingredients: ["bread", "milk", "butter"],
    steps:
      "Toast bread lightly. Warm milk with a dab of butter. Pour over toast in a bowl. Comfort food, old-fashioned style.",
  },
  {
    id: "recipe-cheesy-rice",
    title: "Cheesy rice bowl",
    ingredients: ["rice", "cheese", "butter", "milk"],
    steps:
      "Cook rice. Stir in butter, a splash of milk, and shredded cheese until melted. Soft and easy to eat.",
  },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function itemMatchesIngredient(itemText: string, ingredient: string): boolean {
  const item = normalize(itemText);
  const needle = normalize(ingredient);
  return item.includes(needle) || needle.includes(item);
}

/**
 * Suggest recipes from grocery items currently on the list
 * (open items count as ingredients on hand / planned).
 */
export function suggestRecipesFromGrocery(
  itemTexts: string[],
  minMatches = 2,
): Array<RecipeSuggestion & { matched: string[]; matchCount: number }> {
  const openTexts = itemTexts.map((text) => text.trim()).filter(Boolean);
  if (openTexts.length === 0) return [];

  return RECIPE_CATALOG.map((recipe) => {
    const matched = recipe.ingredients.filter((ingredient) =>
      openTexts.some((text) => itemMatchesIngredient(text, ingredient)),
    );
    return { ...recipe, matched, matchCount: matched.length };
  })
    .filter((recipe) => recipe.matchCount >= minMatches)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 4);
}
