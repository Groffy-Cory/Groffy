import { createBrowserClient } from "@/lib/supabase/client";
import {
  loadPantryLocal,
  savePantryLocal,
  sortPantry,
} from "@/lib/pantry/storage";
import {
  DEMO_PANTRY_USER_ID,
  type PantryItem,
} from "@/lib/pantry/types";

type DbRow = {
  id: string;
  user_id: string;
  name: string;
  quantity: string;
  source: string;
  created_at: string;
  updated_at: string;
};

function rowToItem(row: DbRow): PantryItem {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    quantity: row.quantity,
    source: row.source as PantryItem["source"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function itemToRow(item: PantryItem): DbRow {
  return {
    id: item.id,
    user_id: item.userId,
    name: item.name,
    quantity: item.quantity,
    source: item.source,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export async function fetchPantry(
  userId = DEMO_PANTRY_USER_ID,
): Promise<{ items: PantryItem[]; source: "supabase" | "local" }> {
  const supabase = createBrowserClient();
  if (!supabase) {
    return { items: loadPantryLocal(), source: "local" };
  }

  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error || !data) {
    return { items: loadPantryLocal(), source: "local" };
  }

  const items = sortPantry((data as DbRow[]).map(rowToItem));
  savePantryLocal(items);
  return { items, source: "supabase" };
}

export async function persistPantry(
  items: PantryItem[],
  userId = DEMO_PANTRY_USER_ID,
): Promise<"supabase" | "local"> {
  savePantryLocal(items);

  const supabase = createBrowserClient();
  if (!supabase) return "local";

  const rows = items
    .filter((item) => item.userId === userId)
    .map(itemToRow);

  const { error } = await supabase.from("pantry_items").upsert(rows, {
    onConflict: "id",
  });

  return error ? "local" : "supabase";
}
