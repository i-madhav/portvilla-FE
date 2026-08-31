import { apiClient } from './http';
import type { RequestOptions } from './http';

export interface SessionResponse {
  id: string;
  type: 'guest' | 'user';
  status: string;
  roomName: string;
  participantToken: string;
  participantIdentity: string;
}

/**
 * Opens a guest LiveKit session.
 *
 * Goes through the shared client so it inherits the timeout, retry, and error
 * shape every other call has — it used to hand-roll its own fetch against a
 * second copy of the base URL and throw a bare Error.
 */
export function createGuestSession(options?: RequestOptions): Promise<SessionResponse> {
  return apiClient.post<SessionResponse>('/session', { type: 'guest' }, options);
}

/**
 * Opens a LiveKit session for one person's portfolio.
 *
 * The backend resolves `profileUsername`, bakes `{ profile_id, profile_username }`
 * into the token's agent dispatch, and LiveKit routes it to the
 * `portvilla-portfolio` worker, which fetches that profile's slide catalog on
 * join. Nothing about the catalog comes back through this call.
 */
export function createUserSession(
  profileUsername: string,
  options?: RequestOptions,
): Promise<SessionResponse> {
  return apiClient.post<SessionResponse>(
    '/session',
    { type: 'user', profileUsername },
    options,
  );
}
