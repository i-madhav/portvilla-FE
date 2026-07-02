import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@stores/store';
import { ROUTES } from '@routes/index';
import {
  useOwnProfileQuery,
  useCreateProfile,
} from '@api-hooks/profile/useProfileHooks';

import type {
  EntityType,
  ProfileVisibility,
} from '@typings/profileApi';
import {
  validateUsername,
  sanitiseUsernameInput,
} from '@typings/profileApi';

import { pageStyle, cardStyle } from './styles';
import { StepIndicator } from './components/StepIndicator';
import { WelcomeStep } from './steps/WelcomeStep';
import { IdentityStep } from './steps/IdentityStep';
import { UsernameStep } from './steps/UsernameStep';

// ─── Steps ───────────────────────────────────────────────────────────────────

type OnboardingStep = 'loading' | 'welcome' | 'username' | 'identity';

interface StepMeta {
  key: OnboardingStep;
  label: string;
  order: number;
}

const STEPS: StepMeta[] = [
  { key: 'welcome', label: 'Welcome', order: 0 },
  { key: 'username', label: 'Username', order: 1 },
  { key: 'identity', label: 'About you', order: 2 },
];

const STEP_INDEX = new Map<string, number>(
  STEPS.map((s) => [s.key, s.order]),
);

// ─── Collected form data ─────────────────────────────────────────────────────

interface OnboardingData {
  username: string;
  visibility: ProfileVisibility;
  protectedPassword: string;
  entityType: EntityType;
  name: string;
  tagline: string;
  bio: string;
}

const INITIAL_DATA: OnboardingData = {
  username: '',
  visibility: 'public',
  protectedPassword: '',
  entityType: 'individual',
  name: '',
  tagline: '',
  bio: '',
};

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

  // Bootstrap: check if profile already exists
  const { isLoading: isBootstrapLoading } = useOwnProfileQuery(!!accessToken);

  // Mutations
  const createProfileMutation = useCreateProfile();

  // Stepper state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('loading');
  const [formData, setFormData] = useState<OnboardingData>(INITIAL_DATA);

  // Derive step
  const currentStepIndex = STEP_INDEX.get(currentStep) ?? -1;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const stepCount = STEPS.length;

  // ─── Navigation ───────────────────────────────────────────────────────────

  // Transition to next step — handles persistence between steps
  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < stepCount) {
      setCurrentStep(STEPS[nextIndex].key);
    }
  }, [currentStepIndex, stepCount]);

  const goBack = useCallback(() => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  }, [currentStepIndex]);

  // ─── Step transition handlers ─────────────────────────────────────────────

  const handleWelcomeContinue = useCallback(() => {
    setCurrentStep('username');
  }, []);

  const handleUsernameContinue = useCallback(
    (username: string, visibility: ProfileVisibility, protectedPassword: string) => {
      setFormData((prev) => ({ ...prev, username, visibility, protectedPassword }));
      setCurrentStep('identity');
    },
    [],
  );

  const handleIdentitySubmit = useCallback(
    async (data: {
      name: string;
      entityType: EntityType;
      tagline: string;
      bio: string;
    }) => {
      const merged = { ...formData, ...data };

      try {
        await createProfileMutation.mutateAsync({
          username: merged.username,
          visibility: merged.visibility,
          protectedPassword:
            merged.visibility === 'protected' ? merged.protectedPassword : undefined,
          identity: {
            entityType: merged.entityType,
            name: merged.name,
            tagline: merged.tagline || null,
            bio: merged.bio || null,
            about: null,
          },
        });

        // On success, redirect to the dashboard / profile edit page
        // The profile is now created and can be further populated from the dashboard.
        navigate(ROUTES.DASHBOARD, { replace: true });
      } catch {
        // Error is handled by the mutation hook (toast + store)
      }
    },
    [formData, createProfileMutation, navigate],
  );

  // ─── Redirect if profile already exists ──────────────────────────────────

  useEffect(() => {
    if (isBootstrapLoading) {
      setCurrentStep('loading');
      return;
    }

    if (profileState.exists) {
      // Profile already exists — redirect to dashboard
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }

    // No profile — start onboarding
    setCurrentStep('welcome');
  }, [isBootstrapLoading, profileState.exists, navigate]);

  if (!authGuard.current || currentStep === 'loading') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ color: '#618764', textAlign: 'center' }}>Loading…</p>
        </div>
      </div>
    );
  }

  const isMutating = createProfileMutation.isPending;

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Step indicator bar */}
        {currentStep !== 'welcome' && (
          <StepIndicator
            steps={STEPS.map((s) => s.label)}
            currentIndex={currentStepIndex}
            onBack={currentStep === 'welcome' ? undefined : goBack}
          />
        )}

        {/* Welcome step */}
        {currentStep === 'welcome' && (
          <WelcomeStep onContinue={handleWelcomeContinue} />
        )}

        {/* Username step */}
        {currentStep === 'username' && (
          <UsernameStep
            initialUsername={formData.username}
            initialVisibility={formData.visibility}
            initialPassword={formData.protectedPassword}
            onContinue={handleUsernameContinue}
            onBack={goBack}
          />
        )}

        {/* Identity step */}
        {currentStep === 'identity' && (
          <IdentityStep
            initialName={formData.name}
            initialEntityType={formData.entityType}
            initialTagline={formData.tagline}
            initialBio={formData.bio}
            onContinue={handleIdentitySubmit}
            onBack={goBack}
            isSubmitting={isMutating}
          />
        )}
      </div>
    </div>
  );
}
