import { GoogleGenAI } from '@google/genai';
import { and, desc, eq, gte } from 'drizzle-orm';

import { GEMINI_MODEL, SYSTEM_INSTRUCTION, GENERATION_CONFIG } from '@/constants/ai';
import type { ChatMessage } from '@/app/types/chat';
import type { MealRow } from '@/app/lib/meals';
import type { RecipeRow } from '@/app/lib/recipes';
import { buildUserContext, HISTORY_WINDOW_DAYS } from '@/app/lib/aiContext';
import dbInstance from '../../db/index';
import { user, recipes, meal } from '../../db/schema';

async function fetchUserContext(userId: string | null): Promise<string> {
  if (!userId) return '';

  const [profileRow] = await dbInstance.select().from(user).where(eq(user.id, userId));
  if (!profileRow) return '';

  const recipeRows = await dbInstance
    .select()
    .from(recipes)
    .where(eq(recipes.userId, userId))
    .orderBy(desc(recipes.createdAt));

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HISTORY_WINDOW_DAYS);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  const mealRows = await dbInstance
    .select()
    .from(meal)
    .where(and(eq(meal.userId, userId), gte(meal.mealDate, cutoffDate)))
    .orderBy(desc(meal.mealDate));

  return buildUserContext(
    {
      ...profileRow,
      createdAt: profileRow.createdAt.toISOString(),
      updatedAt: profileRow.updatedAt.toISOString(),
      units: profileRow.units as 'metric' | 'imperial',
    },
    mealRows.map(
      (row): MealRow => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        nutritions: row.nutritions as MealRow['nutritions'],
        ingredients: row.ingredients as MealRow['ingredients'],
      })
    ),
    recipeRows.map(
      (row): RecipeRow => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        nutritions: row.nutritions as RecipeRow['nutritions'],
        ingredients: row.ingredients as RecipeRow['ingredients'],
        steps: row.steps as RecipeRow['steps'],
      })
    )
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Missing GEMINI_API_KEY on the server.' }, { status: 500 });
  }

  let messages: ChatMessage[] = [];
  let userId: string | null = null;
  try {
    const body = await request.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
    userId = typeof body?.userId === 'string' ? body.userId : null;
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (messages.length === 0) {
    return Response.json({ error: 'No messages provided.' }, { status: 400 });
  }

  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.text }],
  }));

  const context = await fetchUserContext(userId);
  const systemInstruction = context
    ? `${SYSTEM_INSTRUCTION}\n\nUser context (for personalizing answers — don't invent data beyond this):\n${context}`
    : SYSTEM_INSTRUCTION;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        ...GENERATION_CONFIG,
      },
    });

    const reply = response.text?.trim();
    if (!reply) {
      return Response.json({ error: 'The assistant did not return a reply.' }, { status: 502 });
    }

    return Response.json({ reply });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('Gemini request failed:', detail);
    return Response.json({ error: `Failed to reach Gemini: ${detail}` }, { status: 502 });
  }
}
