import { NextResponse } from "next/server";
import { fetchSpoonacularByIngredients } from "@/lib/meals/spoonacular";
import {
  analyzeImageWithGrok,
  parseDetectedItemsJson,
} from "@/lib/specials/grok";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      imageDataUrl?: string;
      mode?: "fridge" | "receipt";
      onPremMode?: boolean;
    };

    const imageDataUrl = body.imageDataUrl;
    const mode = body.mode === "receipt" ? "receipt" : "fridge";
    const onPrem = Boolean(body.onPremMode);

    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Please upload a clear photo." },
        { status: 400 },
      );
    }

    // Cap very large payloads (~4MB base64)
    if (imageDataUrl.length > 5_500_000) {
      return NextResponse.json(
        { error: "Photo is too large. Try a smaller picture." },
        { status: 400 },
      );
    }

    if (mode === "receipt") {
      const raw = await analyzeImageWithGrok(
        imageDataUrl,
        "List grocery items from this receipt. Return ONLY a JSON array of objects with name and quantity strings. Example: [{\"name\":\"Milk\",\"quantity\":\"1 gallon\"}]. If unclear, return [].",
        "You help older adults update a pantry from grocery receipts. Be careful and conservative. Plain food names only.",
        { onPrem },
      );
      const items = parseDetectedItemsJson(raw);
      return NextResponse.json({
        mode: "receipt",
        items,
        recipes: [],
        note:
          items.length > 0
            ? onPrem
              ? "Items found using the local model stub. Review them, then add to your pantry."
              : "Items found on the receipt. Review them, then add to your pantry."
            : "Receipt reading is ready when Grok vision is configured. You can still add items by hand.",
        usedVision: Boolean(raw),
        onPrem,
      });
    }

    const raw = await analyzeImageWithGrok(
      imageDataUrl,
      "Look at this fridge or pantry photo. List visible food ingredients. Return ONLY a JSON array of objects with name and optional quantity. Example: [{\"name\":\"Eggs\",\"quantity\":\"6\"}]. If nothing clear, return [].",
      "You help older adults see what food they have. Use simple food names. Do not invent items you cannot see.",
      { onPrem },
    );

    let items = parseDetectedItemsJson(raw);

    // Demo fallback so Scan works without API keys during MVP demos
    if (items.length === 0 && !raw) {
      items = [
        { name: "Eggs", quantity: "4" },
        { name: "Milk", quantity: "1 carton" },
        { name: "Cheese", quantity: "1 pack" },
        { name: "Butter", quantity: "1 stick" },
        { name: "Leftover chicken", quantity: "1 container" },
      ];
    }

    const recipes = await fetchSpoonacularByIngredients(
      items.map((item) => item.name),
      4,
    );

    return NextResponse.json({
      mode: "fridge",
      items,
      recipes,
      note:
        items.length > 0
          ? onPrem
            ? "Here’s what the local model stub spotted. Add them to your pantry, then try the recipe ideas."
            : "Here’s what we spotted. Add them to your pantry, then try the recipe ideas."
          : "We couldn’t spot clear items. Try better lighting or add food by hand.",
      usedVision: Boolean(raw),
      onPrem,
    });
  } catch (error) {
    console.error("pantry scan api", error);
    return NextResponse.json(
      { error: "Could not scan that photo. Please try again." },
      { status: 500 },
    );
  }
}
