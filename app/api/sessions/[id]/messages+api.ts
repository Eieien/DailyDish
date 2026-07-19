import { eq } from "drizzle-orm";

import { sessions, chatMessages } from "../../../../db/schema";
import dbInstance from "../../../../db/index";

const VALID_ROLES = ["user", "assistant", "system"] as const;

export async function POST(request: Request, { id }: Record<string, string>) {
  const body = await request.json();

  if (!VALID_ROLES.includes(body.role)) {
    return Response.json({ error: "role must be user, assistant, or system" }, { status: 400 });
  }
  if (typeof body.message !== "string" || !body.message.trim()) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  const [message] = await dbInstance
    .insert(chatMessages)
    .values({
      sessionId: id,
      role: body.role,
      message: body.message,
    })
    .returning();

  await dbInstance.update(sessions).set({ updatedAt: new Date() }).where(eq(sessions.id, id));

  return Response.json(message, { status: 201 });
}
