import { GoogleGenAI } from '@google/genai';

import { GEMINI_MODEL, FOOD_SCAN_SYSTEM_INSTRUCTION, FOOD_SCAN_SCHEMA } from '@/constants/ai';

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Missing GEMINI_API_KEY on the server.' }, { status: 500 });
  }

  let imageBase64 = '';
  let mimeType = 'image/jpeg';
  try {
    const body = await request.json();
    imageBase64 = typeof body?.imageBase64 === 'string' ? body.imageBase64 : '';
    mimeType = typeof body?.mimeType === 'string' && body.mimeType ? body.mimeType : 'image/jpeg';
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!imageBase64) {
    return Response.json({ error: 'An image is required.' }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Identify the food in this photo and estimate its nutrition.' },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        },
      ],
      config: {
        systemInstruction: FOOD_SCAN_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: FOOD_SCAN_SCHEMA,
        temperature: 0.4,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return Response.json({ error: 'The assistant could not identify the food.' }, { status: 502 });
    }

    const parsed = JSON.parse(text);
    const recognized = parsed.recognized !== false;
    return Response.json({
      recognized,
      foodName:
        recognized && typeof parsed.foodName === 'string' && parsed.foodName.trim()
          ? parsed.foodName.trim()
          : '',
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round(Number(parsed.protein) || 0),
      fat: Math.round(Number(parsed.fat) || 0),
      carbs: Math.round(Number(parsed.carbs) || 0),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('Food scan estimate failed:', detail);
    return Response.json({ error: `Failed to identify food: ${detail}` }, { status: 502 });
  }
}
