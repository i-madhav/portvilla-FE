import type { CSSProperties } from 'react';
import { COLORS } from '../styles';

interface StepIndicatorProps {
  steps: string[];
  currentIndex: number;
  onBack?: () => void;
}

export function StepIndicator({ steps, currentIndex, onBack }: StepIndicatorProps) {
  return (
    <div style={containerStyle}>
      {onBack && (
        <button
          type="button"
          style={backButtonStyle}
          onClick={onBack}
          aria-label="Go back"
        >
          ← Back
        </button>
      )}

      <div style={stepDotsStyle}>
        {steps.map((label, i) => (
          <div key={label} style={dotWrapperStyle}>
            <div
              style={{
                ...dotStyle,
                background: i <= currentIndex ? COLORS.accent : 'transparent',
                border: `2px solid ${i <= currentIndex ? COLORS.accent : COLORS.mutedText}`,
              }}
            />
            <span
              style={{
                ...stepLabelStyle,
                color: i <= currentIndex ? COLORS.primaryText : COLORS.mutedText,
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const containerStyle: CSSProperties = {
  marginBottom: '1.5rem',
};

const backButtonStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: COLORS.mutedText,
  fontSize: '0.75rem',
  cursor: 'pointer',
  padding: 0,
  marginBottom: '0.75rem',
  display: 'block',
};

const stepDotsStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const dotWrapperStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  flex: 1,
};

const dotStyle: CSSProperties = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  flexShrink: 0,
  transition: 'all 0.2s',
};

const stepLabelStyle: CSSProperties = {
  fontSize: '0.65rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};
