import { AuthenticatedApiClient, ApiClient } from '../lib/api-client'
import type {
  CreateProfilePayload,
  ProfileData,
  PublicProfileData,
  UpdateProfilePayload,
} from '../types/profile'

/** Portfolio CRUD — base path `/profiles` (distinct from account `/users/me`). */
class ProfileService extends AuthenticatedApiClient {
  constructor() {
    super('/profiles')
  }

  getMyProfile() {
    return this.get<ProfileData>('/me')
  }

  create(payload: CreateProfilePayload) {
    return this.post<ProfileData>('', payload)
  }

  update(payload: UpdateProfilePayload) {
    return this.patch<ProfileData>('/me', payload)
  }

  uploadResume(file: File) {
    const form = new FormData()
    form.append('resume', file)
    return this.uploadFormData<ProfileData>('/me/resume', form)
  }

  uploadProfileImage(file: File) {
    const form = new FormData()
    form.append('profileImage', file)
    return this.uploadFormData<ProfileData>('/me/profile-image', form)
  }

  deleteMyProfile() {
    return this.delete<void>('/me')
  }
}

/** Pending backend dashboard module — public portfolio by username. */
class DashboardService extends ApiClient {
  constructor() {
    super('/dashboard')
  }

  getPublicProfile(username: string) {
    return this.get<PublicProfileData>(`/${username}`)
  }

  verifyPassword(username: string, password: string) {
    return this.post<{ message: string }>(`/${username}/verify`, { password })
  }
}

export const profileService = new ProfileService()
export const dashboardService = new DashboardService()
