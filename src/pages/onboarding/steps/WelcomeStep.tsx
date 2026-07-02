import { titleStyle, subtitleStyle, buttonStyle } from '../styles';

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div>
      <h1 style={titleStyle}>Welcome to Portvilla</h1>
      <p style={subtitleStyle}>
        Let's set up your profile. This takes just a few minutes.
      </p>

      <div
        style={{
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          background: '#273338',
          color: '#9CB080',
          fontSize: '0.8rem',
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>You'll need:</p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>A username (your public URL: portvilla.in/username)</li>
          <li>Your name and how you'd like to be described</li>
          <li>A profile photo (optional — can add later)</li>
        </ul>
      </div>

      <button
        type="button"
        style={buttonStyle(false)}
        onClick={onContinue}
      >
        Get started
      </button>
    </div>
  );
}
