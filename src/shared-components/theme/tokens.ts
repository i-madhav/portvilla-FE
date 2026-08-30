// Runtime equivalents of the Tailwind tokens. Inline-style-heavy legacy
// surfaces consume these names while they are incrementally moved to the UI
// components in @shared-components/ui.

export const COLORS = {
  canvas: '#F6F5F1',
  surface: 'rgba(255,255,255,.84)',
  surfaceRaised: '#FFFFFF',
  fieldFill: 'rgba(255,255,255,.76)',

  textPrimary: '#14131A',
  textSecondary: 'rgba(20,19,26,.60)',
  textMuted: 'rgba(20,19,26,.45)',

  borderSubtle: 'rgba(20,19,26,.08)',
  border: 'rgba(20,19,26,.12)',
  borderFocus: '#6D28D9',

  accent: '#6D28D9',
  accentHover: '#5B21B6',
  accentSubtle: 'rgba(109,40,217,.10)',
  onAccent: '#FFFFFF',

  // Product status is expressed with the core palette: violet is positive or
  // active; ink is blocking. No unrelated traffic-light palette is introduced.
  success: '#6D28D9',
  successSubtle: 'rgba(109,40,217,.10)',
  danger: '#14131A',
  dangerSubtle: 'rgba(20,19,26,.08)',
  warning: '#5B21B6',
  warningSubtle: 'rgba(109,40,217,.10)',
} as const;

export const SPACE = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '3rem',
  gutter: '2.125rem',
  section: '6.875rem',
} as const;

export const RADIUS = {
  sm: '0.375rem',
  md: '1.125rem',
  lg: '1.25rem',
  xl: '1.75rem',
  tile: '1.125rem',
  card: '1.25rem',
  stage: '1.75rem',
  pill: '999px',
} as const;

export const SHADOW = {
  sm: '0 10px 28px rgba(20,19,26,.045)',
  md: '0 14px 40px rgba(20,19,26,.05)',
  lg: '0 26px 70px rgba(20,19,26,.08)',
  cta: '0 16px 40px rgba(20,19,26,.20)',
} as const;

export const FONT = {
  sans: "'Bricolage Grotesque', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
} as const;

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

export const MOTION = {
  fast: prefersReducedMotion() ? '0ms' : '200ms',
  base: prefersReducedMotion() ? '0ms' : '250ms',
  slow: prefersReducedMotion() ? '0ms' : '600ms',
  ease: 'ease',
} as const;
