const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const API_PREFIX = '/api/v1';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type TokenGetter = () => string | null;

let getToken: TokenGetter = () => localStorage.getItem('accessToken');

export function setTokenGetter(fn: TokenGetter) {
  getToken = fn;
}

// ─── Global 401 handling ────────────────────────────────────────────────────
// When an *authenticated* request comes back 401, the access token is expired
// or revoked. We funnel every such case through a single handler (wired up in
// main.tsx) so the app can clear the session and redirect to /login — instead
// of silently swallowing the error and retrying forever.

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler = () => {};

export function setUnauthorizedHandler(fn: UnauthorizedHandler) {
  onUnauthorized = fn;
}

/**
 * Report that an authenticated request was rejected with 401. Exposed so
 * callers that bypass ApiClient (e.g. multipart uploads) can funnel through
 * the same session-expiry handling.
 */
export function notifyUnauthorized() {
  onUnauthorized();
}

export class ApiClient {
  protected readonly base: string;
  /** Subclasses set this to force every request to carry the bearer token. */
  protected readonly forceAuth: boolean = false;

  constructor(prefix = API_PREFIX) {
    this.base = `${API_BASE}${prefix}`;
  }

  protected headers(auth: boolean): HeadersInit {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
  }

  protected async handle<T>(res: Response, authed: boolean): Promise<T> {
    if (res.ok) {
      const text = await res.text();
      return (text ? JSON.parse(text) : undefined) as T;
    }
    // An authenticated request rejected with 401 means the session is no longer
    // valid — trigger the global sign-out + redirect before surfacing the error.
    if (res.status === 401 && authed) {
      onUnauthorized();
    }
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // use default message
    }
    throw new ApiError(res.status, message);
  }

  private async request<T>(
    method: string,
    path: string,
    body: unknown,
    auth: boolean,
  ): Promise<T> {
    const authed = auth || this.forceAuth;
    const res = await fetch(`${this.base}${path}`, {
      method,
      headers: this.headers(authed),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handle<T>(res, authed);
  }

  async post<T>(path: string, body?: unknown, auth = false): Promise<T> {
    return this.request<T>('POST', path, body, auth);
  }

  async get<T>(path: string, auth = false): Promise<T> {
    return this.request<T>('GET', path, undefined, auth);
  }

  async patch<T>(path: string, body?: unknown, auth = false): Promise<T> {
    return this.request<T>('PATCH', path, body, auth);
  }

  async delete<T>(path: string, auth = false): Promise<T> {
    return this.request<T>('DELETE', path, undefined, auth);
  }
}

/**
 * Authenticated API client — every call automatically sends the bearer token
 * and participates in global 401 handling.
 */
export class AuthenticatedApiClient extends ApiClient {
  protected override readonly forceAuth = true;
}

export const apiClient = new ApiClient();
export const authClient = new AuthenticatedApiClient();
