import type { ChatMessage } from '../_types/chat';

export async function sendChatMessage(
  messages: ChatMessage[],
  options?: { userId?: string | null; context?: string }
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userId: options?.userId, context: options?.context }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? 'Something went wrong. Please try again.');
  }

  return data.reply as string;
}
