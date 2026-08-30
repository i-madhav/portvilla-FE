import {
  API_URL,
  DEFAULT_TIMEOUT_MS,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS,
} from './config';
import { ApiError } from './errors';
import { getAccessToken } from './tokenStore';

// ─── Injected seams ──────────────────────────────────────────────────────────
// The transport must not import the Redux store: the store imports the
// transport, and a cycle between them breaks module init order. Instead the app
// pushes its handlers in from main.tsx, the one place that already knows about
// both.

type UnauthorizedHandler = () => void;
/** Returns the new access token, or null when the session cannot be renewed. */
type TokenRefresher = () => Promise<string | null>;

let onUnauthorized: UnauthorizedHandler = () => {};
let refresher: TokenRefresher | null = null;

/** Called when a session is definitively over — clear state and redirect. */
export function setUnauthorizedHandler(fn: UnauthorizedHandler): void {
  onUnauthorized = fn;
}

/**
 * Supply the refresh-token exchange. Until this is set, a 401 goes straight to
 * `onUnauthorized` — which is the old behaviour, and the correct fallback.
 */
export function setTokenRefresher(fn: TokenRefresher | null): void {
  refresher = fn;
}

// ─── Single-flight token refresh ─────────────────────────────────────────────
// When a token expires, every in-flight request 401s at roughly the same
// moment. Refreshing per-request would fire N parallel exchanges, and since
// most refresh implementations rotate the refresh token, the winners would
// invalidate each other's tokens and log the user out — the exact bug this
// guards against.
//
// A single module-level promise is a sufficient mutex here. JavaScript runs one
// task to completion before picking up the next, so the read-then-assign below
// cannot interleave: there is no window in which two callers both observe null.
// Everything that arrives while a refresh is pending awaits the same promise.

let inFlightRefresh: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (inFlightRefresh) return inFlightRefresh;
  if (!refresher) return Promise.resolve(null);

  const run = async (): Promise<string | null> => {
    try {
      return await refresher!();
    } catch {
      // A failed refresh is not an error to propagate — it just means the
      // session is over, which the caller handles by signing the user out.
      return null;
    }
  };

  inFlightRefresh = run().finally(() => {
    inFlightRefresh = null;
  });
  return inFlightRefresh;
}

// ─── Cancellation + timeout ──────────────────────────────────────────────────

interface LinkedSignal {
  signal: AbortSignal;
  /** True when *we* aborted for exceeding the deadline. */
  timedOut: () => boolean;
  release: () => void;
}

/**
 * Combines the caller's AbortSignal with an internal deadline into one signal.
 *
 * Written by hand rather than with `AbortSignal.any` so the client works on
 * browsers predating it, and so we can tell a timeout apart from a caller
 * cancellation afterwards — the two mean very different things to the user.
 */
function linkSignals(external: AbortSignal | undefined, timeoutMs: number): LinkedSignal {
  const controller = new AbortController();
  let didTimeout = false;

  const timer = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  const abortNow = () => controller.abort();

  if (external) {
    if (external.aborted) abortNow();
    else external.addEventListener('abort', abortNow, { once: true });
  }

  return {
    signal: controller.signal,
    timedOut: () => didTimeout,
    release: () => {
      clearTimeout(timer);
      external?.removeEventListener('abort', abortNow);
    },
  };
}

// ─── Retry policy ────────────────────────────────────────────────────────────

/**
 * Only idempotent methods are retried. Replaying a POST could create a second
 * profile or send a second OTP, so a write that fails mid-flight is surfaced to
 * the caller rather than guessed at.
 */
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function retryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

/**
 * Exponential backoff with full jitter. The randomness matters: without it,
 * every request that failed together retries together, re-creating the same
 * spike that caused the failure.
 */
function backoffDelay(attempt: number): number {
  const ceiling = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
  return Math.random() * ceiling;
}

/** Honours `Retry-After`, in both its seconds and HTTP-date forms. */
function retryAfterDelay(res: Response): number | null {
  const header = res.headers.get('Retry-After');
  if (!header) return null;

  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.min(seconds * 1000, RETRY_MAX_DELAY_MS);

  const date = Date.parse(header);
  if (Number.isNaN(date)) return null;
  return Math.min(Math.max(0, date - Date.now()), RETRY_MAX_DELAY_MS);
}

/**
 * Waits out a backoff, but gives up the moment the request is aborted — a
 * canceled request must not linger for seconds inside a retry delay.
 *
 * Rejects with the reason the signal fired, so a deadline that elapses mid
 * backoff is still reported as a timeout rather than a cancellation.
 */
function waitBeforeRetry(ms: number, link: LinkedSignal, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const abandon = () => {
      clearTimeout(timer);
      reject(link.timedOut() ? ApiError.timeout(timeoutMs) : ApiError.canceled());
    };
    const timer = setTimeout(() => {
      link.signal.removeEventListener('abort', abandon);
      resolve();
    }, ms);

    if (link.signal.aborted) return abandon();
    link.signal.addEventListener('abort', abandon, { once: true });
  });
}

// ─── Request options ─────────────────────────────────────────────────────────

export interface RequestOptions {
  /** Send the bearer token. Implied for AuthenticatedApiClient. */
  auth?: boolean;
  /** Caller cancellation — wire React Query's `signal` in here. */
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Set 0 to opt out of retries for an idempotent call. */
  retries?: number;
  headers?: Record<string, string>;
}

