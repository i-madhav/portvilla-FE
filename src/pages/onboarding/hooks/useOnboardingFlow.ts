import { useState, useCallback, useEffect, useRef } from 'react';
import { useCreateProfile, useUpdateProfile } from '@api-hooks/profile/useProfileHooks';
import type {
  ProfileVisibility,
  CapabilityEntryDto,
  TimelineEntryDto,
  WorkEntryDto,
  SocialDto,
  CreateProfilePayload,
  UpdateProfilePayload,
  EntityType,
} from '@typings/profileApi';
import { EntityType as EntityTypeEnum } from '@typings/profileApi';

// ─── Steps ───────────────────────────────────────────────────────────────────

export type OnboardingStep =
  | 'account'
  | 'identity'
  | 'resume'
  | 'skills'
  | 'journey'
  | 'work'
  | 'contact';

const ALL_STEPS: { key: OnboardingStep; label: string }[] = [
  { key: 'account', label: 'Agent link' },
  { key: 'identity', label: 'Core context' },
  { key: 'resume', label: 'Resume' },
  { key: 'skills', label: 'Expertise' },
  { key: 'journey', label: 'Experience' },
  { key: 'work', label: 'Proof' },
  { key: 'contact', label: 'Contact' },
];

/**
 * `resume` only makes sense for a person — it parses a CV into skills/experience.
 * A company, product, or organization has no resume, so the step (and the round
 * trip through it) is dropped entirely for those entity types rather than shown
 * and skipped.
 */
function stepsFor(entityType: EntityType): { key: OnboardingStep; label: string }[] {
  if (entityType === EntityTypeEnum.Individual) return ALL_STEPS;
  return ALL_STEPS.filter((s) => s.key !== 'resume');
}

/** The profile is created here — every step after this one PATCHes. */
const CREATE_AT_STEP: OnboardingStep = 'identity';

export const stepIndex = (
  s: OnboardingStep,
  steps: { key: OnboardingStep; label: string }[] = ALL_STEPS,
): number => steps.findIndex((x) => x.key === s);

// ─── Data ────────────────────────────────────────────────────────────────────

export interface IdentityStepData {
  name: string;
  entityType: EntityType;
  tagline: string;
  bio: string;
  about: string;
  location: string;
  industry: string;
  availability: string;
}

export interface OnboardingData {
  username: string;
  visibility: ProfileVisibility;
  protectedPassword: string;
  identity: IdentityStepData;
  capabilities: CapabilityEntryDto[];
  timeline: TimelineEntryDto[];
  works: WorkEntryDto[];
  social: SocialDto;
}

const INITIAL_DATA: OnboardingData = {
  username: '',
  visibility: 'public',
  protectedPassword: '',
  identity: {
    name: '',
    entityType: EntityTypeEnum.Individual,
    tagline: '',
    bio: '',
    about: '',
    location: '',
    industry: '',
    availability: '',
  },
  capabilities: [],
  timeline: [],
  works: [],
  social: { links: [], email: null, phone: null, calendarUrl: null },
};

// ─── Draft persistence ───────────────────────────────────────────────────────
// The old flow held everything in useState and only POSTed on the final step, so
// a refresh — or a drop at step five — discarded every answer. Two things fix
// that: the profile is created early (so later steps PATCH real rows), and the
// pre-create answers plus the current step survive here.

const DRAFT_KEY = 'portvilla:onboarding:v1';

interface Draft {
  step: OnboardingStep;
  data: OnboardingData;
  profileCreated: boolean;
}

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (!parsed.step || !parsed.data) return null;
    if (!ALL_STEPS.some((s) => s.key === parsed.step)) return null;
    return {
      step: parsed.step,
      data: { ...INITIAL_DATA, ...parsed.data },
      profileCreated: parsed.profileCreated === true,
    };
  } catch {
    // A corrupt or unavailable draft must never block onboarding.
    return null;
  }
}

function writeDraft(draft: Draft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Private mode / quota — the flow still works, it just won't resume.
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* nothing to clean up */
  }
}

/** True when a half-finished onboarding is in progress for an existing profile. */
export function hasOnboardingInProgress(): boolean {
  const draft = readDraft();
  return draft !== null && draft.profileCreated;
}

// ─── Payload assembly ────────────────────────────────────────────────────────

const orNull = (s: string): string | null => (s.trim() ? s.trim() : null);

function identityPayload(i: IdentityStepData) {
  return {
    entityType: i.entityType,
    name: i.name.trim(),
    tagline: orNull(i.tagline),
    bio: orNull(i.bio),
    about: orNull(i.about),
    location: orNull(i.location),
    industry: orNull(i.industry),
    availability: orNull(i.availability),
  };
}

