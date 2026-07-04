import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@stores/store';
import { ROUTES } from '@routes/index';
import {
  useOwnProfileQuery,
  useCreateProfile,
} from '@api-hooks/profile/useProfileHooks';

import type {
  ProfileVisibility,
  CapabilityEntryDto,
  TimelineEntryDto,
  WorkEntryDto,
  SocialDto,
  CreateProfilePayload,
} from '@typings/profileApi';
import { EntityType } from '@typings/profileApi';

import { pageStyle, cardStyle, COLORS } from './styles';
import { StepIndicator } from './components/StepIndicator';
import { WelcomeStep } from './steps/WelcomeStep';
import { UsernameStep } from './steps/UsernameStep';
import { IdentityStep, type IdentityStepData } from './steps/IdentityStep';
import { ExpertiseStep } from './steps/ExpertiseStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { ProjectsStep } from './steps/ProjectsStep';
import { ContactStep } from './steps/ContactStep';

// ─── Steps ───────────────────────────────────────────────────────────────────

type OnboardingStep =
  | 'loading'
  | 'welcome'
  | 'account'
  | 'identity'
  | 'expertise'
  | 'experience'
  | 'projects'
  | 'contact';

/** Steps shown in the progress indicator (welcome/loading excluded). */
const STEPS: { key: OnboardingStep; label: string }[] = [
  { key: 'account', label: 'Account' },
  { key: 'identity', label: 'Identity' },
  { key: 'expertise', label: 'Skills' },
  { key: 'experience', label: 'Journey' },
  { key: 'projects', label: 'Work' },
  { key: 'contact', label: 'Contact' },
];

const STEP_INDEX = new Map<string, number>(STEPS.map((s, i) => [s.key, i]));

// ─── Collected form data ─────────────────────────────────────────────────────

interface OnboardingData {
  username: string;
  visibility: ProfileVisibility;
  protectedPassword: string;
  identity: IdentityStepData;
  capabilities: CapabilityEntryDto[];
  timeline: TimelineEntryDto[];
  works: WorkEntryDto[];
  social: SocialDto;
}

const INITIAL_IDENTITY: IdentityStepData = {
  name: '',
  entityType: EntityType.Individual,
  tagline: '',
  bio: '',
  about: '',
  location: '',
  industry: '',
  availability: '',
};

const INITIAL_SOCIAL: SocialDto = {
  links: [],
  email: null,
  phone: null,
  calendarUrl: null,
};

const INITIAL_DATA: OnboardingData = {
  username: '',
  visibility: 'public',
  protectedPassword: '',
  identity: INITIAL_IDENTITY,
  capabilities: [],
  timeline: [],
  works: [],
  social: INITIAL_SOCIAL,
};

// ─── Payload assembly ────────────────────────────────────────────────────────

const orNull = (s: string): string | null => (s.trim() ? s.trim() : null);

