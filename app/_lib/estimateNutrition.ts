import { apiUrl } from "./apiClient";

export type NutritionEstimate = {
  recognized: boolean;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export async function estimateNutrition(
  title: string,
  ingredients: string[],
  steps: string[]
): Promise<NutritionEstimate> {
  const res = await fetch(apiUrl("/api/estimate-nutrition"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, ingredients, steps }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to estimate nutrition.");
  }

  return res.json();
}

export type FoodScanEstimate = NutritionEstimate & {
  foodName: string;
};

export async function estimateNutritionFromImage(
  imageBase64: string,
  mimeType: string
): Promise<FoodScanEstimate> {
  const res = await fetch(apiUrl("/api/estimate-nutrition-from-image"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, mimeType }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to identify food from photo.");
  }

  return res.json();
}
