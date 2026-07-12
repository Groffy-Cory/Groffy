import { NextResponse } from "next/server";
import { fetchSpoonacularByIngredients } from "@/lib/meals/spoonacular";

/** Suggest recipes from current pantry ingredient names. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ingredients?: string[] };
    const ingredients = (body.ingredients || [])
      .map((name) => name.trim())
      .filter(Boolean);

    if (ingredients.length === 0) {
      return NextResponse.json({ recipes: [] });
    }

    const recipes = await fetchSpoonacularByIngredients(ingredients, 4);
    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("pantry recipes api", error);
    return NextResponse.json(
      { error: "Could not suggest recipes." },
      { status: 500 },
    );
  }
}
