import { and, eq, gte, sql } from "drizzle-orm";

import { meal, recipes } from "../../../db/schema";
import dbInstance from "../../../db/index";

type DayTotals = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  mealCount: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") ?? "14", 10) || 14));

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const rows = await dbInstance
    .select({
      mealDate: meal.mealDate,
      completed: meal.completed,
      calories: sql<number | null>`COALESCE(${recipes.calories}, ${meal.calories})`,
      nutritions: sql<unknown>`COALESCE(${recipes.nutritions}, ${meal.nutritions})`,
    })
    .from(meal)
    .leftJoin(recipes, eq(meal.recipeId, recipes.id))
    .where(and(eq(meal.userId, userId), gte(meal.mealDate, cutoffIso)));

  const byDate = new Map<string, DayTotals>();

  for (const row of rows) {
    if (!row.completed) continue;

    const entry = byDate.get(row.mealDate) ?? {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      mealCount: 0,
    };

    const nutritions = row.nutritions as
      | { calories?: number; protein?: number; fat?: number; carbs?: number }
      | null;
    entry.calories += row.calories ?? nutritions?.calories ?? 0;
    entry.protein += nutritions?.protein ?? 0;
    entry.fat += nutritions?.fat ?? 0;
    entry.carbs += nutritions?.carbs ?? 0;
    entry.mealCount += 1;

    byDate.set(row.mealDate, entry);
  }

  const history = Array.from(byDate.entries())
    .map(([date, totals]) => ({ date, ...totals }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return Response.json(history);
}