/**
 * The third argument stayed `boolean` for backwards compatibility with the
 * dozens of existing `get(path, true)` call sites, while new code can pass the
 * full options object.
 */
type AuthOrOptions = boolean | RequestOptions;

function normalize(value: AuthOrOptions | undefined): RequestOptions {
  if (value === undefined) return {};
  return typeof value === 'boolean' ? { auth: value } : value;
}

// ─── Response parsing ────────────────────────────────────────────────────────

async function parseBody(res: Response): Promise<unknown> {
  // 204/205 carry no body by definition; reading them yields '' anyway, but
  // short-circuiting avoids a pointless stream read.
  if (res.status === 204 || res.status === 205) return undefined;

  const text = await res.text();
  if (!text) return undefined;

  const contentType = res.headers.get('Content-Type') ?? '';
  if (!contentType.includes('json')) return text;

  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new ApiError(res.status, 'Server returned malformed JSON.', {
      kind: 'parse',
      cause,
    });
  }
}

function messageFrom(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const raw = (body as { message: unknown }).message;
    if (typeof raw === 'string' && raw) return raw;
    // NestJS validation pipes return `message` as an array of strings.
    if (Array.isArray(raw) && raw.length) return raw.join(', ');
  }
  if (typeof body === 'string' && body) return body;
  return `HTTP ${status}`;
}

// ─── Client ──────────────────────────────────────────────────────────────────

export class ApiClient {
  protected readonly base: string;
  /** Subclasses set this to force every request to carry the bearer token. */
  protected readonly forceAuth: boolean = false;

  constructor(base: string = API_URL) {
    this.base = base;
  }

  async request<T>(
    method: string,
    path: string,
    body: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const authed = options.auth === true || this.forceAuth;
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const maxRetries = options.retries ?? (IDEMPOTENT_METHODS.has(method) ? MAX_RETRIES : 0);

    // FormData must go out untouched: the browser generates the multipart
    // boundary and writes Content-Type itself. Setting it by hand produces a
    // header with no boundary, which every server rejects. Handling that here
    // is what lets multipart uploads share this client instead of hand-rolling
    // their own fetch.
    const isFormData = body instanceof FormData;
    const payload = body === undefined ? undefined : isFormData ? body : JSON.stringify(body);

    const link = linkSignals(options.signal, timeoutMs);
    let refreshAttempted = false;
    let attempt = 0;

    try {
      for (;;) {
        const tokenUsed = authed ? getAccessToken() : null;

        const headers: Record<string, string> = { ...options.headers };
        if (!isFormData && payload !== undefined) headers['Content-Type'] = 'application/json';
        if (tokenUsed) headers['Authorization'] = `Bearer ${tokenUsed}`;

        let res: Response;
        try {
          res = await fetch(`${this.base}${path}`, {
            method,
            headers,
            body: payload,
            signal: link.signal,
          });
        } catch (cause) {
          // fetch rejects for aborts and for genuine transport failures alike;
          // only the signal tells them apart.
          if (link.signal.aborted) {
            throw link.timedOut() ? ApiError.timeout(timeoutMs) : ApiError.canceled();
          }
          if (attempt < maxRetries) {
            await waitBeforeRetry(backoffDelay(attempt), link, timeoutMs);
            attempt += 1;
            continue;
          }
          throw ApiError.network(cause);
        }

        if (res.ok) return (await parseBody(res)) as T;

        // An authenticated 401 means the access token is expired or revoked.
        // Try exactly one refresh-and-replay before ending the session; more
        // than one would loop against a server that always says no.
        if (res.status === 401 && authed && !refreshAttempted) {
          refreshAttempted = true;
          const fresh = await refreshAccessToken();
          // Only replay if the token actually changed. Replaying with the same
          // token guarantees an identical 401.
          if (fresh && fresh !== tokenUsed) continue;
        }

        if (retryableStatus(res.status) && attempt < maxRetries) {
          await waitBeforeRetry(retryAfterDelay(res) ?? backoffDelay(attempt), link, timeoutMs);
          attempt += 1;
          continue;
        }

        if (res.status === 401 && authed) onUnauthorized();

        const errorBody = await parseBody(res).catch(() => undefined);
        throw new ApiError(res.status, messageFrom(errorBody, res.status), {
          body: errorBody,
        });
      }
    } finally {
      link.release();
    }
  }

  get<T>(path: string, options?: AuthOrOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, normalize(options));
  }

  post<T>(path: string, body?: unknown, options?: AuthOrOptions): Promise<T> {
    return this.request<T>('POST', path, body, normalize(options));
  }

  patch<T>(path: string, body?: unknown, options?: AuthOrOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, normalize(options));
  }

  delete<T>(path: string, options?: AuthOrOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, normalize(options));
  }
}

/**
 * Authenticated API client — every call sends the bearer token and
 * participates in refresh and global 401 handling.
 */
export class AuthenticatedApiClient extends ApiClient {
  protected override readonly forceAuth = true;
}

/** The shared instances. Everything in the app goes through one of these two. */
export const apiClient = new ApiClient();
export const authClient = new AuthenticatedApiClient();
