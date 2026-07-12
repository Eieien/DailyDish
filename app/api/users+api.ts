import { user } from "../../db/schema";
import dbInstance from "../../db/index";

export async function GET() {
  const result = await dbInstance.select().from(user);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  const [row] = await dbInstance
    .insert(user)
    .values(body)
    .onConflictDoNothing({ target: user.id })
    .returning();

  return new Response(JSON.stringify({ success: true, user: row ?? null }), {
    headers: { "Content-Type": "application/json" },
  });
}
