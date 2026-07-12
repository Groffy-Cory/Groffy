import { createBrowserClient } from "@/lib/supabase/client";
import {
  createMessage,
  loadMessages,
  saveMessages,
  sortMessages,
} from "@/lib/messages/storage";
import {
  DEMO_USER_ID,
  type Message,
  type MessageDraft,
  type MessageSourceId,
} from "@/lib/messages/types";

type DbRow = {
  id: string;
  user_id: string;
  source: string;
  sender: string;
  body: string;
  created_at: string;
  read: boolean;
  reply_to_id: string | null;
};

function rowToMessage(row: DbRow): Message {
  return {
    id: row.id,
    userId: row.user_id,
    source: row.source as MessageSourceId,
    sender: row.sender,
    body: row.body,
    createdAt: row.created_at,
    read: row.read,
    replyToId: row.reply_to_id,
  };
}

function messageToRow(message: Message): DbRow {
  return {
    id: message.id,
    user_id: message.userId,
    source: message.source,
    sender: message.sender,
    body: message.body,
    created_at: message.createdAt,
    read: message.read,
    reply_to_id: message.replyToId,
  };
}

export async function fetchMessages(
  userId = DEMO_USER_ID,
): Promise<{ messages: Message[]; source: "supabase" | "local" }> {
  const supabase = createBrowserClient();
  if (!supabase || userId === DEMO_USER_ID || userId === "local-guest") {
    return { messages: loadMessages(), source: "local" };
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { messages: loadMessages(), source: "local" };
  }

  const remote = sortMessages((data as DbRow[]).map(rowToMessage));
  const local = loadMessages().filter((message) => message.userId !== userId);
  const merged = sortMessages([...remote, ...local]);
  saveMessages(merged);
  return { messages: merged, source: "supabase" };
}

export async function persistMessages(
  messages: Message[],
  userId = DEMO_USER_ID,
): Promise<"supabase" | "local"> {
  saveMessages(messages);

  const supabase = createBrowserClient();
  if (!supabase || userId === DEMO_USER_ID || userId === "local-guest") {
    return "local";
  }

  const rows = messages
    .filter((message) => message.userId === userId)
    .map(messageToRow);

  if (rows.length === 0) return "local";

  const { error } = await supabase.from("messages").upsert(rows, {
    onConflict: "id",
  });

  return error ? "local" : "supabase";
}

export async function addMessageRemote(
  draft: MessageDraft,
  userId = DEMO_USER_ID,
): Promise<Message> {
  const message = createMessage(draft, userId);
  if (draft.source === "family" || draft.source === "doctor") {
    message.read = false;
  }

  const local = sortMessages([message, ...loadMessages()]);
  saveMessages(local);

  const supabase = createBrowserClient();
  if (supabase && userId !== DEMO_USER_ID && userId !== "local-guest") {
    await supabase.from("messages").upsert(messageToRow(message), {
      onConflict: "id",
    });
  }

  return message;
}
