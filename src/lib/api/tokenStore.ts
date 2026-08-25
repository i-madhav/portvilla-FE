import { STORAGE_KEYS } from './config';

/**
 * The one place tokens are read from and written to.
 *
 * Every read goes to localStorage rather than an in-memory cache. That is
 * deliberate: it means a token rotated by another tab is picked up by the very
 * next request here, with no coordination needed.
 *
 * All access is wrapped, because localStorage throws rather than returning null
 * in Safari private mode and when a browser is configured to block site data.
 * A storage failure must degrade the session, never crash the app.
 */

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Quota or private mode — the session stays in memory for this page only.
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing to clean up */
  }
}

export function getAccessToken(): string | null {
  return read(STORAGE_KEYS.accessToken);
}

export function getRefreshToken(): string | null {
  return read(STORAGE_KEYS.refreshToken);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  write(STORAGE_KEYS.accessToken, accessToken);
  write(STORAGE_KEYS.refreshToken, refreshToken);
}

export function clearTokens(): void {
  remove(STORAGE_KEYS.accessToken);
  remove(STORAGE_KEYS.refreshToken);
}

// ─── Cross-tab session sync ──────────────────────────────────────────────────
// The `storage` event fires only in *other* tabs, which is exactly what we
// want: the tab that performed the logout already handled its own teardown.
// Without this, a second tab keeps issuing requests with a revoked token until
// it happens to hit a 401 of its own.

type SessionEndedListener = () => void;

const sessionEndedListeners = new Set<SessionEndedListener>();

/**
 * Subscribe to "the session ended in another tab". Returns an unsubscribe fn.
 */
export function onSessionEndedElsewhere(fn: SessionEndedListener): () => void {
  sessionEndedListeners.add(fn);
  return () => sessionEndedListeners.delete(fn);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // `key === null` means the whole store was cleared via localStorage.clear().
    const clearedEverything = event.key === null;
    const accessTokenRemoved =
      event.key === STORAGE_KEYS.accessToken && event.newValue === null;

    if (clearedEverything || accessTokenRemoved) {
      for (const listener of sessionEndedListeners) listener();
    }
  });
}
