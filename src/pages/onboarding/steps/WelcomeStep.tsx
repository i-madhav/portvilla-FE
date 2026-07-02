import { titleStyle, subtitleStyle, primaryButtonStyle, COLORS } from '../styles';

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div>
      {/* Brand mark */}
      <div
        style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '0.75rem',
          background: COLORS.inputBg,
          border: `1px solid ${COLORS.mutedText}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: COLORS.primaryText,
        }}
      >
        P
      </div>

      <h1 style={titleStyle}>Welcome to Portvilla</h1>
      <p style={subtitleStyle}>
        Let's get your profile set up. It only takes a few minutes
        and you can always add more later.
      </p>

      {/* Benefit cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem' }}>
        <BenefitCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.primaryText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          }
          text="A shareable portfolio page at portvilla.in/your-name"
        />
        <BenefitCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.primaryText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
          text="Your work, skills, testimonials — all in one place"
        />
        <BenefitCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.primaryText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          }
          text="An AI agent that knows your work and talks to visitors"
        />
      </div>

      <button
        type="button"
        style={{
          ...primaryButtonStyle(false),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
        onClick={onContinue}
      >
        Get started
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function BenefitCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        background: COLORS.inputBg,
        border: `1px solid ${COLORS.mutedText}`,
        opacity: 0.85,
      }}
    >
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <span style={{ color: COLORS.primaryText, fontSize: '0.8rem', lineHeight: 1.4 }}>
        {text}
      </span>
    </div>
  );
}
