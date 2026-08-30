/**
 * Single source of truth for API location and transport tuning.
 *
 * Before this file, `API_BASE` was re-derived from the same env var in four
 * separate places (apiClient, sessionApi, waitlistApi, and inline inside the
 * profile multipart helper). Four copies meant four chances to drift.
 */

/** Trailing slashes are stripped so `${API_URL}${path}` never produces `//`. */
const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const API_BASE = RAW_BASE.replace(/\/+$/, '');
export const API_PREFIX = '/api/v1';

/** Every request in the app is built from this. */
export const API_URL = `${API_BASE}${API_PREFIX}`;

/**
 * A request with no response after this long is aborted. Without a timeout a
 * hung connection leaves the promise — and any spinner waiting on it — pending
 * forever.
 */
export const DEFAULT_TIMEOUT_MS = 30_000;

/** File uploads are slow; they get a longer leash than a JSON call. */
export const UPLOAD_TIMEOUT_MS = 120_000;

/** Retry budget for idempotent requests (attempts *after* the first). */
export const MAX_RETRIES = 2;

/** Base delay for exponential backoff; actual waits add jitter. */
export const RETRY_BASE_DELAY_MS = 300;

/** Ceiling on any single backoff wait, so a 429 can't stall the UI for minutes. */
export const RETRY_MAX_DELAY_MS = 4_000;

/** localStorage keys. Centralised so the store and the client cannot disagree. */
export const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
} as const;
