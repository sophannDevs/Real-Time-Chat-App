// ─── Shared types ─────────────────────────────────────────────────────────────
// Defined here so both the hook and components import from one place.

export interface Message {
  id:         number;
  content:    string;
  created_at: string;   // ISO timestamp string from the server
  user_id:    number;
  username:   string;
}

export interface OnlineUser {
  id:       number;
  username: string;
}

export interface TypingUser {
  userId:   number;
  username: string;
  isTyping: boolean;
}

// ─── API helper ───────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Fetch recent messages from the REST API.
// Returns an empty array on failure so the UI can still render.
export async function fetchMessages(token: string): Promise<Message[]> {
  try {
    const res = await fetch(`${BASE}/api/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.messages as Message[];
  } catch {
    return [];
  }
}
