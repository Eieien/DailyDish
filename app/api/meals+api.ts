import { and, eq, sql } from "drizzle-orm";

import { meal, recipes } from "../../db/schema";
import dbInstance from "../../db/index";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

// Calories/nutrition always come live from the linked recipe (falling back to
// the meal's own stored snapshot for legacy recipe-less rows) — meal's job is
// just to log what/when/whether-eaten, not to own a separate copy of macros
// that can drift from the recipe.
function mealSelectColumns() {
  return {
    id: meal.id,
    userId: meal.userId,
    recipeId: meal.recipeId,
    title: meal.title,
    category: meal.category,
    calories: sql<number | null>`COALESCE(${recipes.calories}, ${meal.calories})`,
    imageUrl: meal.imageUrl,
    completed: meal.completed,
    mealDate: meal.mealDate,
    nutritions: sql<unknown>`COALESCE(${recipes.nutritions}, ${meal.nutritions})`,
    ingredients: meal.ingredients,
    createdAt: meal.createdAt,
    updatedAt: meal.updatedAt,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date") ?? todayIsoDate();

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const rows = await dbInstance
    .select(mealSelectColumns())
    .from(meal)
    .leftJoin(recipes, eq(meal.recipeId, recipes.id))
    .where(and(eq(meal.userId, userId), eq(meal.mealDate, date)));

  return Response.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.userId || !body.title) {
    return Response.json({ error: "userId and title are required" }, { status: 400 });
  }

  const [row] = await dbInstance
    .insert(meal)
    .values({
      ...(typeof body.id === "string" ? { id: body.id } : {}),
      userId: body.userId,
      recipeId: body.recipeId ?? null,
      title: body.title,
      category: body.category ?? null,
      calories: body.calories ?? null,
      imageUrl: body.imageUrl ?? null,
      completed: body.completed ?? false,
      mealDate: body.mealDate ?? todayIsoDate(),
      nutritions: body.nutritions ?? null,
      ingredients: body.ingredients ?? null,
    })
    .returning();

  return Response.json(row, { status: 201 });
}
