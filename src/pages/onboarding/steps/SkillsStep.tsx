import { useState, useCallback } from 'react';
import type { CapabilityEntryDto } from '@typings/profileApi';
import { ChipInput } from '@shared-components/forms/ChipInput';
import { StepActions } from '../components/StepActions';
import { StepHeader } from '../components/StepHeader';
import { COLORS, noticeStyle } from '../styles';

interface SkillsStepProps {
  initial: CapabilityEntryDto[];
  /** Skill names drafted from the resume, offered as one-tap adds. */
  suggested: string[];
  onContinue: (capabilities: CapabilityEntryDto[]) => void;
  onSkip: () => void;
  onFinishNow: () => void;
  busy: boolean;
}

/**
 * Onboarding captures the name only. Category, proficiency and years are
 * refinements the dashboard handles — asking for them here is what turned eight
 * skills into twenty-four fields and made this the most abandoned step.
 */
const toCapability = (name: string): CapabilityEntryDto => ({
  name,
  description: null,
  icon: null,
  category: null,
  proficiency: null,
  yearsOfExperience: null,
});

export function SkillsStep({
  initial,
  suggested,
  onContinue,
  onSkip,
  onFinishNow,
  busy,
}: SkillsStepProps) {
  const [names, setNames] = useState<string[]>(() => initial.map((c) => c.name));

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cleaned = names.map((n) => n.trim()).filter(Boolean);
      // Preserve any detail already attached to a skill (e.g. from a previous
      // pass through the flow) rather than flattening it back to a bare name.
      const byName = new Map(initial.map((c) => [c.name.toLowerCase(), c]));
      onContinue(cleaned.map((n) => byName.get(n.toLowerCase()) ?? toCapability(n)));
    },
    [names, initial, onContinue],
  );

  return (
    <form onSubmit={handleSubmit}>
      <StepHeader
        title="What are you good at?"
        subtitle="Type a skill and press Enter. These are what your agent will speak to."
      />

      {suggested.length > 0 && (
        <p style={{ ...noticeStyle('info'), marginBottom: '1rem' }}>
          <span>
            We drafted these from your resume — tap to add the ones that fit, ignore the rest.
          </span>
        </p>
      )}

      <ChipInput
        ariaLabel="Skills"
        values={names}
        onChange={setNames}
        placeholder="React, System design, Brand strategy…"
        suggestions={suggested}
      />

      <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', margin: '0.75rem 0 0' }}>
        {names.length === 0
          ? 'Most profiles list five to ten.'
          : `${names.length} skill${names.length === 1 ? '' : 's'} · add proficiency and grouping later from your dashboard`}
      </p>

      <StepActions
        continueLabel="Continue"
        onSkip={onSkip}
        onFinishNow={onFinishNow}
        busy={busy}
      />
    </form>
  );
}
