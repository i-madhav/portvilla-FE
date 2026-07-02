import { COLORS } from '../styles';

interface StepIndicatorProps {
  steps: string[];
  currentIndex: number;
  onBack?: () => void;
}

export function StepIndicator({ steps, currentIndex, onBack }: StepIndicatorProps) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Back button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.textMuted,
            fontSize: '0.75rem',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            transition: 'color 0.15s',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.textSecondary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textMuted)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Progress bar (horizontal line with filled segment) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          height: '2px',
          background: COLORS.surfaceBorder,
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.gradientTo})`,
            borderRadius: '2px',
            transition: 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>

      {/* Step labels beneath progress bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.5rem',
        }}
      >
        {steps.map((label, i) => {
          const isActive = i <= currentIndex;
          return (
            <span
              key={label}
              style={{
                fontSize: '0.65rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? COLORS.accent : COLORS.textMuted,
                transition: 'color 0.3s',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
