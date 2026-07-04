// ─── Dashboard Design System ─────────────────────────────────────────────────
// Reuses the app palette (from the onboarding design system) and layers on the
// wider, multi-section dashboard layout.

import type { CSSProperties } from 'react';
import { COLORS } from '../onboarding/styles';

export { COLORS };

export const pageStyle: CSSProperties = {
  background: COLORS.pageBg,
  minHeight: '100vh',
  padding: '2rem 1rem 4rem',
};

export const containerStyle: CSSProperties = {
  maxWidth: '52rem',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

export const cardStyle: CSSProperties = {
  background: COLORS.cardBg,
  borderRadius: '0.875rem',
  padding: '1.5rem',
  border: `1px solid ${COLORS.surfaceBorder}`,
};

export const sectionTitleStyle: CSSProperties = {
  color: COLORS.primaryText,
  fontSize: '1rem',
  fontWeight: 700,
  margin: 0,
};

export const sectionDescStyle: CSSProperties = {
  color: COLORS.mutedText,
  fontSize: '0.75rem',
  margin: '0.15rem 0 0',
};

export const pillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.25rem 0.625rem',
  borderRadius: '999px',
  background: COLORS.inputBg,
  border: `1px solid ${COLORS.inputBorder}`,
  color: COLORS.primaryText,
  fontSize: '0.72rem',
  fontWeight: 500,
};

export const smallButtonStyle = (variant: 'primary' | 'ghost' = 'ghost'): CSSProperties => ({
  padding: '0.4rem 0.85rem',
  borderRadius: '0.45rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  border: variant === 'ghost' ? `1px solid ${COLORS.inputBorder}` : 'none',
  background: variant === 'primary' ? COLORS.buttonBg : 'transparent',
  color: variant === 'primary' ? COLORS.buttonText : COLORS.primaryText,
});

export const emptyTextStyle: CSSProperties = {
  color: COLORS.mutedText,
  fontSize: '0.8rem',
  fontStyle: 'italic',
  margin: 0,
};
