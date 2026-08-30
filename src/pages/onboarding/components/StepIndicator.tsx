import { Button } from '@shared-components/ui';
import { COLORS, RADIUS, MOTION } from '@shared-components/theme';

interface StepIndicatorProps {
  currentIndex: number;
  total: number;
  label: string;
  onBack?: () => void;
}

/**
 * Compact progress: "Step 2 of 7 · About you" plus a bar.
 *
 * The previous indicator rendered all six labels side by side at 0.65rem inside
 * a 28rem card — unreadable, and it could not absorb a seventh step. It also
 * computed fill as `index / (total - 1)`, so the first step showed 0%: the user
 * was told they had made no progress at the exact moment they started.
 */
export function StepIndicator({ currentIndex, total, label, onBack }: StepIndicatorProps) {
  const pct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '0.6rem',
          minHeight: '1.5rem',
        }}
      >
        {onBack ? (
          <Button type="button" variant="ghost" size="compact" onClick={onBack}>← Back</Button>
        ) : (
          <span />
        )}

        <span style={{ color: COLORS.textMuted, fontSize: '0.75rem', letterSpacing: '0.02em' }}>
          Step {currentIndex + 1} of {total} ·{' '}
          <span style={{ color: COLORS.textSecondary, fontWeight: 600 }}>{label}</span>
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Onboarding progress: step ${currentIndex + 1} of ${total}`}
        style={{
          height: '3px',
          background: COLORS.surfaceRaised,
          borderRadius: RADIUS.pill,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: COLORS.accent,
            borderRadius: RADIUS.pill,
            transition: `width ${MOTION.slow} ${MOTION.ease}`,
          }}
        />
      </div>
    </div>
  );
}
