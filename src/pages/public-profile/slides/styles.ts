import type { CSSProperties } from 'react';
import { COLORS } from '@shared-components/theme';

/**
 * The type scale every slide shares.
 *
 * Split from the components beside them only because a module that exports both
 * constants and components defeats fast refresh — they are one design decision.
 */

export const slideTitleStyle: CSSProperties = {
  color: COLORS.textPrimary,
  fontSize: '1.35rem',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  margin: 0,
  lineHeight: 1.2,
};

export const slideBodyStyle: CSSProperties = {
  color: COLORS.textSecondary,
  fontSize: '0.92rem',
  lineHeight: 1.65,
  margin: 0,
};

export const eyebrowStyle: CSSProperties = {
  color: COLORS.textMuted,
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  margin: 0,
};

export const stackStyle = (gap = '0.75rem'): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  gap,
  minWidth: 0,
});
