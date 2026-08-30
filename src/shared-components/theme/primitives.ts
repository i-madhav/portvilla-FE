import type { CSSProperties } from 'react';
import { COLORS, RADIUS, SHADOW, FONT, MOTION } from './tokens';

export const displayStyle: CSSProperties = {
  color: COLORS.textPrimary,
  fontSize: 'clamp(2.125rem, 4.4vw, 3.625rem)',
  fontWeight: 700,
  lineHeight: 1.02,
  letterSpacing: '-0.035em',
  margin: 0,
  textWrap: 'balance',
};

export const titleStyle: CSSProperties = {
  color: COLORS.textPrimary,
  fontSize: '1.25rem',
  fontWeight: 600,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  margin: 0,
};

export const bodyStyle: CSSProperties = {
  color: COLORS.textSecondary,
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  margin: 0,
};

export const mutedStyle: CSSProperties = {
  color: COLORS.textMuted,
  fontSize: '0.8125rem',
  lineHeight: 1.5,
  margin: 0,
};

export const labelStyle: CSSProperties = {
  display: 'block',
  color: COLORS.textMuted,
  fontFamily: FONT.mono,
  fontSize: '0.71875rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '0.5rem',
};

export const cardStyle: CSSProperties = {
  background: COLORS.surface,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: RADIUS.card,
  border: `1px solid ${COLORS.borderSubtle}`,
  boxShadow: SHADOW.sm,
};

const controlBase: CSSProperties = {
  width: '100%',
  padding: '0.875rem 1rem',
  borderRadius: RADIUS.tile,
  fontSize: '1rem',
  fontFamily: FONT.sans,
  outline: 'none',
  background: COLORS.fieldFill,
  color: COLORS.textPrimary,
  border: `1px solid ${COLORS.border}`,
  transition: `border-color ${MOTION.fast} ${MOTION.ease}, box-shadow ${MOTION.fast} ${MOTION.ease}`,
  boxSizing: 'border-box',
};

export type FieldState = 'default' | 'error' | 'success';

export function inputStyle(state: FieldState = 'default'): CSSProperties {
  const borderColor = state === 'error'
    ? COLORS.danger
    : state === 'success'
      ? COLORS.accent
      : COLORS.border;
  return { ...controlBase, borderColor };
}

export function textareaStyle(state: FieldState = 'default'): CSSProperties {
  return { ...inputStyle(state), resize: 'vertical', minHeight: '5.5rem', lineHeight: 1.55 };
}

export function selectStyle(state: FieldState = 'default'): CSSProperties {
  return {
    ...inputStyle(state),
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: 'linear-gradient(45deg, transparent 50%, rgba(20,19,26,.45) 50%), linear-gradient(135deg, rgba(20,19,26,.45) 50%, transparent 50%)',
    backgroundPosition: 'calc(100% - 1rem) center, calc(100% - .7rem) center',
    backgroundSize: '.35rem .35rem, .35rem .35rem',
    backgroundRepeat: 'no-repeat',
    paddingRight: '2.5rem',
  };
}

export const focusRing: CSSProperties = {
  borderColor: COLORS.borderFocus,
  boxShadow: `0 0 0 3px ${COLORS.accentSubtle}`,
};

const buttonBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  padding: '0.875rem 1.625rem',
  borderRadius: RADIUS.pill,
  fontSize: '0.875rem',
  fontWeight: 600,
  fontFamily: FONT.sans,
  cursor: 'pointer',
  border: '1px solid transparent',
  transition: `border-color ${MOTION.fast} ${MOTION.ease}, transform ${MOTION.fast} ${MOTION.ease}, opacity ${MOTION.fast} ${MOTION.ease}`,
  textAlign: 'center',
  lineHeight: 1.2,
  minHeight: '2.75rem',
};

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function buttonStyle(variant: ButtonVariant = 'primary', disabled = false): CSSProperties {
  if (disabled) {
    return {
      ...buttonBase,
      background: variant === 'primary' ? COLORS.textMuted : COLORS.surface,
      color: variant === 'primary' ? COLORS.surfaceRaised : COLORS.textMuted,
      borderColor: variant === 'ghost' ? 'transparent' : COLORS.borderSubtle,
      boxShadow: 'none',
      cursor: 'not-allowed',
      opacity: 0.68,
    };
  }

  switch (variant) {
    case 'primary':
      return { ...buttonBase, background: COLORS.textPrimary, color: COLORS.canvas, boxShadow: SHADOW.cta };
    case 'secondary':
      return { ...buttonBase, background: COLORS.surface, color: COLORS.textPrimary, borderColor: COLORS.border };
    case 'danger':
      return { ...buttonBase, background: COLORS.surface, color: COLORS.danger, borderColor: COLORS.border };
    case 'ghost':
    default:
      return { ...buttonBase, background: 'transparent', color: COLORS.textSecondary };
  }
}

export function pillStyle(tone: 'neutral' | 'accent' | 'success' | 'warning' = 'neutral'): CSSProperties {
  const active = tone !== 'neutral';
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.65rem',
    borderRadius: RADIUS.pill,
    background: active ? COLORS.accentSubtle : COLORS.surface,
    border: `1px solid ${active ? 'transparent' : COLORS.borderSubtle}`,
    color: active ? COLORS.accentHover : COLORS.textSecondary,
    fontFamily: FONT.mono,
    fontSize: '0.71875rem',
    fontWeight: 500,
    lineHeight: 1.3,
  };
}

export function noticeStyle(tone: 'error' | 'success' | 'info'): CSSProperties {
  const blocking = tone === 'error';
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.45rem',
    background: blocking ? COLORS.dangerSubtle : COLORS.accentSubtle,
    color: blocking ? COLORS.danger : COLORS.accentHover,
    border: `1px solid ${blocking ? COLORS.border : COLORS.accentSubtle}`,
    fontFamily: FONT.mono,
    fontSize: '0.75rem',
    lineHeight: 1.5,
    padding: '0.7rem 0.8rem',
    borderRadius: RADIUS.tile,
    margin: 0,
  };
}
