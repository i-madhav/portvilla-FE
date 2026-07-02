// ─── Shared onboarding form styles (inline style objects) ────────────────────
// Matches the colour palette used in auth pages: #273338 bg, #2B5748 card,
// #9CB080 primary text, #618764 accents/borders, #ff7b6b error.

import type { CSSProperties } from 'react';

export const COLORS = {
  pageBg: '#273338',
  cardBg: '#2B5748',
  inputBg: '#273338',
  inputBorder: '#618764',
  primaryText: '#9CB080',
  mutedText: '#618764',
  accent: '#618764',
  errorBg: '#273338',
  errorText: '#ff7b6b',
  buttonBg: '#618764',
  buttonText: '#273338',
  buttonDisabled: '#3d5a4a',
} as const;

export const pageStyle: CSSProperties = {
  background: COLORS.pageBg,
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
};

export const cardStyle: CSSProperties = {
  background: COLORS.cardBg,
  borderRadius: '1rem',
  padding: '2rem 2rem',
  width: '100%',
  maxWidth: '32rem',
};

export const titleStyle: CSSProperties = {
  color: COLORS.primaryText,
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: '0.25rem',
};

export const subtitleStyle: CSSProperties = {
  color: COLORS.mutedText,
  fontSize: '0.875rem',
  marginBottom: '1.5rem',
};

export const labelStyle: CSSProperties = {
  display: 'block',
  color: COLORS.primaryText,
  fontSize: '0.75rem',
  fontWeight: 500,
  marginBottom: '0.25rem',
};

export function inputStyle(hasError = false): CSSProperties {
  return {
    width: '100%',
    padding: '0.625rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    background: COLORS.inputBg,
    color: COLORS.primaryText,
    border: `1px solid ${hasError ? COLORS.errorText : COLORS.inputBorder}`,
  };
}

export function textareaStyle(hasError = false): CSSProperties {
  return {
    ...inputStyle(hasError),
    resize: 'vertical',
    minHeight: '5rem',
  };
}

export function selectStyle(hasError = false): CSSProperties {
  return {
    ...inputStyle(hasError),
    appearance: 'auto',
    cursor: 'pointer',
  };
}

export const errorBoxStyle: CSSProperties = {
  background: COLORS.errorBg,
  color: COLORS.errorText,
  fontSize: '0.75rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.5rem',
  marginBottom: '0.5rem',
};

export function buttonStyle(disabled = false): CSSProperties {
  return {
    width: '100%',
    padding: '0.625rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? COLORS.buttonDisabled : COLORS.buttonBg,
    color: COLORS.buttonText,
    border: 'none',
    transition: 'opacity 0.15s',
  };
}

export const linkStyle: CSSProperties = {
  color: COLORS.mutedText,
  fontSize: '0.75rem',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'underline',
};

export const dividerStyle: CSSProperties = {
  borderTop: `1px solid ${COLORS.mutedText}`,
  margin: '1.5rem 0',
  opacity: 0.3,
};
