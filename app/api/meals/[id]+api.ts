import { eq } from "drizzle-orm";

import { meal } from "../../../db/schema";
import dbInstance from "../../../db/index";

export async function PATCH(request: Request, { id }: Record<string, string>) {
  const body = await request.json();

  const patch: Partial<typeof meal.$inferInsert> = {};
  if (typeof body.completed === "boolean") patch.completed = body.completed;
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.category === "string" || body.category === null) patch.category = body.category;
  if (typeof body.calories === "number" || body.calories === null) patch.calories = body.calories;
  if (typeof body.imageUrl === "string" || body.imageUrl === null) patch.imageUrl = body.imageUrl;
  if (typeof body.nutritions === "object") patch.nutritions = body.nutritions;
  if (Array.isArray(body.ingredients) || body.ingredients === null) {
    patch.ingredients = body.ingredients;
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  patch.updatedAt = new Date();

  const [row] = await dbInstance.update(meal).set(patch).where(eq(meal.id, id)).returning();

  if (!row) {
    return Response.json({ error: "Meal not found" }, { status: 404 });
  }

  return Response.json(row);
}

export async function DELETE(request: Request, { id }: Record<string, string>) {
  const [row] = await dbInstance.delete(meal).where(eq(meal.id, id)).returning();

  if (!row) {
    return Response.json({ error: "Meal not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
