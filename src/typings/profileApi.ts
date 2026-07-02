// ─── Profile API — request / response types ─────────────────────────────────
// This is the single source of truth for every DTO, enum, and response shape
// consumed by the frontend. Matches the BE Swagger spec exactly.

// ─── Enums ────────────────────────────────────────────────────────────────────

export const EntityType = {
  Individual: 'individual',
  Company: 'company',
  Product: 'product',
  Organization: 'organization',
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export const ProfileVisibility = {
  Public: 'public',
  Private: 'private',
  Protected: 'protected',
} as const;

export type ProfileVisibility = (typeof ProfileVisibility)[keyof typeof ProfileVisibility];

export const WorkType = {
  Project: 'project',
  Product: 'product',
  CaseStudy: 'case_study',
  Artwork: 'artwork',
  Research: 'research',
  Other: 'other',
} as const;

export type WorkType = (typeof WorkType)[keyof typeof WorkType];

export const TimelineCategory = {
  Career: 'career',
  Education: 'education',
  Certification: 'certification',
  Award: 'award',
  Milestone: 'milestone',
  ProductLaunch: 'product_launch',
  Other: 'other',
} as const;

export type TimelineCategory = (typeof TimelineCategory)[keyof typeof TimelineCategory];

export const CapabilityProficiency = {
  Familiar: 'familiar',
  Proficient: 'proficient',
  Expert: 'expert',
} as const;

export type CapabilityProficiency = (typeof CapabilityProficiency)[keyof typeof CapabilityProficiency];

export const TestimonialRelationship = {
  Colleague: 'colleague',
  Manager: 'manager',
  Client: 'client',
  User: 'user',
  Investor: 'investor',
  Other: 'other',
} as const;

export type TestimonialRelationship = (typeof TestimonialRelationship)[keyof typeof TestimonialRelationship];

export const ContentType = {
  Blog: 'blog',
  Talk: 'talk',
  Paper: 'paper',
  Video: 'video',
  Podcast: 'podcast',
  Course: 'course',
  Other: 'other',
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export const LlmProvider = {
  OpenAi: 'openai',
  Anthropic: 'anthropic',
  Groq: 'groq',
  DeepSeek: 'deepseek',
  Ollama: 'ollama',
  Custom: 'custom',
} as const;

export type LlmProvider = (typeof LlmProvider)[keyof typeof LlmProvider];

export const AgentTone = {
  Formal: 'formal',
  Balanced: 'balanced',
  Casual: 'casual',
} as const;

export type AgentTone = (typeof AgentTone)[keyof typeof AgentTone];

export const AgentVerbosity = {
  Concise: 'concise',
  Detailed: 'detailed',
} as const;

export type AgentVerbosity = (typeof AgentVerbosity)[keyof typeof AgentVerbosity];

export const AgentTechnicalDepth = {
  High: 'high',
  Medium: 'medium',
  Low: 'low',
} as const;

export type AgentTechnicalDepth = (typeof AgentTechnicalDepth)[keyof typeof AgentTechnicalDepth];

export const AgentSpeakingSpeed = {
  Slow: 'slow',
  Normal: 'normal',
  Fast: 'fast',
} as const;

export type AgentSpeakingSpeed = (typeof AgentSpeakingSpeed)[keyof typeof AgentSpeakingSpeed];

// ─── Nested DTOs ──────────────────────────────────────────────────────────────

export interface IdentityDto {
  entityType: EntityType;
  name: string;

  tagline?: string | null;
  bio?: string | null;
  about?: string | null;
  primaryImage?: string | null;
  coverImage?: string | null;
  location?: string | null;
  foundedOrBorn?: string | null;
  industry?: string | null;
  availability?: string | null;
}

export interface UpdateIdentityDto {
  entityType?: EntityType;
  name?: string;
  tagline?: string | null;
  bio?: string | null;
  about?: string | null;
  primaryImage?: string | null;
  coverImage?: string | null;
  location?: string | null;
  foundedOrBorn?: string | null;
  industry?: string | null;
  availability?: string | null;
}

export interface WorkEntryDto {
  type: WorkType;
  name: string;
  tagline: string | null;
  description: string;
  url: string | null;
  repoUrl: string | null;
  coverImage: string | null;
  screenshots: { url: string; caption: string | null }[];
  technologies: string[];
  tags: string[];
  status: 'active' | 'completed' | 'in-progress' | 'archived';
  highlights: string[];
  featured: boolean;
  codeSnippets: { language: string; code: string; description: string | null }[];
  date: string | null;
}

export interface TimelineEntryDto {
  category: TimelineCategory;
  date: string; // "YYYY-MM"
  endDate: string | null;
  label: string;
  organization: string | null;
  organizationLogoUrl: string | null;
  description: string | null;
  highlight: boolean;
  url: string | null;
}

export interface CapabilityEntryDto {
  name: string;
  description: string | null;
  icon: string | null; // Lucide icon name
  category: string | null;
  proficiency: CapabilityProficiency | null;
  yearsOfExperience: number | null;
}

export interface OfferingEntryDto {
  name: string;
  description: string;
  icon: string | null;
  price: string | null;
  features: string[];
  highlighted: boolean;
  tags: string[];
  cta: { label: string; url: string } | null;
}

export interface MetricEntryDto {
  value: string; // e.g. "5k+"
  label: string; // e.g. "GitHub Stars"
  description: string | null;
  icon: string | null;
  category: string | null;
}

export interface TestimonialEntryDto {
  text: string;
  author: string;
  role: string | null;
  organization: string | null;
  avatarUrl: string | null;
  relationship: TestimonialRelationship;
  featured: boolean;
}

export interface TeamMemberEntryDto {
  name: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  links: { platform: string; url: string }[];
}

export interface MediaEntryDto {
  url: string;
  caption: string | null;
  type: 'image' | 'video';
  category: string | null;
}

export interface ContentEntryDto {
  type: ContentType;
  title: string;
  url: string;
  description: string | null;
  thumbnailUrl: string | null;
  date: string | null;
  tags: string[];
  featured: boolean;
}

export interface SocialDto {
  links: { platform: string; url: string; label: string | null }[];
  email: string | null;
  phone: string | null;
  calendarUrl: string | null;
}

export interface AiSettingsDto {
  provider: LlmProvider;
  apiKey?: string | null;
  model?: string | null;
  baseUrl?: string | null;
}

export interface UpdateAgentPersonaDto {
  agentName?: string; // max 32 chars
  tone?: AgentTone;
  verbosity?: AgentVerbosity;
  technicalDepth?: AgentTechnicalDepth;
  speakingSpeed?: AgentSpeakingSpeed;
  voiceId?: string | null;
}

export interface UpdateVisibilityDto {
  visibility: ProfileVisibility;
  protectedPassword?: string; // required when visibility = "protected", min 6 chars
}

// ─── Create / Update payloads ─────────────────────────────────────────────────

export interface CreateProfilePayload {
  username: string;
  identity: IdentityDto;
  visibility?: ProfileVisibility;
  protectedPassword?: string;
  works?: WorkEntryDto[];
  timeline?: TimelineEntryDto[];
  capabilities?: CapabilityEntryDto[];
  offerings?: OfferingEntryDto[];
  metrics?: MetricEntryDto[];
  testimonials?: TestimonialEntryDto[];
  team?: TeamMemberEntryDto[];
  media?: MediaEntryDto[];
  content?: ContentEntryDto[];
  social?: SocialDto;
  aiSettings?: AiSettingsDto;
}

export interface UpdateProfilePayload {
  identity?: UpdateIdentityDto;
  works?: WorkEntryDto[];
  timeline?: TimelineEntryDto[];
  capabilities?: CapabilityEntryDto[];
  offerings?: OfferingEntryDto[];
  metrics?: MetricEntryDto[];
  testimonials?: TestimonialEntryDto[];
  team?: TeamMemberEntryDto[];
  media?: MediaEntryDto[];
  content?: ContentEntryDto[];
  social?: SocialDto;
  aiSettings?: AiSettingsDto;
  agentPersona?: UpdateAgentPersonaDto;
  visibility?: UpdateVisibilityDto;
}

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface ResumeSection {
  url: string | null;
  parsedText: string | null;
}

export interface IdentitySection {
  entityType: EntityType;
  name: string;
  tagline: string | null;
  bio: string | null;
  about: string | null;
  primaryImage: string | null;
  coverImage: string | null;
  location: string | null;
  foundedOrBorn: string | null;
  industry: string | null;
  availability: string | null;
  resume: ResumeSection;
}

export interface AiSettingsResponseDto {
  provider: LlmProvider;
  apiKeyConfigured: boolean;
  model: string | null;
  baseUrl: string | null;
}

export interface AgentPersonaResponseDto {
  agentName: string;
  tone: AgentTone;
  verbosity: AgentVerbosity;
  technicalDepth: AgentTechnicalDepth;
  speakingSpeed: AgentSpeakingSpeed;
  voiceId: string | null;
}

/** Full profile record returned to the authenticated owner. */
export interface ProfileDataResponseDto {
  id: string;
  userId: string;
  username: string;
  visibility: ProfileVisibility;
  identity: IdentitySection;
  works: WorkEntryDto[];
  timeline: TimelineEntryDto[];
  capabilities: CapabilityEntryDto[];
  offerings: OfferingEntryDto[];
  metrics: MetricEntryDto[];
  testimonials: TestimonialEntryDto[];
  team: TeamMemberEntryDto[];
  media: MediaEntryDto[];
  content: ContentEntryDto[];
  social: SocialDto;
  aiSettings: AiSettingsResponseDto;
  agentPersona: AgentPersonaResponseDto;
  createdAt: string;
  updatedAt: string;
}

// ─── Username validation ──────────────────────────────────────────────────────

/** Reserved slugs that the server rejects as usernames. */
export const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'auth', 'me', 'dashboard', 'login', 'register',
  'signup', 'logout', 'profile', 'user', 'users', 'health', 'static',
  'public', 'private', 'support', 'help', 'about', 'contact', 'terms',
  'privacy',
]);

