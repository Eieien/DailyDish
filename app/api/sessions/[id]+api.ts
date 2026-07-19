import { asc, eq } from "drizzle-orm";

import { sessions, chatMessages } from "../../../db/schema";
import dbInstance from "../../../db/index";

export async function GET(request: Request, { id }: Record<string, string>) {
  const [session] = await dbInstance.select().from(sessions).where(eq(sessions.id, id));

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const messages = await dbInstance
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, id))
    .orderBy(asc(chatMessages.createdAt));

  return Response.json({ session, messages });
}

export async function PATCH(request: Request, { id }: Record<string, string>) {
  const body = await request.json();

  if (typeof body.title !== "string" || !body.title.trim()) {
    return Response.json({ error: "title is required" }, { status: 400 });
  }

  const [row] = await dbInstance
    .update(sessions)
    .set({ title: body.title.trim(), updatedAt: new Date() })
    .where(eq(sessions.id, id))
    .returning();

  if (!row) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  return Response.json(row);
}
