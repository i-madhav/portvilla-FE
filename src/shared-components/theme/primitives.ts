// ─── Shared style primitives ─────────────────────────────────────────────────
// Built on the tokens in ./tokens. Both onboarding and dashboard consume these,
// so a control looks and behaves the same wherever it appears.

import type { CSSProperties } from 'react';
import { COLORS, RADIUS, SHADOW, FONT, MOTION } from './tokens';

// ─── Typography ──────────────────────────────────────────────────────────────

export const displayStyle: CSSProperties = {
  color: COLORS.textPrimary,
  fontSize: 'clamp(1.5rem, 1.2rem + 1.2vw, 1.9rem)',
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  margin: 0,
};

export const titleStyle: CSSProperties = {
  color: COLORS.textPrimary,
  fontSize: '1.15rem',
  fontWeight: 700,
  lineHeight: 1.25,
  letterSpacing: '-0.01em',
  margin: 0,
};

export const bodyStyle: CSSProperties = {
  color: COLORS.textSecondary,
  fontSize: '0.9rem',
  lineHeight: 1.55,
  margin: 0,
};

export const mutedStyle: CSSProperties = {
  color: COLORS.textMuted,
  fontSize: '0.8rem',
  lineHeight: 1.5,
  margin: 0,
};

export const labelStyle: CSSProperties = {
  display: 'block',
  color: COLORS.textSecondary,
  fontSize: '0.8rem',
  fontWeight: 600,
  marginBottom: '0.4rem',
};

// ─── Surfaces ────────────────────────────────────────────────────────────────

export const cardStyle: CSSProperties = {
  background: COLORS.surface,
  borderRadius: RADIUS.xl,
  border: `1px solid ${COLORS.borderSubtle}`,
  boxShadow: SHADOW.md,
};

// ─── Inputs ──────────────────────────────────────────────────────────────────
// Font size stays >= 16px on touch targets; below that iOS Safari zooms the
// viewport on focus, which reads as the page jumping mid-form.

const controlBase: CSSProperties = {
  width: '100%',
  padding: '0.7rem 0.85rem',
  borderRadius: RADIUS.md,
  fontSize: '1rem',
  fontFamily: FONT.sans,
  outline: 'none',
  background: COLORS.fieldFill,
  color: COLORS.textPrimary,
  border: `1px solid ${COLORS.border}`,
  transition: `border-color ${MOTION.fast}, box-shadow ${MOTION.fast}`,
  boxSizing: 'border-box',
};

export type FieldState = 'default' | 'error' | 'success';

export function inputStyle(state: FieldState = 'default'): CSSProperties {
  const borderColor =
    state === 'error' ? COLORS.danger : state === 'success' ? COLORS.success : COLORS.border;
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
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23879a8d' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.85rem center',
    paddingRight: '2.25rem',
  };
}

/** Focus ring. Applied on focus/blur handlers so keyboard users get a visible target. */
export const focusRing: CSSProperties = {
  borderColor: COLORS.borderFocus,
  boxShadow: `0 0 0 3px ${COLORS.accentSubtle}`,
};

// ─── Buttons ─────────────────────────────────────────────────────────────────

const buttonBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  padding: '0.7rem 1.1rem',
  borderRadius: RADIUS.md,
  fontSize: '0.9rem',
  fontWeight: 600,
  fontFamily: FONT.sans,
  cursor: 'pointer',
  border: '1px solid transparent',
  transition: `background ${MOTION.fast}, border-color ${MOTION.fast}, opacity ${MOTION.fast}`,
  textAlign: 'center',
  lineHeight: 1.2,
  minHeight: '2.75rem', // 44px — the minimum comfortable touch target
};

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function buttonStyle(variant: ButtonVariant = 'primary', disabled = false): CSSProperties {
  // Disabled controls are exempt from WCAG contrast, but the old palette put
  // them at 1.59:1 — invisible rather than merely inactive. These stay legible.
  if (disabled) {
    return {
      ...buttonBase,
      background: variant === 'primary' ? COLORS.surfaceRaised : 'transparent',
      color: COLORS.textMuted,
      borderColor: variant === 'ghost' ? 'transparent' : COLORS.borderSubtle,
      cursor: 'not-allowed',
    };
  }

  switch (variant) {
    case 'primary':
      return { ...buttonBase, background: COLORS.accent, color: COLORS.onAccent };
    case 'secondary':
      return {
        ...buttonBase,
        background: 'transparent',
        color: COLORS.textPrimary,
        borderColor: COLORS.border,
      };
    case 'danger':
      return {
        ...buttonBase,
        background: 'transparent',
        color: COLORS.danger,
        borderColor: COLORS.danger,
      };
    case 'ghost':
    default:
      return { ...buttonBase, background: 'transparent', color: COLORS.textSecondary };
  }
}

// ─── Pills / chips ───────────────────────────────────────────────────────────

export function pillStyle(tone: 'neutral' | 'accent' | 'success' | 'warning' = 'neutral'): CSSProperties {
  const map = {
    neutral: { bg: COLORS.surfaceRaised, fg: COLORS.textSecondary, bd: COLORS.borderSubtle },
    accent: { bg: COLORS.accentSubtle, fg: COLORS.accent, bd: 'transparent' },
    success: { bg: COLORS.successSubtle, fg: COLORS.success, bd: 'transparent' },
    warning: { bg: COLORS.warningSubtle, fg: COLORS.warning, bd: 'transparent' },
  }[tone];

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.3rem 0.6rem',
    borderRadius: RADIUS.pill,
    background: map.bg,
    border: `1px solid ${map.bd}`,
    color: map.fg,
    fontSize: '0.78rem',
    fontWeight: 500,
    lineHeight: 1.3,
  };
}

// ─── Status messages ─────────────────────────────────────────────────────────

export function noticeStyle(tone: 'error' | 'success' | 'info'): CSSProperties {
  const map = {
    error: { bg: COLORS.dangerSubtle, fg: COLORS.danger },
    success: { bg: COLORS.successSubtle, fg: COLORS.success },
    info: { bg: COLORS.accentSubtle, fg: COLORS.accent },
  }[tone];

  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.45rem',
    background: map.bg,
    color: map.fg,
    fontSize: '0.8rem',
    lineHeight: 1.45,
    padding: '0.55rem 0.7rem',
    borderRadius: RADIUS.md,
    margin: 0,
  };
}
