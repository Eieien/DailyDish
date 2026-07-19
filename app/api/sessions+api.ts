import { desc, eq } from "drizzle-orm";

import { sessions } from "../../db/schema";
import dbInstance from "../../db/index";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const rows = await dbInstance
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.updatedAt));

  return Response.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const [row] = await dbInstance
    .insert(sessions)
    .values({
      id: crypto.randomUUID(),
      userId: body.userId,
      title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : "New chat",
    })
    .returning();

  return Response.json(row, { status: 201 });
}
