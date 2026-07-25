import { COLORS, MOTION, buttonStyle } from '@shared-components/theme';

interface StepActionsProps {
  continueLabel?: string;
  onSkip?: () => void;
  skipLabel?: string;
  /**
   * Escape hatch to the dashboard. Offered on every optional step: once the
   * profile exists there is no reason to hold someone hostage to four more
   * screens, and everything skipped here is promoted on the dashboard anyway.
   */
  onFinishNow?: () => void;
  disabled?: boolean;
  busy?: boolean;
  /** Explains a disabled primary action instead of leaving a dead button. */
  disabledHint?: string;
}

export function StepActions({
  continueLabel = 'Continue',
  onSkip,
  skipLabel = 'Skip for now',
  onFinishNow,
  disabled = false,
  busy = false,
  disabledHint,
}: StepActionsProps) {
  const blocked = disabled || busy;

  return (
    <div style={{ marginTop: '1.75rem' }}>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <button
          type="submit"
          className="pv-focusable"
          disabled={blocked}
          style={{ ...buttonStyle('primary', blocked), flex: 1 }}
        >
          {busy ? 'Saving…' : continueLabel}
        </button>

        {onSkip && (
          <button
            type="button"
            className="pv-focusable"
            onClick={onSkip}
            disabled={busy}
            style={buttonStyle('secondary', busy)}
          >
            {skipLabel}
          </button>
        )}
      </div>

      {disabled && disabledHint && (
        <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', margin: '0.55rem 0 0' }}>
          {disabledHint}
        </p>
      )}

      {onFinishNow && (
        <div style={{ textAlign: 'center', marginTop: '0.9rem' }}>
          <button
            type="button"
            className="pv-focusable"
            onClick={onFinishNow}
            disabled={busy}
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.textMuted,
              fontSize: '0.78rem',
              cursor: busy ? 'not-allowed' : 'pointer',
              padding: '0.3rem',
              textDecoration: 'underline',
              textUnderlineOffset: '0.2em',
              transition: `color ${MOTION.fast}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.textSecondary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textMuted)}
          >
            Finish setup — I'll add the rest later
          </button>
        </div>
      )}
    </div>
  );
}
