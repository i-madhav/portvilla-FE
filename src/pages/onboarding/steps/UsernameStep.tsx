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
  buttonStyle,
  errorBoxStyle,
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
  const canContinue =
    username.length >= 3 &&
    usernameResult.valid &&
    isPasswordValid;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    onContinue(username, visibility, protectedPassword);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 style={titleStyle}>Choose your username</h1>
      <p style={subtitleStyle}>
        This will be your public profile URL: portvilla.in/<strong>{username || 'username'}</strong>
      </p>

      {/* Username input */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={labelStyle}>Username</label>
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
          style={inputStyle(!!validationError && usernameTouched)}
          placeholder="jane-doe"
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        {validationError && usernameTouched && (
          <p style={errorBoxStyle}>{validationError}</p>
        )}
        {usernameTouched && !validationError && username.length >= 3 && (
          <p style={{ ...errorBoxStyle, color: '#9CB080', background: 'transparent', padding: '0.25rem 0' }}>
            ✓ Username looks good
          </p>
        )}
      </div>

      {/* Visibility */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Profile visibility</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(['public', 'private', 'protected'] as ProfileVisibility[]).map((v) => (
            <label
              key={v}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: '#9CB080',
                fontSize: '0.8rem',
              }}
            >
              <input
                type="radio"
                name="visibility"
                value={v}
                checked={visibility === v}
                onChange={() => setVisibility(v)}
              />
              <span style={{ textTransform: 'capitalize' }}>{v}</span>
              <span style={{ color: '#618764', fontSize: '0.7rem' }}>
                {v === 'public' && '— Anyone can view'}
                {v === 'private' && '— Only you'}
                {v === 'protected' && '— Password-gated'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Protected password */}
      {isProtected && (
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Access password (min 6 chars)</label>
          <input
            type="text"
            required
            minLength={6}
            value={protectedPassword}
            onChange={(e) => setProtectedPassword(e.target.value)}
            style={inputStyle(protectedPassword.length > 0 && protectedPassword.length < 6)}
            placeholder="Enter a password to gate your profile"
            autoComplete="off"
          />
          {protectedPassword.length > 0 && protectedPassword.length < 6 && (
            <p style={errorBoxStyle}>Password must be at least 6 characters.</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!canContinue}
        style={buttonStyle(!canContinue)}
      >
        Continue
      </button>

      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#618764',
          fontSize: '0.75rem',
          cursor: 'pointer',
          display: 'block',
          margin: '0.75rem auto 0',
          textDecoration: 'underline',
        }}
      >
        ← Back
      </button>
    </form>
  );
}
