/** Who authored a chat message. */
export type ChatRole = 'assistant' | 'user';

/** A single message rendered in the chat transcript. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}
