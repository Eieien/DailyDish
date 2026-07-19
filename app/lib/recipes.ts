import type { Recipe as RecipeCardData, Macro } from "../../data/types";

export type RecipeRow = {
  id: string;
  userId: string;
  title: string;
  category: string | null;
  description: string | null;
  image: string | null;
  calories: number | null;
  ingredients: string[] | null;
  nutritions: Macro | null;
  steps: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export async function getRecipes(userId?: string): Promise<RecipeRow[]> {
  const url = userId ? `/api/recipes?userId=${encodeURIComponent(userId)}` : "/api/recipes";
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch recipes");
  }

  return res.json();
}

export async function getRecipeById(id: string): Promise<RecipeRow | null> {
  const res = await fetch(`/api/recipes/${id}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch recipe");
  }

  return res.json();
}

export type CreateRecipeInput = {
  id?: string;
  userId: string;
  title: string;
  category?: string | null;
  description?: string | null;
  image?: string | null;
  calories?: number | null;
  ingredients?: string[] | null;
  nutritions?: Macro | null;
  steps?: string[] | null;
};

export async function createRecipe(payload: CreateRecipeInput): Promise<RecipeRow> {
  const res = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create recipe");
  }

  return res.json();
}

export type UpdateRecipeInput = Partial<{
  title: string;
  category: string | null;
  description: string | null;
  image: string | null;
  calories: number | null;
  ingredients: string[] | null;
  nutritions: Macro | null;
  steps: string[] | null;
}>;

export async function updateRecipe(id: string, patch: UpdateRecipeInput): Promise<RecipeRow> {
  const res = await fetch(`/api/recipes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    throw new Error("Failed to update recipe");
  }

  return res.json();
}

export async function deleteRecipe(id: string): Promise<void> {
  const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });

  if (!res.ok) {
    throw new Error("Failed to delete recipe");
  }
}

export function toRecipeCardData(row: RecipeRow): RecipeCardData {
  return {
    id: row.id,
    title: row.title,
    image: row.image,
    description: row.description ?? "",
    macros: {
      calories: row.calories ?? row.nutritions?.calories ?? 0,
      protein: row.nutritions?.protein ?? 0,
      fat: row.nutritions?.fat ?? 0,
      carbs: row.nutritions?.carbs ?? 0,
    },
    ingredients: (row.ingredients ?? []).map((label, index) => ({
      id: `${row.id}-i${index}`,
      label,
    })),
    steps: row.steps ?? [],
  };
}
