import { and, desc, eq, isNull } from "drizzle-orm";

import { recipes } from "../../db/schema";
import dbInstance from "../../db/index";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  // Archived (soft-deleted) recipes are excluded from listing/browsing, but
  // stay in the table so meals logged from them keep their history.
  const rows = userId
    ? await dbInstance
        .select()
        .from(recipes)
        .where(and(eq(recipes.userId, userId), isNull(recipes.deletedAt)))
        .orderBy(desc(recipes.createdAt))
    : await dbInstance
        .select()
        .from(recipes)
        .where(isNull(recipes.deletedAt))
        .orderBy(desc(recipes.createdAt));

  return Response.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.userId || !body.title) {
    return Response.json({ error: "userId and title are required" }, { status: 400 });
  }

  const [row] = await dbInstance
    .insert(recipes)
    .values({
      ...(typeof body.id === "string" ? { id: body.id } : {}),
      userId: body.userId,
      title: body.title,
      category: body.category ?? null,
      description: body.description ?? null,
      image: body.image ?? null,
      calories: body.calories ?? null,
      ingredients: body.ingredients ?? null,
      nutritions: body.nutritions ?? null,
      steps: body.steps ?? null,
    })
    .returning();

  return Response.json(row, { status: 201 });
}
