// ─── Slide catalog — the agent's on-screen vocabulary ────────────────────────
// Mirrors portvilla-BE `src/profile/domain/slide.ts`. Slides are *derived* by
// the backend from profile sections and served only to the voice worker; this
// file exists because the worker forwards them to us verbatim over the LiveKit
// data channel, payload inline.
//
// The payload travelling with every command is what keeps this from drifting:
// there is no slide catalog on the frontend to fall out of sync, only renderers
// for the templates it knows.

export const SlideTemplate = {
  Identity: 'identity',
  Work: 'work',
  WorkStage: 'work_stage',
  Capabilities: 'capabilities',
  Timeline: 'timeline',
  Contact: 'contact',
} as const;

export type SlideTemplate = (typeof SlideTemplate)[keyof typeof SlideTemplate];

export type WorkStatus = 'active' | 'completed' | 'in-progress' | 'archived';

export interface IdentitySlidePayload {
  entityType: string;
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
}

export interface WorkSlidePayload {
  key: string;
  type: string;
  name: string;
  tagline: string | null;
  description: string;
  url: string | null;
  repoUrl: string | null;
  coverImage: string | null;
  screenshots: { url: string; caption: string | null }[];
  technologies: string[];
  tags: string[];
  status: WorkStatus;
  highlights: string[];
  featured: boolean;
  codeSnippets: { language: string; code: string; description: string | null }[];
  date: string | null;
  /** How many stage slides follow this one in the agent's catalog. */
  stageCount: number;
}

export interface WorkStageSlidePayload {
  key: string;
  workKey: string;
  workName: string;
  label: string;
  status: WorkStatus;
  date: string | null;
  endDate: string | null;
  highlights: string[];
  /** 1-based position in the arc, and its length. */
  position: number;
  total: number;
}

export interface CapabilitiesSlidePayload {
  items: {
    key: string;
    name: string;
    description: string | null;
    icon: string | null;
    category: string | null;
    proficiency: string | null;
    yearsOfExperience: number | null;
  }[];
}

export interface TimelineSlidePayload {
  items: {
    key: string;
    category: string;
    date: string;
    endDate: string | null;
    label: string;
    organization: string | null;
    organizationLogoUrl: string | null;
    description: string | null;
    highlight: boolean;
    url: string | null;
  }[];
}

export interface ContactSlidePayload {
  links: { platform: string; url: string; label: string | null }[];
  calendarUrl: string | null;
}

/**
 * One slide as it arrives on the wire.
 *
 * Discriminated on `template`, so a renderer that narrows on it gets its own
 * payload type with no cast. `talkTrack` is deliberately absent — the spoken
 * line is the agent's script and never reaches the screen.
 */
export type Slide =
  | { slideId: string; template: typeof SlideTemplate.Identity; title: string; payload: IdentitySlidePayload }
  | { slideId: string; template: typeof SlideTemplate.Work; title: string; payload: WorkSlidePayload }
  | { slideId: string; template: typeof SlideTemplate.WorkStage; title: string; payload: WorkStageSlidePayload }
  | { slideId: string; template: typeof SlideTemplate.Capabilities; title: string; payload: CapabilitiesSlidePayload }
  | { slideId: string; template: typeof SlideTemplate.Timeline; title: string; payload: TimelineSlidePayload }
  | { slideId: string; template: typeof SlideTemplate.Contact; title: string; payload: ContactSlidePayload };

/**
 * A slide before we know whether we can render it.
 *
 * The backend may add a template (feature sub-lifecycles are already sketched)
 * before this app redeploys, so an unknown one has to be *representable* rather
 * than a parse failure — `SlideStage` renders nothing and the voice carries on.
 */
export interface UnknownSlide {
  slideId: string;
  template: string;
  title: string;
  payload: unknown;
}

export type IncomingSlide = Slide | UnknownSlide;

const KNOWN_TEMPLATES: ReadonlySet<string> = new Set(Object.values(SlideTemplate));

export function isRenderable(slide: IncomingSlide): slide is Slide {
  return KNOWN_TEMPLATES.has(slide.template);
}
