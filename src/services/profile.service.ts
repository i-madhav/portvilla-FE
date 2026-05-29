import { AuthenticatedApiClient, ApiClient } from '../lib/api-client'
import type { Profile } from '../stores/profileStore'

class ProfileService extends AuthenticatedApiClient {
  constructor() {
    super('/profiles')
  }

  getMyProfile() {
    return this.get<Profile>('/me')
  }

  create(data: Partial<Profile>) {
    return this.post<Profile>('', data)
  }

  update(data: Partial<Profile>) {
    return this.patch<Profile>('/me', data)
  }
}

class DashboardService extends ApiClient {
  constructor() {
    super('/dashboard')
  }

  getPublicProfile(username: string) {
    return this.get<Profile>(`/${username}`)
  }

  verifyPassword(username: string, password: string) {
    return this.post<{ message: string }>(`/${username}/verify`, { password })
  }
}

export const profileService = new ProfileService()
export const dashboardService = new DashboardService()
