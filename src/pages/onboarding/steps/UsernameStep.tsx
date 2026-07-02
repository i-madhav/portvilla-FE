import { useState, useCallback } from 'react';
import type { ProfileVisibility } from '@typings/profileApi';
import {
  validateUsername,
  sanitiseUsernameInput,
} from '@typings/profileApi';
import {
  titleStyle,
  subtitleStyle,
  labelStyle,
  inputStyle,
  fieldGroupStyle,
  errorBoxStyle,
  successBoxStyle,
  primaryButtonStyle,
  ghostButtonStyle,
  radioCardStyle,
  COLORS,
} from '../styles';

interface UsernameStepProps {
  initialUsername: string;
  initialVisibility: ProfileVisibility;
  initialPassword: string;
  onContinue: (
    username: string,
    visibility: ProfileVisibility,
    protectedPassword: string,
  ) => void;
  onBack: () => void;
}

const VISIBILITY_OPTIONS: {
  value: ProfileVisibility;
  label: string;
  description: string;
}[] = [
  { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
  { value: 'private', label: 'Private', description: 'Only you can see it' },
  { value: 'protected', label: 'Protected', description: 'Password-gated access' },
];

export function UsernameStep({
  initialUsername,
  initialVisibility,
  initialPassword,
  onContinue,
  onBack,
}: UsernameStepProps) {
  const [username, setUsername] = useState(initialUsername);
  const [visibility, setVisibility] = useState<ProfileVisibility>(initialVisibility);
  const [protectedPassword, setProtectedPassword] = useState(initialPassword);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [usernameTouched, setUsernameTouched] = useState(false);

  const handleUsernameChange = useCallback(
    (raw: string) => {
      const sanitised = sanitiseUsernameInput(raw);
      setUsername(sanitised);
      if (sanitised.length >= 3) {
        const result = validateUsername(sanitised);
        setValidationError(result.valid ? null : result.reason ?? null);
      } else if (sanitised.length > 0) {
        setValidationError('Username must be at least 3 characters.');
      } else {
        setValidationError(null);
      }
    },
    [],
  );

  const isProtected = visibility === 'protected';
  const isPasswordValid = !isProtected || protectedPassword.length >= 6;
  const usernameResult = username.length >= 3 ? validateUsername(username) : { valid: false };
  const canContinue = username.length >= 3 && usernameResult.valid && isPasswordValid;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    onContinue(username, visibility, protectedPassword);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 style={titleStyle}>Claim your corner</h1>
      <p style={subtitleStyle}>
        Your profile lives at a unique link. Make it yours.
      </p>

      {/* Username input with live URL preview */}
      <div style={fieldGroupStyle('1.5rem')}>
        <label style={labelStyle}>Username</label>

        {/* URL preview box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem 0.5rem 1rem',
            borderRadius: '0.5rem',
            background: COLORS.inputBg,
            border: `1px solid ${COLORS.inputBorder}`,
            marginBottom: '0.5rem',
          }}
        >
          <span
            style={{
              color: COLORS.mutedText,
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            portvilla.in/
          </span>
          <input
            type="text"
            required
            maxLength={30}
            value={username}
            onChange={(e) => {
              setUsernameTouched(true);
              handleUsernameChange(e.target.value);
            }}
            onBlur={() => setUsernameTouched(true)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: username ? COLORS.primaryText : COLORS.mutedText,
              fontSize: '0.875rem',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace, inherit",
              padding: 0,
            }}
            placeholder="your-name"
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </div>

        {/* Validation feedback */}
        {validationError && usernameTouched && (
          <p style={errorBoxStyle}>{validationError}</p>
        )}
        {usernameTouched && !validationError && username.length >= 3 && (
          <p style={successBoxStyle}>✓ Username is available</p>
        )}
      </div>

      {/* Visibility — card-style options */}
      <div style={fieldGroupStyle('1.5rem')}>
        <label style={{ ...labelStyle, marginBottom: '0.625rem' }}>Visibility</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {VISIBILITY_OPTIONS.map((opt) => (
            <label key={opt.value} style={radioCardStyle(visibility === opt.value)}>
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
                style={{ accentColor: COLORS.primaryText }}
              />
              <div>
                <div style={{ color: COLORS.primaryText, fontSize: '0.8rem', fontWeight: 600 }}>
                  {opt.label}
                </div>
                <div style={{ color: COLORS.mutedText, fontSize: '0.7rem' }}>
                  {opt.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Protected password — shown only when needed */}
      {isProtected && (
        <div style={fieldGroupStyle('1.5rem')}>
          <label style={labelStyle}>Access password</label>
          <input
            type="text"
            required
            minLength={6}
            value={protectedPassword}
            onChange={(e) => setProtectedPassword(e.target.value)}
            style={inputStyle(protectedPassword.length > 0 && protectedPassword.length < 6)}
            placeholder="Min 6 characters"
            autoComplete="off"
          />
          {protectedPassword.length > 0 && protectedPassword.length < 6 && (
            <p style={errorBoxStyle}>Password must be at least 6 characters.</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
        <button type="submit" disabled={!canContinue} style={primaryButtonStyle(!canContinue)}>
          Continue
        </button>
        <button type="button" onClick={onBack} style={ghostButtonStyle()}>
          ← Back
        </button>
      </div>
    </form>
  );
}
