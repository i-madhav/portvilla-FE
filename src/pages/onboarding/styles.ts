// ─── Onboarding Design System ────────────────────────────────────────────────
// Sticks to the established auth-page palette (#273338 / #2B5748 / #9CB080 / #618764)
// but elevates layout, typography, spacing, and micro-interactions for a premium feel.

import type { CSSProperties } from 'react';

export const COLORS = {
  pageBg: '#273338',
  cardBg: '#2B5748',
  inputBg: '#273338',
  inputBorder: '#618764',
  inputBorderFocus: '#9CB080',
  primaryText: '#9CB080',
  secondaryText: '#7ea068',
  mutedText: '#618764',
  accent: '#9CB080',
  accentGlow: 'rgba(156, 176, 128, 0.12)',
  errorText: '#ff7b6b',
  errorBg: '#273338',
  successText: '#9CB080',
  buttonBg: '#618764',
  buttonText: '#273338',
  buttonDisabled: '#3d5a4a',
  buttonDisabledText: '#5a7a5e',
  divider: '#618764',
  surfaceBorder: '#618764',
  surfaceElevated: '#1f3a30',
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────

export const pageStyle: CSSProperties = {
  background: COLORS.pageBg,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  position: 'relative',
};

export const cardStyle: CSSProperties = {
  background: COLORS.cardBg,
  borderRadius: '1rem',
  padding: '2.5rem 2.5rem 2rem',
  width: '100%',
  maxWidth: '28rem',
  position: 'relative',
};

// ─── Typography ──────────────────────────────────────────────────────────────

export const titleStyle: CSSProperties = {
  color: COLORS.primaryText,
  fontSize: '1.5rem',
  fontWeight: 700,
  lineHeight: 1.2,
  marginBottom: '0.375rem',
};

export const subtitleStyle: CSSProperties = {
  color: COLORS.mutedText,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  marginBottom: '1.75rem',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  color: COLORS.primaryText,
  fontSize: '0.75rem',
  fontWeight: 600,
  marginBottom: '0.375rem',
};

export const hintStyle: CSSProperties = {
  color: COLORS.mutedText,
  fontSize: '0.7rem',
  marginTop: '0.25rem',
};

// ─── Inputs ──────────────────────────────────────────────────────────────────

const inputBase: CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  outline: 'none',
  background: COLORS.inputBg,
  color: COLORS.primaryText,
  border: `1px solid ${COLORS.inputBorder}`,
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

export function inputStyle(hasError = false): CSSProperties {
  return {
    ...inputBase,
    borderColor: hasError ? COLORS.errorText : COLORS.inputBorder,
  };
}

export function textareaStyle(hasError = false): CSSProperties {
  return {
    ...inputStyle(hasError),
    resize: 'vertical',
    minHeight: '5.5rem',
    lineHeight: 1.5,
  };
}

export function selectStyle(hasError = false): CSSProperties {
  return {
    ...inputStyle(hasError),
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%239cb080' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    paddingRight: '2.5rem',
  };
}

// ─── Status boxes ────────────────────────────────────────────────────────────

export const errorBoxStyle: CSSProperties = {
  background: COLORS.errorBg,
  color: COLORS.errorText,
  fontSize: '0.75rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem',
  marginTop: '0.375rem',
};

export const successBoxStyle: CSSProperties = {
  background: COLORS.errorBg,
  color: COLORS.successText,
  fontSize: '0.75rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem',
  marginTop: '0.375rem',
};

// ─── Buttons ─────────────────────────────────────────────────────────────────

const buttonBase: CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  transition: 'opacity 0.15s',
  textAlign: 'center',
};

export function primaryButtonStyle(disabled = false): CSSProperties {
  return {
    ...buttonBase,
    background: disabled ? COLORS.buttonDisabled : COLORS.buttonBg,
    color: disabled ? COLORS.buttonDisabledText : COLORS.buttonText,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}

export function ghostButtonStyle(disabled = false): CSSProperties {
  return {
    ...buttonBase,
    background: 'transparent',
    color: disabled ? COLORS.mutedText : COLORS.primaryText,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
  };
}

// ─── Field group spacing ─────────────────────────────────────────────────────

export function fieldGroupStyle(marginBottom = '1.25rem'): CSSProperties {
  return { marginBottom };
}

export const dividerStyle: CSSProperties = {
  borderTop: `1px solid ${COLORS.mutedText}`,
  margin: '1.5rem 0',
  opacity: 0.2,
};

// ─── Radio card style ────────────────────────────────────────────────────────

export function radioCardStyle(selected: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    background: selected ? COLORS.inputBg : COLORS.cardBg,
    border: `1px solid ${selected ? COLORS.primaryText : COLORS.mutedText}`,
    cursor: 'pointer',
    transition: 'all 0.15s',
    opacity: selected ? 1 : 0.7,
  };
}
