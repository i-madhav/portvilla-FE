export enum ProfileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
}

export enum LlmProvider {
  OPENAI = 'openai',
  GROQ = 'groq',
  OLLAMA = 'ollama',
  CUSTOM = 'custom',
}

export interface EducationEntry {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string | null
  description: string
}

export interface CurrentPosition {
  title: string
  company: string
  startDate: string
  description: string
}

export interface ExperienceEntry {
  title: string
  company: string
  startDate: string
  endDate: string | null
  description: string
}

export interface CertificationEntry {
  name: string
  issuer: string
  date: string
  url: string | null
}

export interface ResearchPaperEntry {
  title: string
  url: string
  abstract: string
}

export interface ProjectEntry {
  name: string
  url: string | null
  description: string
  technologies: string[]
}

export interface OtherProfileEntry {
  platform: string
  url: string
}

export interface BasicSection {
  name: string
  title: string
  profileImage: string | null
  introduction: string
  aboutMe: string
}

export interface ProfessionalSection {
  resume: {
    url: string | null
    parsedText: string | null
  }
  education: EducationEntry[]
  currentPosition: CurrentPosition | null
  experience: ExperienceEntry[]
  skills: string[]
  technologies: string[]
  interests: string[]
  achievements: string[]
  certifications: CertificationEntry[]
  awards: string[]
  additionalNotes: string
}

export interface ExternalSection {
  linkedin: string | null
  github: string | null
  twitter: string | null
  personalWebsite: string | null
  portfolioWebsite: string | null
  researchPapers: ResearchPaperEntry[]
  projects: ProjectEntry[]
  blogs: string[]
  otherProfiles: OtherProfileEntry[]
}

export interface AiSettingsResponse {
  provider: LlmProvider
  apiKeyConfigured: boolean
  model: string | null
  baseUrl: string | null
}

export interface ProfileData {
  id: string
  userId: string
  username: string
  visibility: ProfileVisibility
  basic: BasicSection
  professional: ProfessionalSection
  external: ExternalSection
  aiSettings: AiSettingsResponse
  createdAt: string
  updatedAt: string
}

/** Public portfolio view — same shape minus sensitive fields (pending dashboard BE). */
export type PublicProfileData = ProfileData

export interface CreateProfilePayload {
  username: string
  visibility?: ProfileVisibility
  protectedPassword?: string
  basic: {
    name: string
    title: string
    introduction?: string
    aboutMe?: string
  }
  professional?: Partial<Omit<ProfessionalSection, 'resume'>>
  external?: Partial<ExternalSection>
  aiSettings?: {
    provider: LlmProvider
    apiKey?: string | null
    model?: string | null
    baseUrl?: string | null
  }
}

export interface UpdateProfilePayload {
  basic?: Partial<Omit<BasicSection, 'profileImage'>>
  professional?: Partial<Omit<ProfessionalSection, 'resume'>>
  external?: Partial<ExternalSection>
  aiSettings?: {
    provider: LlmProvider
    apiKey?: string | null
    model?: string | null
    baseUrl?: string | null
  }
  visibility?: {
    visibility: ProfileVisibility
    protectedPassword?: string
  }
}
