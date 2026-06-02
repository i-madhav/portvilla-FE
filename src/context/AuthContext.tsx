import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { TokenResponse } from '../types/auth'
import type { UserAccount } from '../types/user'
import { tokenStorage } from '../lib/token-storage'
import { refreshTokens } from '../lib/token-refresh'
import { userService } from '../services/user.service'
import { ApiError } from '../lib/api-client'

interface AuthContextValue {
  accessToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  user: UserAccount | null
  setTokens: (tokens: TokenResponse) => void
  clearAuth: () => void
  refreshCurrentUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    tokenStorage.getAccessToken(),
  )
  const [user, setUser] = useState<UserAccount | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const refreshCurrentUser = useCallback(async () => {
    const token = tokenStorage.getAccessToken()
    if (!token) {
      setUser(null)
      return
    }

    try {
      const account = await userService.getMe()
      setUser(account)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        tokenStorage.clear()
        setAccessToken(null)
        setUser(null)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const storedAccess = tokenStorage.getAccessToken()
      const storedRefresh = tokenStorage.getRefreshToken()

      if (storedRefresh) {
        const tokens = await refreshTokens()
        if (cancelled) return

        if (tokens?.accessToken) {
          setAccessToken(tokens.accessToken)
        } else {
          setAccessToken(tokenStorage.getAccessToken())
        }
      } else if (storedAccess) {
        if (!cancelled) setAccessToken(storedAccess)
      } else if (!cancelled) {
        setAccessToken(null)
      }

      if (!cancelled && tokenStorage.getAccessToken()) {
        await refreshCurrentUser()
      }

      if (!cancelled) setIsInitializing(false)
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [refreshCurrentUser])

  const setTokens = useCallback(
    (tokens: TokenResponse) => {
      if (!tokens?.accessToken || !tokens?.refreshToken) {
        console.error('AuthContext.setTokens: invalid token payload', tokens)
        return
      }
      tokenStorage.setTokens(tokens)
      setAccessToken(tokens.accessToken)
      void refreshCurrentUser()
    },
    [refreshCurrentUser],
  )

  const clearAuth = useCallback(() => {
    tokenStorage.clear()
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: !!accessToken,
      isInitializing,
      user,
      setTokens,
      clearAuth,
      refreshCurrentUser,
    }),
    [accessToken, isInitializing, user, setTokens, clearAuth, refreshCurrentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
