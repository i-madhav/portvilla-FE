/**
 * The API layer's public surface. Import from `@app/lib/api` — never reach into
 * the individual files, so the internals stay free to move.
 */

export { API_BASE, API_PREFIX, API_URL, UPLOAD_TIMEOUT_MS, STORAGE_KEYS } from './config';

export { ApiError, isApiError, isCanceled, type ApiErrorKind } from './errors';

export {
  ApiClient,
  AuthenticatedApiClient,
  apiClient,
  authClient,
  setUnauthorizedHandler,
  setTokenRefresher,
  type RequestOptions,
} from './http';

export {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  onSessionEndedElsewhere,
} from './tokenStore';

export { isTokenExpired } from './jwt';

export { publicProfileLabel, publicProfileUrl } from './publicProfile';

export { createGuestSession, createUserSession, type SessionResponse } from './sessionApi';

export { submitWaitlist } from './waitlistApi';
