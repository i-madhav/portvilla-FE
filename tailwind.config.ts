/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#F6F5F1', raised: '#FFFFFF' },
        ink: {
          DEFAULT: '#14131A',
          90: 'rgba(20,19,26,.90)',
          70: 'rgba(20,19,26,.70)',
          60: 'rgba(20,19,26,.60)',
          45: 'rgba(20,19,26,.45)',
          12: 'rgba(20,19,26,.12)',
          8: 'rgba(20,19,26,.08)',
        },
        violet: { DEFAULT: '#6D28D9', deep: '#5B21B6', soft: '#A78BFA' },
        citron: { DEFAULT: '#D8F35A', pale: '#EDFBB4' },
        teal: { DEFAULT: '#0891B2' },
        moss: { DEFAULT: '#4D7C0F' },
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        label: ['11.5px', { lineHeight: '1.2', letterSpacing: '0.12em' }],
        micro: ['13px', { lineHeight: '1.5' }],
        body: ['15px', { lineHeight: '1.6' }],
        lead: ['18.5px', { lineHeight: '1.55' }],
        h3: ['20px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        h2: ['clamp(34px, 4.4vw, 58px)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        h1: ['clamp(46px, 7.4vw, 104px)', { lineHeight: '0.93', letterSpacing: '-0.045em' }],
      },
      borderRadius: {
        card: '20px',
        stage: '28px',
        tile: '18px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 10px 28px rgba(20,19,26,.045)',
        lift: '0 14px 40px rgba(20,19,26,.05)',
        stage: '0 26px 70px rgba(20,19,26,.08)',
        cta: '0 16px 40px rgba(20,19,26,.20)',
      },
      backdropBlur: { glass: '20px', bar: '22px' },
      opacity: { 45: '.45', 72: '.72', 75: '.75', 85: '.85' },
      backgroundImage: {
        'aurora-violet': 'radial-gradient(circle, rgba(109,40,217,.16), transparent 62%)',
        'aurora-citron': 'radial-gradient(circle at 40% 60%, rgba(216,243,90,.40), transparent 62%)',
      },
      spacing: {
        gutter: '34px',
        section: '110px',
        card: '22px',
        'button-x': '26px',
        'button-y': '14px',
        'grid-sm': '14px',
        'grid-lg': '20px',
      },
      maxWidth: {
        content: '1180px',
        copy: '700px',
        intro: '720px',
        auth: '448px',
      },
    },
  },
  plugins: [],
};
