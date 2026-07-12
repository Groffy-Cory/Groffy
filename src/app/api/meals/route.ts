import { NextResponse } from "next/server";
import { getDayMealIdeas, getMealIdea } from "@/lib/meals/spoonacular";
import type { MealType } from "@/types";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as MealType | null;
    const rotate = Number(searchParams.get("rotate") || "0");

    if (type && MEAL_TYPES.includes(type)) {
      const meal = await getMealIdea(type, rotate);
      return NextResponse.json({ meal });
    }

    const meals = await getDayMealIdeas();
    return NextResponse.json({ meals });
  } catch (error) {
    console.error("meals api", error);
    return NextResponse.json(
      { error: "Could not load meal ideas." },
      { status: 500 },
    );
  }
}
