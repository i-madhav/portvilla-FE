const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export interface SessionResponse {
  id               : string;
  type             : 'guest' | 'user';
  status           : string;
  roomName         : string;
  participantToken : string;
  participantIdentity: string;
}

export async function createGuestSession(): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/api/v1/session`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      type: 'guest'
    }),
  });

  if (!res.ok) {
    throw new Error(`POST /session failed: ${res.status}`);
  }

  return res.json() as Promise<SessionResponse>;
}
