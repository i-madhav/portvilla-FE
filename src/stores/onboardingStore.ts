import { create } from 'zustand'
import type { CreateProfilePayload } from '@/types/profile'
import { ProfileVisibility } from '@/types/profile'
import type {
  Step1Values,
  Step2Values,
  Step3Values,
  Step4Values,
  Step5Values,
} from '@/schemas/profile.schemas'

interface OnboardingState {
  step1: Step1Values | null
  step2: Step2Values | null
  step3: Step3Values | null
  step4: Step4Values | null
  step5: Step5Values | null
  usernameConflictError: string | null

  setStep1: (data: Step1Values) => void
  setStep2: (data: Step2Values) => void
  setStep3: (data: Step3Values) => void
  setStep4: (data: Step4Values) => void
  setStep5: (data: Step5Values) => void
  setUsernameConflictError: (message: string | null) => void
  buildCreatePayload: () => CreateProfilePayload
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step1: null,
  step2: null,
  step3: null,
  step4: null,
  step5: null,
  usernameConflictError: null,

  setStep1: (data) => set({ step1: data, usernameConflictError: null }),
  setStep2: (data) => set({ step2: data }),
  setStep3: (data) => set({ step3: data }),
  setStep4: (data) => set({ step4: data }),
  setStep5: (data) => set({ step5: data }),
  setUsernameConflictError: (message) => set({ usernameConflictError: message }),

  buildCreatePayload: () => {
    const { step1, step2, step3, step4, step5 } = get()
    if (!step1) throw new Error('Basic info is required')

    const visibility = step5?.visibility ?? ProfileVisibility.PUBLIC

    return {
      username: step1.username,
      visibility,
      ...(visibility === ProfileVisibility.PROTECTED && step5?.protectedPassword
        ? { protectedPassword: step5.protectedPassword }
        : {}),
      basic: {
        name: step1.name,
        title: step1.title,
        introduction: step1.introduction,
        aboutMe: step1.aboutMe,
      },
      professional: {
        ...(step2?.currentPosition?.title &&
        step2?.currentPosition?.company &&
        step2?.currentPosition?.startDate
          ? {
              currentPosition: {
                title: step2.currentPosition.title,
                company: step2.currentPosition.company,
                startDate: step2.currentPosition.startDate,
                description: step2.currentPosition.description ?? '',
              },
            }
          : {}),
        skills: step2?.skills ?? [],
        technologies: step2?.technologies ?? [],
        education: step2?.education ?? [],
        experience: step2?.experience ?? [],
        interests: [],
        achievements: [],
        certifications: [],
        awards: [],
        additionalNotes: '',
      },
      external: {
        linkedin: step3?.linkedin ?? null,
        github: step3?.github ?? null,
        twitter: step3?.twitter ?? null,
        personalWebsite: step3?.personalWebsite ?? null,
        portfolioWebsite: step3?.portfolioWebsite ?? null,
        researchPapers: [],
        projects: [],
        blogs: [],
        otherProfiles: [],
      },
      aiSettings: step4
        ? {
            provider: step4.provider,
            apiKey: step4.apiKey ?? null,
            model: step4.model ?? null,
            baseUrl: step4.baseUrl || null,
          }
        : undefined,
    }
  },

  reset: () =>
    set({
      step1: null,
      step2: null,
      step3: null,
      step4: null,
      step5: null,
      usernameConflictError: null,
    }),
}))
