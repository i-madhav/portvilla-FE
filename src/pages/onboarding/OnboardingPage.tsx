import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@stores/store';
import { ROUTES } from '@routes/index';
import { useOwnProfileQuery } from '@api-hooks/profile/useProfileHooks';
import type { ResumeSuggestionsDto } from '@typings/profileApi';
import { Brand } from '@shared-components/ui';

import { pageStyle, shellStyle, formColumnStyle, COLORS } from './styles';
import { StepIndicator } from './components/StepIndicator';
import { ProfilePreview } from './components/ProfilePreview';
import { AccountStep } from './steps/AccountStep';
import { IdentityStep } from './steps/IdentityStep';
import { ResumeStep } from './steps/ResumeStep';
import { SkillsStep } from './steps/SkillsStep';
import { JourneyStep } from './steps/JourneyStep';
import { WorkStep } from './steps/WorkStep';
import { ContactStep } from './steps/ContactStep';
import {
  useOnboardingFlow,
  STEPS,
  stepIndex,
  hasOnboardingInProgress,
  clearDraft,
} from './useOnboardingFlow';

const EMPTY_SUGGESTIONS: ResumeSuggestionsDto = {
  identity: null,
  capabilities: [],
  timeline: [],
  works: [],
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const { accessToken } = useAppSelector((s) => s.auth);
  const profileState = useAppSelector((s) => s.profile);

  const { isLoading: isBootstrapping } = useOwnProfileQuery(!!accessToken);

  const [suggestions, setSuggestions] = useState<ResumeSuggestionsDto>(EMPTY_SUGGESTIONS);

  const finish = useCallback(() => navigate(ROUTES.DASHBOARD, { replace: true }), [navigate]);
  const flow = useOnboardingFlow(finish);

  useEffect(() => {
    if (!accessToken) navigate(ROUTES.LOGIN, { replace: true });
  }, [accessToken, navigate]);

  // A profile that exists with no draft in flight means onboarding is done (or
  // was done on another device) — the dashboard is where they belong. When a
  // draft *is* in flight the profile exists on purpose: it was created at the
  // Identity step and the remaining steps are still patching it.
  useEffect(() => {
    if (isBootstrapping) return;
    if (profileState.exists && !hasOnboardingInProgress()) {
      clearDraft();
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isBootstrapping, profileState.exists, navigate]);

  const applySuggestions = useCallback(
    (s: ResumeSuggestionsDto) => {
      setSuggestions(s);
      // Identity hints are the only part safe to merge without review: they fill
      // fields the user left blank and never overwrite something they typed.
      if (s.identity) {
        flow.patch({
          identity: {
            ...flow.data.identity,
            tagline: flow.data.identity.tagline || s.identity.tagline || '',
            bio: flow.data.identity.bio || s.identity.bio || '',
            location: flow.data.identity.location || s.identity.location || '',
            industry: flow.data.identity.industry || s.identity.industry || '',
          },
        });
      }
      flow.goTo('skills');
    },
    [flow],
  );

  if (!accessToken || isBootstrapping) {
    return (
      <div style={{ ...pageStyle, alignItems: 'center' }}>
        <div
          aria-label="Loading"
          style={{
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: '50%',
            border: `2px solid ${COLORS.borderSubtle}`,
            borderTopColor: COLORS.accent,
            animation: 'spin 0.7s linear infinite',
          }}
        />
      </div>
    );
  }

  const index = stepIndex(flow.step);
  const { busy, data } = { busy: flow.isCommitting, data: flow.data };

  return (
    <div style={pageStyle}>
      <header className="mx-auto mb-6 flex w-full max-w-content items-center justify-between gap-4">
        <Brand />
        <p className="font-mono text-label uppercase text-ink-45">setup / {String(index + 1).padStart(2, '0')} of {String(STEPS.length).padStart(2, '0')}</p>
      </header>
      <div className="pv-onboarding-shell" style={shellStyle}>
        <div className="pv-form-column" style={formColumnStyle}>
          <StepIndicator
            currentIndex={index}
            total={STEPS.length}
            label={STEPS[index].label}
            onBack={index > 0 ? flow.goBack : undefined}
          />

          {flow.step === 'account' && (
            <AccountStep
              username={data.username}
              visibility={data.visibility}
              protectedPassword={data.protectedPassword}
              externalError={flow.usernameError}
              onClearExternalError={flow.clearUsernameError}
              busy={busy}
              onContinue={(v) => void flow.commitAndAdvance(v)}
            />
          )}

          {flow.step === 'identity' && (
            <IdentityStep
              initial={data.identity}
              busy={busy}
              onContinue={(identity) => void flow.commitAndAdvance({ identity })}
            />
          )}

          {flow.step === 'resume' && (
            <ResumeStep
              onSuggestions={applySuggestions}
              onSkip={() => flow.goTo('skills')}
              onFinishNow={() => void flow.finish({})}
            />
          )}

          {flow.step === 'skills' && (
            <SkillsStep
              initial={data.capabilities}
              suggested={suggestions.capabilities.map((c) => c.name)}
              busy={busy}
              onContinue={(capabilities) => void flow.commitAndAdvance({ capabilities })}
              onSkip={() => flow.goTo('journey')}
              onFinishNow={() => void flow.finish({})}
            />
          )}

          {flow.step === 'journey' && (
            <JourneyStep
              initial={data.timeline}
              suggested={suggestions.timeline}
              busy={busy}
              onContinue={(timeline) => void flow.commitAndAdvance({ timeline })}
              onSkip={() => flow.goTo('work')}
              onFinishNow={() => void flow.finish({})}
            />
          )}

          {flow.step === 'work' && (
            <WorkStep
              initial={data.works}
              suggested={suggestions.works}
              busy={busy}
              onContinue={(works) => void flow.commitAndAdvance({ works })}
              onSkip={() => flow.goTo('contact')}
              onFinishNow={() => void flow.finish({})}
            />
          )}

          {flow.step === 'contact' && (
            <ContactStep
              initial={data.social}
              busy={busy}
              onSubmit={(social) => void flow.finish({ social })}
            />
          )}
        </div>

        <ProfilePreview data={data} />
      </div>
    </div>
  );
}
