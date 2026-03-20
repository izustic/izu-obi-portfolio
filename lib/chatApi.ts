// lib/chatApi.ts
// Talks to the me.py FastAPI backend.
// Set VITE_CHAT_API_URL in your .env.local (defaults to localhost for dev).

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const BASE_URL = import.meta.env.VITE_CHAT_API_URL ?? "http://localhost:8000";

export async function sendMessage(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }

  const data = await res.json();
  return data.reply as string;
}
