export type PantryItem = {
  id: string;
  userId: string;
  name: string;
  quantity: string;
  /** How it was added: manual, fridge_scan, receipt */
  source: "manual" | "fridge_scan" | "receipt";
  createdAt: string;
  updatedAt: string;
};

export type PantryItemDraft = {
  name: string;
  quantity?: string;
  source?: PantryItem["source"];
};

export const PANTRY_STORAGE_KEY = "rof-pantry-v1";
export const DEMO_PANTRY_USER_ID = "local-demo-user";
