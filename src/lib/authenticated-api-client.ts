import { apiClient } from './api-client'
import { tokenStorage } from './token-storage'
import { refreshAccessToken } from './refresh-tokens'
import { ApiError } from './api-client'

export async function authenticatedApiClient<T>(
  path: string,
  options: Parameters<typeof apiClient>[1] = {},
): Promise<T> {
  const accessToken = tokenStorage.getAccessToken()

  try {
    return await apiClient<T>(path, { ...options, token: accessToken })
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const newToken = await refreshAccessToken()
      if (!newToken) throw err
      return apiClient<T>(path, { ...options, token: newToken })
    }
    throw err
  }
}
