import { user } from "../../db/schema";
import dbInstance  from "../../db/index"; 

export async function GET() {
    const result = await dbInstance.select().from(user);
    return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
    });
}

export async function POST(req: Request) {
  const body = await req.json();
//   const { id, name,email,created_at, updated_at   } = body;

  await dbInstance.insert(user).values(body);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}