import type { ChatMessage } from '../types/chat';

export async function sendChatMessage(
  messages: ChatMessage[],
  userId?: string | null
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userId }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? 'Something went wrong. Please try again.');
  }

  return data.reply as string;
}
