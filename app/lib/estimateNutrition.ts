export type NutritionEstimate = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export async function estimateNutrition(
  title: string,
  ingredients: string[]
): Promise<NutritionEstimate> {
  const res = await fetch("/api/estimate-nutrition", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, ingredients }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to estimate nutrition.");
  }

  return res.json();
}
