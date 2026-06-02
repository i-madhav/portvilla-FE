import { refreshTokens } from './token-refresh'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  token?: string | null
  json?: boolean
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  return response.json().catch(() => null)
}

function extractErrorMessage(data: unknown, statusText: string): string {
  const message = (data as { message?: string | string[] })?.message ?? statusText
  return Array.isArray(message) ? message.join(', ') : String(message)
}

async function rawRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, json = true, ...rest } = options

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      body !== undefined
        ? json
          ? JSON.stringify(body)
          : (body as BodyInit)
        : undefined,
  })

  const data = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(response.status, extractErrorMessage(data, response.statusText), data)
  }

  return data as T
}

export class ApiClient {
  protected basePath: string

  constructor(basePath: string = '') {
    this.basePath = basePath
  }

  protected getToken(): string | null {
    return null
  }

  private buildOptions(options: RequestOptions = {}): RequestOptions {
    const token = this.getToken()
    return token ? { ...options, token } : options
  }

  async get<T>(path: string = ''): Promise<T> {
    return rawRequest<T>(`${this.basePath}${path}`, this.buildOptions())
  }

  async post<T>(path: string = '', body?: unknown): Promise<T> {
    return rawRequest<T>(`${this.basePath}${path}`, this.buildOptions({ method: 'POST', body }))
  }

  async patch<T>(path: string = '', body?: unknown): Promise<T> {
    return rawRequest<T>(`${this.basePath}${path}`, this.buildOptions({ method: 'PATCH', body }))
  }

  async delete<T>(path: string = ''): Promise<T> {
    return rawRequest<T>(`${this.basePath}${path}`, this.buildOptions({ method: 'DELETE' }))
  }
}

export class AuthenticatedApiClient extends ApiClient {
  constructor(basePath: string = '') {
    super(basePath)
  }

  protected getToken(): string | null {
    return localStorage.getItem('portvilla_access_token')
  }

  private async attemptRefresh(): Promise<string | null> {
    const tokens = await refreshTokens()
    return tokens?.accessToken ?? null
  }

  private async withAuthRetry<T>(fn: (token: string | null) => Promise<T>): Promise<T> {
    try {
      return await fn(this.getToken())
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const newToken = await this.attemptRefresh()
        if (!newToken) throw err
        return fn(newToken)
      }
      throw err
    }
  }

  async get<T>(path: string = ''): Promise<T> {
    return this.withAuthRetry((token) =>
      rawRequest<T>(`${this.basePath}${path}`, { token }),
    )
  }

  async post<T>(path: string = '', body?: unknown): Promise<T> {
    return this.withAuthRetry((token) =>
      rawRequest<T>(`${this.basePath}${path}`, { method: 'POST', body, token }),
    )
  }

  async patch<T>(path: string = '', body?: unknown): Promise<T> {
    return this.withAuthRetry((token) =>
      rawRequest<T>(`${this.basePath}${path}`, { method: 'PATCH', body, token }),
    )
  }

  async delete<T>(path: string = ''): Promise<T> {
    return this.withAuthRetry((token) =>
      rawRequest<T>(`${this.basePath}${path}`, { method: 'DELETE', token }),
    )
  }

  async uploadFormData<T>(path: string, formData: FormData): Promise<T> {
    return this.withAuthRetry((token) =>
      rawRequest<T>(`${this.basePath}${path}`, {
        method: 'POST',
        body: formData,
        token,
        json: false,
      }),
    )
  }
}

/** Authenticated client for auth endpoints that require Bearer (e.g. logout). */
export class AuthenticatedAuthClient extends AuthenticatedApiClient {
  constructor() {
    super('/auth')
  }
}

export const authenticatedAuthClient = new AuthenticatedAuthClient()
