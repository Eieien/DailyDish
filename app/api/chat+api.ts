import { GoogleGenAI } from '@google/genai';
import { and, desc, eq, gte, isNull, sql } from 'drizzle-orm';

import { GEMINI_MODEL, SYSTEM_INSTRUCTION, GENERATION_CONFIG } from '@/constants/ai';
import type { ChatMessage } from '@/app/types/chat';
import type { MealRow } from '@/app/lib/meals';
import type { RecipeRow } from '@/app/lib/recipes';
import { buildUserContext, HISTORY_WINDOW_DAYS } from '@/app/lib/aiContext';
import dbInstance from '../../db/index';
import { user, recipes, meal } from '../../db/schema';

// Web fallback only — native sends a pre-built `context` from local
// PowerSync storage instead (see app/chat.tsx / app/lib/aiContext.ts).
async function fetchServerUserContext(userId: string | null): Promise<string> {
  if (!userId) return '';

  const [profileRow] = await dbInstance.select().from(user).where(eq(user.id, userId));
  if (!profileRow) return '';

  const recipeRows = await dbInstance
    .select()
    .from(recipes)
    .where(and(eq(recipes.userId, userId), isNull(recipes.deletedAt)))
    .orderBy(desc(recipes.createdAt));

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HISTORY_WINDOW_DAYS);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  const mealRows = await dbInstance
    .select({
      id: meal.id,
      userId: meal.userId,
      recipeId: meal.recipeId,
      title: meal.title,
      category: meal.category,
      calories: sql<number | null>`COALESCE(${recipes.calories}, ${meal.calories})`,
      imageUrl: meal.imageUrl,
      completed: meal.completed,
      mealDate: meal.mealDate,
      nutritions: sql<unknown>`COALESCE(${recipes.nutritions}, ${meal.nutritions})`,
      ingredients: meal.ingredients,
      createdAt: meal.createdAt,
      updatedAt: meal.updatedAt,
    })
    .from(meal)
    .leftJoin(recipes, eq(meal.recipeId, recipes.id))
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
        deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
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
  let localContext = '';
  try {
    const body = await request.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
    userId = typeof body?.userId === 'string' ? body.userId : null;
    localContext = typeof body?.context === 'string' ? body.context : '';
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

  const context = localContext || (await fetchServerUserContext(userId));
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
