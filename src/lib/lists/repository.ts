import { createBrowserClient } from "@/lib/supabase/client";
import {
  loadListsLocal,
  saveListsLocal,
  sortLists,
} from "@/lib/lists/storage";
import {
  DEMO_LISTS_USER_ID,
  type ListItem,
  type ListKindId,
  type RofList,
} from "@/lib/lists/types";

type ListRow = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ItemRow = {
  id: string;
  list_id: string;
  text: string;
  completed: boolean;
  reminder_time: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

function rowsToLists(lists: ListRow[], items: ItemRow[]): RofList[] {
  return sortLists(
    lists.map((list) => ({
      id: list.id,
      userId: list.user_id,
      kind: list.kind as ListKindId,
      title: list.title,
      createdAt: list.created_at,
      updatedAt: list.updated_at,
      items: items
        .filter((item) => item.list_id === list.id)
        .map(
          (item): ListItem => ({
            id: item.id,
            text: item.text,
            completed: item.completed,
            reminderTime: item.reminder_time,
            notes: item.notes ?? "",
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }),
        ),
    })),
  );
}

/**
 * Shared Lists repository. Prefer Supabase when configured;
 * otherwise persist locally for MVP.
 */
export async function fetchLists(
  userId = DEMO_LISTS_USER_ID,
): Promise<{ lists: RofList[]; source: "supabase" | "local" }> {
  const supabase = createBrowserClient();
  if (!supabase) {
    return { lists: loadListsLocal(), source: "local" };
  }

  const { data: listRows, error: listError } = await supabase
    .from("rof_lists")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (listError || !listRows) {
    return { lists: loadListsLocal(), source: "local" };
  }

  const listIds = (listRows as ListRow[]).map((row) => row.id);
  let itemRows: ItemRow[] = [];
  if (listIds.length > 0) {
    const { data, error } = await supabase
      .from("rof_list_items")
      .select("*")
      .in("list_id", listIds);
    if (!error && data) itemRows = data as ItemRow[];
  }

  const lists = rowsToLists(listRows as ListRow[], itemRows);
  saveListsLocal(lists);
  return { lists, source: "supabase" };
}

export async function persistLists(
  lists: RofList[],
  userId = DEMO_LISTS_USER_ID,
): Promise<"supabase" | "local"> {
  saveListsLocal(lists);

  const supabase = createBrowserClient();
  if (!supabase) return "local";

  const owned = lists.filter((list) => list.userId === userId);
  const listRows: ListRow[] = owned.map((list) => ({
    id: list.id,
    user_id: list.userId,
    kind: list.kind,
    title: list.title,
    created_at: list.createdAt,
    updated_at: list.updatedAt,
  }));

  const itemRows: ItemRow[] = owned.flatMap((list) =>
    list.items.map((item) => ({
      id: item.id,
      list_id: list.id,
      text: item.text,
      completed: item.completed,
      reminder_time: item.reminderTime,
      notes: item.notes,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    })),
  );

  const { error: listError } = await supabase
    .from("rof_lists")
    .upsert(listRows, { onConflict: "id" });
  if (listError) return "local";

  if (itemRows.length > 0) {
    const { error: itemError } = await supabase
      .from("rof_list_items")
      .upsert(itemRows, { onConflict: "id" });
    if (itemError) return "local";
  }

  return "supabase";
}
