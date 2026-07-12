import { and, eq } from "drizzle-orm";

import { meal } from "../../db/schema";
import dbInstance from "../../db/index";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date") ?? todayIsoDate();

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const rows = await dbInstance
    .select()
    .from(meal)
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
