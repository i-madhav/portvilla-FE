import { create } from 'zustand'
import { profileService, dashboardService } from '@/services/profile.service'

export interface Profile {
  _id: string
  userId: string
  username: string
  visibility: 'public' | 'private' | 'protected'
  basic: {
    name: string
    title: string
    profileImage?: string
    introduction: string
    aboutMe: string
  }
  professional: {
    resume?: { url: string; parsedText: string }
    education: Array<{
      institution: string
      degree: string
      field: string
      startDate: string
      endDate: string
      description: string
    }>
    currentPosition?: {
      title: string
      company: string
      startDate: string
      description: string
    }
    experience: Array<{
      title: string
      company: string
      startDate: string
      endDate: string
      description: string
    }>
    skills: string[]
    technologies: string[]
    interests: string[]
    achievements: string[]
    certifications: Array<{
      name: string
      issuer: string
      date: string
      url: string
    }>
    awards: string[]
    additionalNotes: string
  }
  external: {
    linkedin?: string
    github?: string
    twitter?: string
    personalWebsite?: string
    portfolioWebsite?: string
    researchPapers: Array<{ title: string; url: string; abstract: string }>
    projects: Array<{ name: string; url: string; description: string; technologies: string[] }>
    blogs: string[]
    otherProfiles: Array<{ platform: string; url: string }>
  }
}

interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  fetchMyProfile: () => Promise<void>
  fetchPublicProfile: (username: string) => Promise<void>
  createProfile: (data: Partial<Profile>) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,

  fetchMyProfile: async () => {
    set({ isLoading: true })
    try {
      const data = await profileService.getMyProfile()
      set({ profile: data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchPublicProfile: async (username) => {
    set({ isLoading: true })
    try {
      const data = await dashboardService.getPublicProfile(username)
      set({ profile: data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  createProfile: async (profileData) => {
    const data = await profileService.create(profileData)
    set({ profile: data })
  },

  updateProfile: async (profileData) => {
    const data = await profileService.update(profileData)
    set({ profile: data })
  },
}))
