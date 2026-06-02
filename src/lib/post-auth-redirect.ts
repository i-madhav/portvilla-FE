import { profileService } from '@/services/profile.service'
import { useProfileStore } from '@/stores/profileStore'
import { ApiError } from './api-client'

/**
 * After auth, route users with an existing portfolio to settings;
 * new accounts (GET /profiles/me → 404) go straight to onboarding.
 * Clears stale profile state and hydrates from the API when a profile exists.
 */
export async function resolvePostAuthPath(): Promise<'/settings' | '/onboarding'> {
  useProfileStore.getState().reset()

  try {
    const data = await profileService.getMyProfile()
    useProfileStore.getState().hydrateProfile(data)
    return '/settings'
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      useProfileStore.setState({ profile: null, notFound: true, error: null })
      return '/onboarding'
    }
    return '/settings'
  }
}