function buildCreatePayload(data: OnboardingData): CreateProfilePayload {
  const hasSocial =
    data.social.links.length > 0 ||
    !!data.social.email ||
    !!data.social.phone ||
    !!data.social.calendarUrl;

  return {
    username: data.username,
    visibility: data.visibility,
    protectedPassword:
      data.visibility === 'protected' ? data.protectedPassword : undefined,
    identity: {
      entityType: data.identity.entityType,
      name: data.identity.name,
      tagline: orNull(data.identity.tagline),
      bio: orNull(data.identity.bio),
      about: orNull(data.identity.about),
      location: orNull(data.identity.location),
      industry: orNull(data.identity.industry),
      availability: orNull(data.identity.availability),
    },
    capabilities: data.capabilities.length ? data.capabilities : undefined,
    timeline: data.timeline.length ? data.timeline : undefined,
    works: data.works.length ? data.works : undefined,
    social: hasSocial ? data.social : undefined,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OnboardingPage() {
  const navigate = useNavigate();
  const { accessToken } = useAppSelector((s) => s.auth);
  const profileState = useAppSelector((s) => s.profile);

  // Auth guard
  const authGuard = useRef(false);
  useEffect(() => {
    if (!accessToken) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
    authGuard.current = true;
  }, [accessToken, navigate]);

  // Bootstrap: check if a profile already exists
  const { isLoading: isBootstrapLoading } = useOwnProfileQuery(!!accessToken);

  const createProfileMutation = useCreateProfile();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('loading');
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);

  const currentStepIndex = STEP_INDEX.get(currentStep) ?? -1;

  const patch = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goBack = useCallback(() => {
    if (currentStep === 'account') {
      setCurrentStep('welcome');
      return;
    }
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setCurrentStep(STEPS[prevIndex].key);
  }, [currentStep, currentStepIndex]);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleCreate = useCallback(
    async (social: SocialDto) => {
      const finalData = { ...data, social };
      setData(finalData);
      try {
        await createProfileMutation.mutateAsync(buildCreatePayload(finalData));
        navigate(ROUTES.DASHBOARD, { replace: true });
      } catch {
        // handled by the mutation hook (toast + store)
      }
    },
    [data, createProfileMutation, navigate],
  );

  // ─── Redirect if a profile already exists ────────────────────────────────

  useEffect(() => {
    if (isBootstrapLoading) {
      setCurrentStep('loading');
      return;
    }
    if (profileState.exists) {
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }
    // Only leave the loading screen the first time bootstrap resolves.
    setCurrentStep((prev) => (prev === 'loading' ? 'welcome' : prev));
  }, [isBootstrapLoading, profileState.exists, navigate]);

  // ─── Loading state ───────────────────────────────────────────────────────

  if (!authGuard.current || currentStep === 'loading') {
    return (
      <div style={pageStyle}>
        <div
          style={{
            ...cardStyle,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '1rem',
              background: COLORS.inputBg,
              border: `1px solid ${COLORS.mutedText}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: COLORS.primaryText,
            }}
          >
            P
          </div>
          <div
            style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              border: `2px solid ${COLORS.mutedText}`,
              borderTopColor: COLORS.primaryText,
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ color: COLORS.mutedText, fontSize: '0.8rem', margin: 0 }}>Loading…</p>
        </div>
      </div>
    );
  }

  const isCreating = createProfileMutation.isPending;

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {currentStep !== 'welcome' && (
          <StepIndicator
            steps={STEPS.map((s) => s.label)}
            currentIndex={currentStepIndex}
            onBack={goBack}
          />
        )}

        {currentStep === 'welcome' && (
          <WelcomeStep onContinue={() => setCurrentStep('account')} />
        )}

        {currentStep === 'account' && (
          <UsernameStep
            initialUsername={data.username}
            initialVisibility={data.visibility}
            initialPassword={data.protectedPassword}
            onContinue={(username, visibility, protectedPassword) => {
              patch({ username, visibility, protectedPassword });
              setCurrentStep('identity');
            }}
            onBack={goBack}
          />
        )}

        {currentStep === 'identity' && (
          <IdentityStep
            initial={data.identity}
            onContinue={(identity) => {
              patch({ identity });
              setCurrentStep('expertise');
            }}
            onBack={goBack}
          />
        )}

        {currentStep === 'expertise' && (
          <ExpertiseStep
            initial={data.capabilities}
            onContinue={(capabilities) => {
              patch({ capabilities });
              setCurrentStep('experience');
            }}
            onBack={goBack}
          />
        )}

        {currentStep === 'experience' && (
          <ExperienceStep
            initial={data.timeline}
            onContinue={(timeline) => {
              patch({ timeline });
              setCurrentStep('projects');
            }}
            onBack={goBack}
          />
        )}

        {currentStep === 'projects' && (
          <ProjectsStep
            initial={data.works}
            onContinue={(works) => {
              patch({ works });
              setCurrentStep('contact');
            }}
            onBack={goBack}
          />
        )}

        {currentStep === 'contact' && (
          <ContactStep
            initial={data.social}
            onSubmit={handleCreate}
            onBack={goBack}
            isSubmitting={isCreating}
          />
        )}
      </div>
    </div>
  );
}
