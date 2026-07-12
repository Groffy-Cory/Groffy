export type MoodId =
  | "happy"
  | "okay"
  | "tired"
  | "lonely"
  | "worried"
  | "grateful";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type MealType = "breakfast" | "lunch" | "dinner";

export type MealIdea = {
  type: MealType;
  title: string;
  description: string;
  source?: "spoonacular" | "fallback" | "pantry";
  externalId?: string;
};

export type {
  Reminder,
  ReminderCategoryId,
  ReminderInput,
} from "@/lib/reminders/types";

export type {
  Message,
  MessageDraft,
  MessageSourceId,
} from "@/lib/messages/types";

export type {
  VaultEntry,
  VaultEntryDraft,
  VaultEntryTypeId,
} from "@/lib/memory-vault/types";

export type {
  ListItem,
  ListKindId,
  RofList,
} from "@/lib/lists/types";

export type { PantryItem, PantryItemDraft } from "@/lib/pantry/types";

export type {
  FeatureModalId,
  PrayerDenominationId,
  UserPreferences,
} from "@/lib/preferences/types";
