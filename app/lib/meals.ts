import type { MealEntry, MealSlot, Macro } from "../../data/types";

export type MealRow = {
  id: string;
  userId: string;
  recipeId: string | null;
  title: string;
  category: string | null;
  calories: number | null;
  imageUrl: string | null;
  completed: boolean;
  mealDate: string;
  nutritions: Macro | null;
  ingredients: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export const PLACEHOLDER_MEAL_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";

export function localIsoDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-CA");
}

export async function getMealsForDate(userId: string, date?: string): Promise<MealRow[]> {
  const params = new URLSearchParams({ userId, date: date ?? localIsoDate() });
  const res = await fetch(`/api/meals?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch meals");
  }

  return res.json();
}

export type CreateMealInput = {
  userId: string;
  title: string;
  category?: MealSlot | string | null;
  calories?: number | null;
  imageUrl?: string | null;
  completed?: boolean;
  mealDate?: string;
  recipeId?: string | null;
  nutritions?: Macro | null;
  ingredients?: string[] | null;
};

export async function createMeal(payload: CreateMealInput): Promise<MealRow> {
  const res = await fetch("/api/meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create meal");
  }

  return res.json();
}

export type UpdateMealInput = Partial<{
  completed: boolean;
  title: string;
  category: string | null;
  calories: number | null;
  imageUrl: string | null;
  nutritions: Macro | null;
  ingredients: string[] | null;
}>;

export async function updateMeal(id: string, patch: UpdateMealInput): Promise<MealRow> {
  const res = await fetch(`/api/meals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    throw new Error("Failed to update meal");
  }

  return res.json();
}

export async function setMealCompleted(id: string, completed: boolean): Promise<MealRow> {
  return updateMeal(id, { completed });
}

export async function deleteMeal(id: string): Promise<void> {
  const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });

  if (!res.ok) {
    throw new Error("Failed to delete meal");
  }
}

export type DayHistory = {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  mealCount: number;
};

export async function getMealHistory(userId: string, days = 14): Promise<DayHistory[]> {
  const params = new URLSearchParams({ userId, days: String(days) });
  const res = await fetch(`/api/meals/history?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch meal history");
  }

  return res.json();
}

const VALID_SLOTS: MealSlot[] = ["Breakfast", "Lunch", "Dinner", "Snacks"];

export function toMealEntry(row: MealRow): MealEntry {
  const slot = VALID_SLOTS.includes(row.category as MealSlot)
    ? (row.category as MealSlot)
    : "Snacks";

  return {
    id: row.id,
    slot,
    recipeTitle: row.title,
    calories: row.calories ?? row.nutritions?.calories ?? 0,
    imageUrl: row.imageUrl ?? PLACEHOLDER_MEAL_IMAGE,
    completed: row.completed,
  };
}
