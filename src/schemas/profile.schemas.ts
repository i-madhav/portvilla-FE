import { z } from 'zod'
import { LlmProvider, ProfileVisibility } from '../types/profile'

const optionalUrl = z
  .string()
  .url('Must be a valid URL')
  .optional()
  .or(z.literal(''))
  .transform((v) => (v === '' ? null : v ?? null))

export const step1Schema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
      /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/,
      'Only lowercase letters, numbers, hyphens. Cannot start or end with a hyphen.',
    ),
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  introduction: z.string().optional().default(''),
  aboutMe: z.string().optional().default(''),
})

export type Step1Values = z.infer<typeof step1Schema>

const monthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM format')

const optionalMonthDateSchema = z
  .union([z.literal(''), monthDateSchema, z.null()])
  .transform((v) => (v === '' || v === null ? null : v))

export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field is required'),
  startDate: monthDateSchema,
  endDate: optionalMonthDateSchema,
  description: z.string().optional().default(''),
})

export const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  startDate: monthDateSchema,
  endDate: optionalMonthDateSchema,
  description: z.string().optional().default(''),
})

const currentPositionFormSchema = z.object({
  title: z.string().optional().default(''),
  company: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  description: z.string().optional().default(''),
})

export const step2Schema = z
  .object({
    currentPosition: currentPositionFormSchema,
    education: z.array(educationSchema).optional().default([]),
    experience: z.array(experienceSchema).optional().default([]),
    skills: z.array(z.string()).optional().default([]),
    technologies: z.array(z.string()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    const { title, company, startDate } = data.currentPosition
    const hasCurrentRole = Boolean(title.trim() || company.trim())
    if (!hasCurrentRole) return

    if (!title.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['currentPosition', 'title'],
        message: 'Title is required',
      })
    }
    if (!company.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['currentPosition', 'company'],
        message: 'Company is required',
      })
    }
    if (!/^\d{4}-\d{2}$/.test(startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['currentPosition', 'startDate'],
        message: 'Start date is required',
      })
    }
  })

export type Step2Values = z.infer<typeof step2Schema>

export const step3Schema = z.object({
  linkedin: optionalUrl,
  github: optionalUrl,
  twitter: optionalUrl,
  personalWebsite: optionalUrl,
  portfolioWebsite: optionalUrl,
})

export type Step3Values = z.infer<typeof step3Schema>

export const step4Schema = z
  .object({
    provider: z.nativeEnum(LlmProvider),
    apiKey: z.string().optional().nullable(),
    model: z.string().optional().nullable(),
    baseUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.provider === LlmProvider.OLLAMA && !data.baseUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['baseUrl'],
        message: 'Base URL is required for Ollama.',
      })
    }
    if (data.provider === LlmProvider.CUSTOM && !data.baseUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['baseUrl'],
        message: 'Base URL is required for custom providers.',
      })
    }
    if (
      data.provider !== LlmProvider.OLLAMA &&
      data.provider !== LlmProvider.CUSTOM &&
      !data.apiKey
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['apiKey'],
        message: 'API key is required for this provider.',
      })
    }
  })

export type Step4Values = z.infer<typeof step4Schema>

export const step5Schema = z
  .object({
    visibility: z.nativeEnum(ProfileVisibility),
    protectedPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.visibility === ProfileVisibility.PROTECTED && !data.protectedPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['protectedPassword'],
        message: 'Password is required when visibility is Protected.',
      })
    }
    if (
      data.visibility === ProfileVisibility.PROTECTED &&
      data.protectedPassword &&
      data.protectedPassword.length < 6
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['protectedPassword'],
        message: 'Password must be at least 6 characters.',
      })
    }
  })

export type Step5Values = z.infer<typeof step5Schema>
