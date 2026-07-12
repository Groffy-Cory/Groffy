import { DEMO_PANTRY_USER_ID, type PantryItem } from "@/lib/pantry/types";

export const SAMPLE_PANTRY: PantryItem[] = [
  {
    id: "pantry-1",
    userId: DEMO_PANTRY_USER_ID,
    name: "Eggs",
    quantity: "6",
    source: "manual",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "pantry-2",
    userId: DEMO_PANTRY_USER_ID,
    name: "Milk",
    quantity: "1 gallon",
    source: "manual",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "pantry-3",
    userId: DEMO_PANTRY_USER_ID,
    name: "Cheddar cheese",
    quantity: "1 block",
    source: "fridge_scan",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "pantry-4",
    userId: DEMO_PANTRY_USER_ID,
    name: "Butter",
    quantity: "1 stick",
    source: "manual",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: "pantry-5",
    userId: DEMO_PANTRY_USER_ID,
    name: "Bread",
    quantity: "1 loaf",
    source: "receipt",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
];
