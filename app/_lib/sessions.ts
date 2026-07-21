import { apiUrl } from "./apiClient";

export type ChatRole = "user" | "assistant" | "system";

export type SessionRow = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessageRow = {
  id: string;
  sessionId: string;
  role: ChatRole;
  message: string;
  imageUrl: string | null;
  createdAt: string;
};

export async function createSession(userId: string, title?: string): Promise<SessionRow> {
  const res = await fetch(apiUrl("/api/sessions"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, title }),
  });

  if (!res.ok) {
    throw new Error("Failed to create chat session");
  }

  return res.json();
}

export async function listSessions(userId: string): Promise<SessionRow[]> {
  const res = await fetch(apiUrl(`/api/sessions?userId=${encodeURIComponent(userId)}`));

  if (!res.ok) {
    throw new Error("Failed to fetch chat sessions");
  }

  return res.json();
}

export async function getSession(
  id: string
): Promise<{ session: SessionRow; messages: ChatMessageRow[] } | null> {
  const res = await fetch(apiUrl(`/api/sessions/${id}`));

  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to fetch chat session");
  }

  return res.json();
}

export async function updateSessionTitle(id: string, title: string): Promise<SessionRow> {
  const res = await fetch(apiUrl(`/api/sessions/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    throw new Error("Failed to update chat session title");
  }

  return res.json();
}

export async function appendMessage(
  sessionId: string,
  role: ChatRole,
  message: string,
  imageUrl?: string | null
): Promise<ChatMessageRow> {
  const res = await fetch(apiUrl(`/api/sessions/${sessionId}/messages`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, message, imageUrl }),
  });

  if (!res.ok) {
    throw new Error("Failed to save chat message");
  }

  return res.json();
}
