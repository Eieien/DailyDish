import { GoogleGenAI } from '@google/genai';

import { GEMINI_MODEL, SYSTEM_INSTRUCTION, GENERATION_CONFIG } from '@/constants/ai';
import type { ChatMessage } from '@/types/chat';

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Missing GEMINI_API_KEY on the server.' }, { status: 500 });
  }

  let messages: ChatMessage[] = [];
  try {
    const body = await request.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
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

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
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
