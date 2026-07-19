import { GoogleGenAI } from '@google/genai';

import {
  GEMINI_MODEL,
  NUTRITION_ESTIMATE_SYSTEM_INSTRUCTION,
  NUTRITION_ESTIMATE_SCHEMA,
} from '@/constants/ai';

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Missing GEMINI_API_KEY on the server.' }, { status: 500 });
  }

  let title = '';
  let ingredients: string[] = [];
  let steps: string[] = [];
  try {
    const body = await request.json();
    title = typeof body?.title === 'string' ? body.title : '';
    ingredients = Array.isArray(body?.ingredients) ? body.ingredients : [];
    steps = Array.isArray(body?.steps) ? body.steps : [];
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!title.trim() || ingredients.length === 0 || steps.length === 0) {
    return Response.json(
      { error: 'A recipe name, ingredients, and steps are required.' },
      { status: 400 }
    );
  }

  const prompt = `Recipe: ${title}\nIngredients: ${ingredients.join(', ')}\nSteps: ${steps.join(' | ')}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: NUTRITION_ESTIMATE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: NUTRITION_ESTIMATE_SCHEMA,
        temperature: 0.4,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return Response.json({ error: 'The assistant did not return an estimate.' }, { status: 502 });
    }

    const parsed = JSON.parse(text);
    return Response.json({
      recognized: parsed.recognized !== false,
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      fat: Math.round(Number(parsed.fat) || 0),
      carbs: Math.round(Number(parsed.carbs) || 0),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('Nutrition estimate failed:', detail);
    return Response.json({ error: `Failed to estimate nutrition: ${detail}` }, { status: 502 });
  }
}
