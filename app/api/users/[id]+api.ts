import { eq } from "drizzle-orm";

import { user } from "../../../db/schema";
import dbInstance from "../../../db/index";

export async function GET(request: Request, { id }: Record<string, string>) {
  const [row] = await dbInstance.select().from(user).where(eq(user.id, id));

  if (!row) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(row);
}

export async function PATCH(request: Request, { id }: Record<string, string>) {
  const body = await request.json();

  const patch: Partial<typeof user.$inferInsert> = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.dietGoal === "string" || body.dietGoal === null) patch.dietGoal = body.dietGoal;
  if (typeof body.dailyCalorieTarget === "number" || body.dailyCalorieTarget === null) {
    patch.dailyCalorieTarget = body.dailyCalorieTarget;
  }
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (body.units === "metric" || body.units === "imperial") patch.units = body.units;
  if (typeof body.remindersEnabled === "boolean") patch.remindersEnabled = body.remindersEnabled;
  if (typeof body.avatarUrl === "string" || body.avatarUrl === null) {
    patch.avatarUrl = body.avatarUrl;
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  patch.updatedAt = new Date();

  const [row] = await dbInstance
    .update(user)
    .set(patch)
    .where(eq(user.id, id))
    .returning();

  if (!row) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(row);
}
