import { create } from 'zustand'
import { profileService, dashboardService } from '@/services/profile.service'
import type {
  CreateProfilePayload,
  ProfileData,
  PublicProfileData,
  UpdateProfilePayload,
} from '@/types/profile'
import { ApiError } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/errors'

interface ProfileState {
  profile: ProfileData | null
  publicProfile: PublicProfileData | null
  isLoading: boolean
  error: string | null
  notFound: boolean

  reset: () => void
  hydrateProfile: (data: ProfileData) => void
  fetchMyProfile: () => Promise<void>
  fetchPublicProfile: (username: string) => Promise<void>
  createProfile: (data: CreateProfilePayload) => Promise<ProfileData>
  updateProfile: (data: UpdateProfilePayload) => Promise<ProfileData>
  uploadResume: (file: File) => Promise<void>
  uploadProfileImage: (file: File) => Promise<void>
  deleteProfile: () => Promise<void>
  clearError: () => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  publicProfile: null,
  isLoading: false,
  error: null,
  notFound: false,

  reset: () =>
    set({
      profile: null,
      publicProfile: null,
      isLoading: false,
      error: null,
      notFound: false,
    }),

  hydrateProfile: (data) =>
    set({
      profile: data,
      isLoading: false,
      error: null,
      notFound: false,
    }),

  fetchMyProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await profileService.getMyProfile()
      set({ profile: data, isLoading: false, notFound: false })
    } catch (err) {
      const notFound = err instanceof ApiError && err.status === 404
      set({
        isLoading: false,
        notFound,
        error: notFound ? null : getApiErrorMessage(err, 'Failed to load profile.'),
        ...(notFound ? { profile: null } : {}),
      })
    }
  },

  fetchPublicProfile: async (username) => {
    set({ isLoading: true, error: null, notFound: false, publicProfile: null })
    try {
      const data = await dashboardService.getPublicProfile(username)
      set({ publicProfile: data, isLoading: false })
    } catch (err) {
      const notFound = err instanceof ApiError && (err.status === 404 || err.status === 403)
      set({
        isLoading: false,
        notFound,
        error: getApiErrorMessage(
          err,
          'This portfolio is not available yet. The public dashboard feature is coming soon.',
        ),
        publicProfile: null,
      })
    }
  },

  createProfile: async (profileData) => {
    const data = await profileService.create(profileData)
    set({ profile: data, error: null, notFound: false, isLoading: false })
    return data
  },

  updateProfile: async (profileData) => {
    const data = await profileService.update(profileData)
    set({ profile: data, error: null })
    return data
  },

  uploadResume: async (file) => {
    set({ isLoading: true, error: null })
    try {
      const data = await profileService.uploadResume(file)
      set({ profile: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: getApiErrorMessage(err, 'Failed to upload resume.') })
      throw err
    }
  },

  uploadProfileImage: async (file) => {
    set({ isLoading: true, error: null })
    try {
      const data = await profileService.uploadProfileImage(file)
      set({ profile: data, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: getApiErrorMessage(err, 'Failed to upload profile image.') })
      throw err
    }
  },

  deleteProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      await profileService.deleteMyProfile()
      set({ profile: null, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: getApiErrorMessage(err, 'Failed to delete profile.') })
      throw err
    }
  },

  clearError: () => set({ error: null }),
}))
