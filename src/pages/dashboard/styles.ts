// ─── Dashboard layout ────────────────────────────────────────────────────────
// Shared visual language lives in @shared-components/theme. This file holds only
// what is specific to the dashboard shell.

import type { CSSProperties } from 'react';
import {
  COLORS,
  RADIUS,
  SHADOW,
  buttonStyle,
  pillStyle as themePill,
} from '@shared-components/theme';

export * from '@shared-components/theme';

export const pageStyle: CSSProperties = {
  background: COLORS.canvas,
  minHeight: '100vh',
};

/**
 * Shell and main-column layout now live entirely in `index.css`
 * (`.pv-dashboard-shell`, `.pv-dashboard-main`). Inline styles must not set
 * layout properties — they silently outrank the stylesheet.
 */

export const cardStyle: CSSProperties = {
  background: COLORS.surface,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: RADIUS.card,
  padding: '1.35rem',
  border: `1px solid ${COLORS.borderSubtle}`,
  boxShadow: SHADOW.sm,
};

export const sectionTitleStyle: CSSProperties = {
  color: COLORS.textPrimary,
  fontSize: '0.98rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  margin: 0,
};

export const sectionDescStyle: CSSProperties = {
  color: COLORS.textMuted,
  fontSize: '0.78rem',
  lineHeight: 1.45,
  margin: '0.2rem 0 0',
};

/**
 * Kept as a plain object — `display.tsx` and the sections spread it directly,
 * whereas the theme's `pillStyle` is a tone-taking function.
 */
export const pillStyle: CSSProperties = themePill('neutral');

export const smallButtonStyle = (variant: 'primary' | 'ghost' = 'ghost'): CSSProperties => ({
  ...buttonStyle(variant === 'primary' ? 'primary' : 'secondary'),
  padding: '0.4rem 0.8rem',
  fontSize: '0.78rem',
  minHeight: '2rem',
});

export const emptyTextStyle: CSSProperties = {
  color: COLORS.textMuted,
  fontSize: '0.82rem',
  margin: 0,
};
