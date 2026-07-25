// ─── Portvilla Design Tokens ─────────────────────────────────────────────────
// Shared by onboarding, dashboard, and any future authenticated surface.
//
// The brand hue (#9CB080 sage) is kept, but it is now an *accent* on a neutral
// dark ramp rather than green text on a green card. The previous palette put
// #618764 on #2B5748 (2.02:1) and shipped a primary button at 3.19:1 — every
// text token on the card surface failed WCAG AA. Every pairing below is
// measured; ratios are noted so they survive future edits.

export const COLORS = {
  // Surfaces — neutral, green-undertoned, ascending elevation
  canvas: '#0E1416',
  surface: '#151E21',
  surfaceRaised: '#1C282B',
  fieldFill: '#0E1416',

  // Text (on `surface`)
  textPrimary: '#EAF0EC', // 14.66:1
  textSecondary: '#B3C2B8', // 9.14:1
  textMuted: '#879A8D', // 5.68:1 — the floor for body copy

  // Borders.
  // `borderSubtle` is decorative only (dividers, card edges). Never use it to
  // delineate an interactive control: WCAG 1.4.11 wants 3:1 for those, and it
  // lands at 1.44:1.
  borderSubtle: '#2C3A3E',
  border: '#63786B', // 3.57:1 vs surface, 3.92:1 vs fieldFill
  borderFocus: '#B0C494', // 9.88:1 vs fieldFill

  // Brand accent
  accent: '#9CB080', // 7.21:1 on surface
  accentHover: '#B0C494',
  accentSubtle: 'rgba(156, 176, 128, 0.14)',
  onAccent: '#0E1416', // 7.91:1 on accent — button label

  // Semantic
  success: '#7FD1A0', // 9.30:1
  successSubtle: 'rgba(127, 209, 160, 0.14)',
  danger: '#FF8B76', // 7.43:1
  dangerSubtle: 'rgba(255, 139, 118, 0.14)',
  warning: '#E8C37E', // 10.12:1
  warningSubtle: 'rgba(232, 195, 126, 0.14)',
} as const;

export const SPACE = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
} as const;

export const RADIUS = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  pill: '999px',
} as const;

// A real elevation ramp — the old system had none, so every card read as equally
// important and the eye had nowhere to land.
export const SHADOW = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.30)',
  md: '0 4px 12px rgba(0, 0, 0, 0.35)',
  lg: '0 12px 32px rgba(0, 0, 0, 0.45)',
} as const;

export const FONT = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
} as const;

/** Respect the user's reduced-motion setting for any non-essential animation. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

export const MOTION = {
  fast: prefersReducedMotion() ? '0ms' : '120ms',
  base: prefersReducedMotion() ? '0ms' : '200ms',
  slow: prefersReducedMotion() ? '0ms' : '360ms',
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;
