import { eq } from "drizzle-orm";

import { recipes } from "../../../db/schema";
import dbInstance from "../../../db/index";

export async function GET(request: Request, { id }: Record<string, string>) {
  const [row] = await dbInstance.select().from(recipes).where(eq(recipes.id, id));

  if (!row) {
    return Response.json({ error: "Recipe not found" }, { status: 404 });
  }

  return Response.json(row);
}

export async function PATCH(request: Request, { id }: Record<string, string>) {
  const body = await request.json();

  const patch: Partial<typeof recipes.$inferInsert> = {};
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.category === "string" || body.category === null) patch.category = body.category;
  if (typeof body.description === "string" || body.description === null) {
    patch.description = body.description;
  }
  if (typeof body.image === "string" || body.image === null) patch.image = body.image;
  if (typeof body.calories === "number" || body.calories === null) patch.calories = body.calories;
  if (Array.isArray(body.ingredients) || body.ingredients === null) {
    patch.ingredients = body.ingredients;
  }
  if (typeof body.nutritions === "object") patch.nutritions = body.nutritions;
  if (Array.isArray(body.steps) || body.steps === null) patch.steps = body.steps;

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  patch.updatedAt = new Date();

  const [row] = await dbInstance.update(recipes).set(patch).where(eq(recipes.id, id)).returning();

  if (!row) {
    return Response.json({ error: "Recipe not found" }, { status: 404 });
  }

  return Response.json(row);
}

export async function DELETE(request: Request, { id }: Record<string, string>) {
  const [row] = await dbInstance.delete(recipes).where(eq(recipes.id, id)).returning();

  if (!row) {
    return Response.json({ error: "Recipe not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
