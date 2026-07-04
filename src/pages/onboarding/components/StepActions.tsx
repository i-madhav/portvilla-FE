import { primaryButtonStyle, ghostButtonStyle } from '../styles';

interface StepActionsProps {
  continueLabel?: string;
  /** When provided, renders a secondary "Skip for now" button. */
  onSkip?: () => void;
  skipLabel?: string;
  onBack: () => void;
  disabled?: boolean;
}

/** Shared footer for onboarding steps: primary submit + optional skip + back. */
export function StepActions({
  continueLabel = 'Continue',
  onSkip,
  skipLabel = 'Skip for now',
  onBack,
  disabled = false,
}: StepActionsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
      <button type="submit" disabled={disabled} style={primaryButtonStyle(disabled)}>
        {continueLabel}
      </button>
      {onSkip && (
        <button type="button" onClick={onSkip} style={ghostButtonStyle()}>
          {skipLabel}
        </button>
      )}
      <button type="button" onClick={onBack} style={ghostButtonStyle()}>
        ← Back
      </button>
    </div>
  );
}