function buildCreatePayload(d: OnboardingData): CreateProfilePayload {
  return {
    username: d.username,
    visibility: d.visibility,
    protectedPassword: d.visibility === 'protected' ? d.protectedPassword : undefined,
    identity: identityPayload(d.identity),
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseOnboardingFlow {
  step: OnboardingStep;
  /** Steps applicable to the currently selected entity type, in order. */
  steps: { key: OnboardingStep; label: string }[];
  data: OnboardingData;
  profileCreated: boolean;
  isCommitting: boolean;
  /** Set when the username collided at create time — sends the user back to `account`. */
  usernameError: string | null;
  patch: (partial: Partial<OnboardingData>) => void;
  goTo: (step: OnboardingStep) => void;
  goBack: () => void;
  /** Persists the step's data, then advances. Rejects only on unrecoverable errors. */
  commitAndAdvance: (partial: Partial<OnboardingData>) => Promise<void>;
  finish: (partial: Partial<OnboardingData>) => Promise<void>;
  clearUsernameError: () => void;
}

export function useOnboardingFlow(onFinished: () => void): UseOnboardingFlow {
  const restored = useRef<Draft | null>(readDraft()).current;

  const [step, setStep] = useState<OnboardingStep>(restored?.step ?? 'account');
  const [data, setData] = useState<OnboardingData>(restored?.data ?? INITIAL_DATA);
  const [profileCreated, setProfileCreated] = useState(restored?.profileCreated ?? false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();

  const steps = stepsFor(data.identity.entityType);

  useEffect(() => {
    writeDraft({ step, data, profileCreated });
  }, [step, data, profileCreated]);

  // If the entity type changes (e.g. the user goes back and switches from
  // Individual to Company) while sitting on a step that no longer applies,
  // move them forward to the next step that still does — never leave them
  // stranded on a step that's disappeared from the flow.
  useEffect(() => {
    if (steps.some((s) => s.key === step)) return;
    const fullIndex = stepIndex(step, ALL_STEPS);
    const next = ALL_STEPS.slice(fullIndex + 1).find((s) => steps.some((v) => v.key === s.key));
    setStep(next?.key ?? steps[steps.length - 1].key);
  }, [steps, step]);

  const patch = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const goTo = useCallback((next: OnboardingStep) => setStep(next), []);

  const goBack = useCallback(() => {
    const i = stepIndex(step, steps);
    if (i > 0) setStep(steps[i - 1].key);
  }, [step, steps]);

  /** Maps a step's collected data onto the PATCH body. */
  const patchBodyFor = useCallback(
    (current: OnboardingStep, d: OnboardingData): UpdateProfilePayload | null => {
      switch (current) {
        case 'skills':
          return { capabilities: d.capabilities };
        case 'journey':
          return { timeline: d.timeline };
        case 'work':
          return { works: d.works };
        case 'contact':
          return { social: d.social };
        // `identity` creates rather than patches; `resume` uploads via its own
        // endpoint and writes nothing here; `account` is folded into create.
        default:
          return null;
      }
    },
    [],
  );

  const persist = useCallback(
    async (current: OnboardingStep, next: OnboardingData): Promise<boolean> => {
      if (current === CREATE_AT_STEP && !profileCreated) {
        try {
          await createMutation.mutateAsync(buildCreatePayload(next));
          setProfileCreated(true);
        } catch (err) {
          const e = err as { status?: number; message?: string };
          // The username was free when checked and taken by the time we created.
          // Send the user back to the field that owns the problem rather than
          // failing them on a step they cannot fix from.
          if (e.status === 409) {
            setUsernameError('That username was just taken. Try another.');
            setStep('account');
            return false;
          }
          throw err;
        }
        return true;
      }

      if (!profileCreated) return true; // pre-create steps have nothing to PATCH yet

      const body = patchBodyFor(current, next);
      if (body) await updateMutation.mutateAsync(body);
      return true;
    },
    [profileCreated, createMutation, updateMutation, patchBodyFor],
  );

  const commitAndAdvance = useCallback(
    async (partial: Partial<OnboardingData>) => {
      const next = { ...data, ...partial };
      setData(next);

      try {
        const persisted = await persist(step, next);
        if (!persisted) return;
      } catch {
        // The mutation hooks already toast. Stay on the step so the user can
        // retry — advancing would silently drop what they just entered.
        return;
      }

      const i = stepIndex(step, steps);
      if (i < steps.length - 1) setStep(steps[i + 1].key);
    },
    [data, step, persist, steps],
  );

  const finish = useCallback(
    async (partial: Partial<OnboardingData>) => {
      const next = { ...data, ...partial };
      setData(next);
      try {
        await persist(step, next);
      } catch {
        return;
      }
      clearDraft();
      onFinished();
    },
    [data, step, persist, onFinished],
  );

  return {
    step,
    steps,
    data,
    profileCreated,
    isCommitting: createMutation.isPending || updateMutation.isPending,
    usernameError,
    patch,
    goTo,
    goBack,
    commitAndAdvance,
    finish,
    clearUsernameError: useCallback(() => setUsernameError(null), []),
  };
}
