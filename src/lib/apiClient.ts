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

export class ApiClient {
  private readonly base: string;

  constructor(prefix = API_PREFIX) {
    this.base = `${API_BASE}${prefix}`;
  }

  private headers(auth = false): HeadersInit {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
  }

  private async handle<T>(res: Response): Promise<T> {
    if (res.ok) {
      const text = await res.text();
      return (text ? JSON.parse(text) : undefined) as T;
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

  async post<T>(path: string, body?: unknown, auth = false): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: this.headers(auth),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handle<T>(res);
  }

  async get<T>(path: string, auth = false): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      method: 'GET',
      headers: this.headers(auth),
    });
    return this.handle<T>(res);
  }

  async patch<T>(path: string, body?: unknown, auth = false): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      method: 'PATCH',
      headers: this.headers(auth),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handle<T>(res);
  }

  async delete<T>(path: string, auth = false): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      method: 'DELETE',
      headers: this.headers(auth),
    });
    return this.handle<T>(res);
  }
}

export const apiClient = new ApiClient();
