import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { TokenResponse } from '../types/auth'
import { tokenStorage } from '../lib/token-storage'
import { decodeJwt } from '../lib/jwt-decode'
import { refreshAccessToken } from '../lib/refresh-tokens'

interface AuthContextValue {
  accessToken: string | null
  isAuthenticated: boolean
  user: { id: string; email: string; role: string } | null
  setTokens: (tokens: TokenResponse) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    tokenStorage.getAccessToken(),
  )

  // Try to refresh token on mount
  useEffect(() => {
    const refreshToken = tokenStorage.getRefreshToken()
    if (refreshToken) {
      refreshAccessToken().then((token) => {
        if (token) {
          setAccessToken(token)
        } else {
          tokenStorage.clear()
          setAccessToken(null)
        }
      })
    }
  }, [])

  const setTokens = useCallback((tokens: TokenResponse) => {
    tokenStorage.setTokens(tokens)
    setAccessToken(tokens.accessToken)
  }, [])

  const clearAuth = useCallback(() => {
    tokenStorage.clear()
    setAccessToken(null)
  }, [])

  const user = useMemo(() => {
    if (!accessToken) return null
    const payload = decodeJwt(accessToken)
    if (!payload) return null
    return { id: payload.sub, email: payload.email, role: payload.role }
  }, [accessToken])

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: !!accessToken,
      user,
      setTokens,
      clearAuth,
    }),
    [accessToken, user, setTokens, clearAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
