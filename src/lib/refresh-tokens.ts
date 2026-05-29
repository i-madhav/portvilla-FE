import { apiClient } from './api-client'
import { tokenStorage } from './token-storage'
import { type TokenResponse } from '../types/auth'

let refreshPromise: Promise<string | null> | null = null

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) return null

    try {
      const tokens = await apiClient<TokenResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      })
      tokenStorage.setTokens(tokens)
      return tokens.accessToken
    } catch {
      tokenStorage.clear()
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}
