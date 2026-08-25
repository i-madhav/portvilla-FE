/**
 * Lightweight JWT helpers for the client.
 *
 * These do NOT verify the signature (only the server can do that) — they only
 * read the unverified payload to decide whether the access token is worth
 * sending. The server remains the source of truth and rejects invalid tokens.
 */

interface JwtPayload {
  exp?: number; // seconds since epoch
}

/** Decodes the payload segment of a JWT without verifying its signature. */
function decodePayload(token: string): JwtPayload | null {
  const segments = token.split('.');
  if (segments.length !== 3) return null;
  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true when the token is malformed or its `exp` claim is in the past.
 * A token without an `exp` claim is treated as non-expiring (returns false).
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  const payload = decodePayload(token);
  if (!payload) return true; // malformed → treat as expired
  if (typeof payload.exp !== 'number') return false; // no expiry claim
  return payload.exp * 1000 <= Date.now();
}
