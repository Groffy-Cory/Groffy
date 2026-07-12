import type { MealIdea, MealType } from "@/types";
import { pickFallbackMeal } from "@/lib/meals/fallback";

type SpoonacularResult = {
  id?: number;
  title?: string;
  summary?: string;
  readyInMinutes?: number;
  servings?: number;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function seniorFriendlyDescription(result: SpoonacularResult): string {
  const bits: string[] = [];
  if (result.readyInMinutes) {
    bits.push(`About ${result.readyInMinutes} minutes`);
  }
  if (result.servings) {
    bits.push(`serves ${result.servings}`);
  }
  if (result.summary) {
    const plain = stripHtml(result.summary);
    bits.push(plain.slice(0, 140) + (plain.length > 140 ? "…" : ""));
  }
  if (bits.length === 0) {
    return "A simple meal idea from Spoonacular.";
  }
  return bits.join(". ");
}

const TYPE_QUERY: Record<MealType, string> = {
  breakfast: "easy breakfast",
  lunch: "easy lunch",
  dinner: "easy dinner",
};

export async function fetchSpoonacularMeal(
  type: MealType,
): Promise<MealIdea | null> {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey || apiKey === "your_spoonacular_api_key") {
    return null;
  }

  try {
    const url = new URL("https://api.spoonacular.com/recipes/complexSearch");
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("query", TYPE_QUERY[type]);
    url.searchParams.set("type", type);
    url.searchParams.set("number", "8");
    url.searchParams.set("addRecipeInformation", "true");
    url.searchParams.set("sort", "random");
    url.searchParams.set("maxReadyTime", "45");

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 0 },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      results?: SpoonacularResult[];
    };
    const results = data.results?.filter((r) => r.title) ?? [];
    if (results.length === 0) return null;

    const pick = results[Math.floor(Math.random() * results.length)];
    return {
      type,
      title: pick.title!,
      description: seniorFriendlyDescription(pick),
      source: "spoonacular",
      externalId: pick.id ? String(pick.id) : undefined,
    };
  } catch {
    return null;
  }
}

export async function fetchSpoonacularByIngredients(
  ingredients: string[],
  number = 4,
): Promise<MealIdea[]> {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey || apiKey === "your_spoonacular_api_key" || ingredients.length === 0) {
    return [];
  }

  try {
    const url = new URL(
      "https://api.spoonacular.com/recipes/findByIngredients",
    );
    url.searchParams.set("apiKey", apiKey);
    url.searchParams.set("ingredients", ingredients.slice(0, 12).join(","));
    url.searchParams.set("number", String(number));
    url.searchParams.set("ranking", "2");
    url.searchParams.set("ignorePantry", "true");

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return [];

    const data = (await response.json()) as Array<{
      id?: number;
      title?: string;
      usedIngredientCount?: number;
      missedIngredientCount?: number;
    }>;

    return (data || [])
      .filter((item) => item.title)
      .map((item) => ({
        type: "dinner" as MealType,
        title: item.title!,
        description: `Uses ${item.usedIngredientCount ?? "?"} of your pantry items${
          item.missedIngredientCount
            ? ` · needs about ${item.missedIngredientCount} more`
            : ""
        }.`,
        source: "spoonacular" as const,
        externalId: item.id ? String(item.id) : undefined,
      }));
  } catch {
    return [];
  }
}

export async function getMealIdea(
  type: MealType,
  rotateIndex = 0,
): Promise<MealIdea> {
  const fromApi = await fetchSpoonacularMeal(type);
  if (fromApi) return fromApi;
  return pickFallbackMeal(type, rotateIndex);
}

export async function getDayMealIdeas(): Promise<Record<MealType, MealIdea>> {
  const [breakfast, lunch, dinner] = await Promise.all([
    getMealIdea("breakfast", 0),
    getMealIdea("lunch", 0),
    getMealIdea("dinner", 0),
  ]);
  return { breakfast, lunch, dinner };
}
