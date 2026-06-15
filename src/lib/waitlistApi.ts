const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export async function submitWaitlist(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/waitlist`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error(`POST /waitlist failed: ${res.status}`);
  }
}