export const USERNAME_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export interface UsernameValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate a username client-side before sending it to the server.
 * Returns a result with the validation outcome and error reason.
 */
export function validateUsername(username: string): UsernameValidationResult {
  const trimmed = username.trim().toLowerCase();

  if (trimmed.length < 3) {
    return { valid: false, reason: 'Username must be at least 3 characters.' };
  }
  if (trimmed.length > 30) {
    return { valid: false, reason: 'Username must be at most 30 characters.' };
  }
  if (!/^[a-z0-9]/.test(trimmed)) {
    return { valid: false, reason: 'Username must start with a lowercase letter or digit.' };
  }
  if (!/[a-z0-9]$/.test(trimmed)) {
    return { valid: false, reason: 'Username must end with a lowercase letter or digit.' };
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    return { valid: false, reason: 'Username may only contain lowercase letters, digits, and hyphens.' };
  }
  if (RESERVED_USERNAMES.has(trimmed)) {
    return { valid: false, reason: 'This username is reserved and cannot be used.' };
  }

  return { valid: true };
}

/**
 * Sanitise a username input in real-time (while the user is typing).
 * Strips invalid characters, lowercases, and prevents leading/trailing hyphens.
 */
export function sanitiseUsernameInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')    // strip invalid chars
    .replace(/^-+/, '')             // strip leading hyphens
    .replace(/-+$/, '');            // strip trailing hyphens
}
