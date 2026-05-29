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
}

async function rawRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...rest } = options

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      (data as { message?: string | string[] })?.message ??
      response.statusText

    throw new ApiError(
      response.status,
      Array.isArray(message) ? message.join(', ') : String(message),
      data,
    )
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

  protected async rawPost<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return rawRequest<T>(`${this.basePath}${path}`, this.buildOptions({ ...options, method: 'POST' }))
  }
}

export class AuthenticatedApiClient extends ApiClient {
  constructor(basePath: string = '') {
    super(basePath)
  }

  protected getToken(): string | null {
    const accessToken = localStorage.getItem('portvilla_access_token')
    return accessToken
  }

  private async attemptRefresh(): Promise<string | null> {
    const refreshToken = localStorage.getItem('portvilla_refresh_token')
    if (!refreshToken) return null

    try {
      const tokens = await rawRequest<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      })
      localStorage.setItem('portvilla_access_token', tokens.accessToken)
      localStorage.setItem('portvilla_refresh_token', tokens.refreshToken)
      return tokens.accessToken
    } catch {
      localStorage.removeItem('portvilla_access_token')
      localStorage.removeItem('portvilla_refresh_token')
      return null
    }
  }

  async get<T>(path: string = ''): Promise<T> {
    try {
      return await super.get<T>(path)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const newToken = await this.attemptRefresh()
        if (!newToken) throw err
        return rawRequest<T>(`${this.basePath}${path}`, { token: newToken })
      }
      throw err
    }
  }

  async post<T>(path: string = '', body?: unknown): Promise<T> {
    try {
      return await super.post<T>(path, body)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const newToken = await this.attemptRefresh()
        if (!newToken) throw err
        return rawRequest<T>(`${this.basePath}${path}`, { method: 'POST', body, token: newToken })
      }
      throw err
    }
  }

  async patch<T>(path: string = '', body?: unknown): Promise<T> {
    try {
      return await super.patch<T>(path, body)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const newToken = await this.attemptRefresh()
        if (!newToken) throw err
        return rawRequest<T>(`${this.basePath}${path}`, { method: 'PATCH', body, token: newToken })
      }
      throw err
    }
  }

  async delete<T>(path: string = ''): Promise<T> {
    try {
      return await super.delete<T>(path)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const newToken = await this.attemptRefresh()
        if (!newToken) throw err
        return rawRequest<T>(`${this.basePath}${path}`, { method: 'DELETE', token: newToken })
      }
      throw err
    }
  }
}
