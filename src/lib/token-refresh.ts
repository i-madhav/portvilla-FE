import { tokenStorage } from './token-storage'
import type { TokenResponse } from '../types/auth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

let refreshPromise: Promise<TokenResponse | null> | null = null

/**
 * Rotates the refresh token pair via POST /auth/refresh.
 * Deduplicates concurrent calls and only clears storage when the failed
 * token is still the active one (avoids wiping tokens set by a fresh login).
 */
export async function refreshTokens(): Promise<TokenResponse | null> {
  if (refreshPromise) return refreshPromise

  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return null

  const tokenUsed = refreshToken

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokenUsed }),
      })

      const data = (await response.json().catch(() => null)) as
        | TokenResponse
        | { message?: string }
        | null

      if (!response.ok) {
        throw new Error(
          typeof data === 'object' && data && 'message' in data
            ? String(data.message)
            : response.statusText,
        )
      }

      const tokens = data as TokenResponse
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error('Invalid token response from server')
      }

      // Apply only if login has not replaced tokens in the meantime
      if (tokenStorage.getRefreshToken() === tokenUsed) {
        tokenStorage.setTokens(tokens)
      }

      return tokens
    } catch {
      if (tokenStorage.getRefreshToken() === tokenUsed) {
        tokenStorage.clear()
      }
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}
