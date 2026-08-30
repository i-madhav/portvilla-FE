// ─── Onboarding layout ───────────────────────────────────────────────────────
// Shared visual language lives in @shared-components/theme. This file only holds
// what is specific to the onboarding shell.

import type { CSSProperties } from 'react';
import { COLORS, RADIUS, SHADOW, SPACE } from '@shared-components/theme';

export * from '@shared-components/theme';

export const pageStyle: CSSProperties = {
  background: COLORS.canvas,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: `${SPACE['2xl']} ${SPACE.lg} ${SPACE['3xl']}`,
};

/** A single, focused column. The product creates a voice representative, so a
 * fake web-page preview would teach the wrong mental model during setup. */
export const shellStyle: CSSProperties = {
  width: '100%',
  maxWidth: '42rem',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: SPACE.xl,
  alignItems: 'start',
};

export const formColumnStyle: CSSProperties = {
  background: COLORS.surface,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: RADIUS.card,
  border: `1px solid ${COLORS.borderSubtle}`,
  boxShadow: SHADOW.lg,
  padding: 'clamp(1.35rem, 4vw, 2rem)',
  width: '100%',
  maxWidth: '42rem',
  margin: '0 auto',
  boxSizing: 'border-box',
};

export const stepHeaderStyle: CSSProperties = {
  marginBottom: SPACE.xl,
};

export const subtitleStyle: CSSProperties = {
  color: COLORS.textMuted,
  fontSize: '0.875rem',
  lineHeight: 1.55,
  margin: '0.4rem 0 0',
};

export function fieldGroupStyle(marginBottom = '1.15rem'): CSSProperties {
  return { marginBottom };
}

export const dividerStyle: CSSProperties = {
  border: 'none',
  borderTop: `1px solid ${COLORS.borderSubtle}`,
  margin: `${SPACE.xl} 0`,
};

/** Selectable card (visibility, entity type). */
export function optionCardStyle(selected: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    padding: '0.75rem 0.85rem',
    borderRadius: RADIUS.tile,
    background: selected ? COLORS.accentSubtle : COLORS.surfaceRaised,
    border: `1px solid ${selected ? COLORS.accent : COLORS.borderSubtle}`,
    cursor: 'pointer',
    transition: 'background 120ms, border-color 120ms',
  };
}
