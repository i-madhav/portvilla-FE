import { useState, useEffect } from 'react';
import type { ProfileVisibility } from '@typings/profileApi';
import { sanitiseUsernameInput } from '@typings/profileApi';
import { useUsernameAvailability } from '@api-hooks/profile/useProfileHooks';
import { StepActions } from '../components/StepActions';
import { StepHeader } from '../components/StepHeader';
import {
  COLORS,
  FONT,
  inputStyle,
  noticeStyle,
  labelStyle,
  fieldGroupStyle,
  optionCardStyle,
} from '../styles';

interface AccountStepProps {
  username: string;
  visibility: ProfileVisibility;
  protectedPassword: string;
  /** Set when create failed on a username collision after this step passed. */
  externalError: string | null;
  onClearExternalError: () => void;
  onContinue: (v: {
    username: string;
    visibility: ProfileVisibility;
    protectedPassword: string;
  }) => void;
  busy: boolean;
}

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Anyone with the link can view it' },
  { value: 'protected', label: 'Password-protected', description: 'Visitors need a password' },
  { value: 'private', label: 'Private', description: 'Only you — publish when ready' },
];

export function AccountStep({
  username: initialUsername,
  visibility: initialVisibility,
  protectedPassword: initialPassword,
  externalError,
  onClearExternalError,
  onContinue,
  busy,
}: AccountStepProps) {
  const [username, setUsername] = useState(initialUsername);
  const [visibility, setVisibility] = useState<ProfileVisibility>(initialVisibility);
  const [password, setPassword] = useState(initialPassword);
  const [touched, setTouched] = useState(false);

  const status = useUsernameAvailability(username);

  useEffect(() => {
    if (externalError) setTouched(true);
  }, [externalError]);

  const isProtected = visibility === 'protected';
  const passwordValid = !isProtected || password.length >= 6;

  // "unknown" means the check itself failed. Blocking would strand the user on a
  // backend hiccup; the server re-checks at create and we recover from the 409.
  const usernameOk = status.state === 'available' || status.state === 'unknown';
  const canContinue = usernameOk && passwordValid && !busy;

  const fieldState =
    !touched || status.state === 'idle' || status.state === 'checking'
      ? 'default'
      : status.state === 'available'
        ? 'success'
        : status.state === 'unknown'
          ? 'default'
          : 'error';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canContinue) return;
        onContinue({ username, visibility, protectedPassword: password });
      }}
    >
      <StepHeader
        title="Claim your link"
        subtitle="This is where your portfolio lives. You can change it later, but the link will change with it."
      />

      <div style={fieldGroupStyle('1.5rem')}>
        <label style={labelStyle} htmlFor="pv-username">
          Your portfolio address
        </label>

        <div
          style={{
            ...inputStyle(fieldState),
            display: 'flex',
            alignItems: 'center',
            gap: '0.15rem',
            padding: '0 0.85rem',
          }}
        >
          <span
            style={{
              color: COLORS.textMuted,
              fontSize: '0.95rem',
              fontFamily: FONT.mono,
              whiteSpace: 'nowrap',
            }}
          >
            portvilla.in/
          </span>
          <input
            id="pv-username"
            className="pv-field"
            type="text"
            required
            maxLength={30}
            value={username}
            onChange={(e) => {
              setTouched(true);
              if (externalError) onClearExternalError();
              setUsername(sanitiseUsernameInput(e.target.value));
            }}
            onBlur={() => setTouched(true)}
            placeholder="your-name"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            aria-describedby="pv-username-status"
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              color: COLORS.textPrimary,
              fontSize: '0.95rem',
              fontFamily: FONT.mono,
              padding: '0.7rem 0',
            }}
          />
          <StatusDot status={status.state} touched={touched} />
        </div>

        <div id="pv-username-status" aria-live="polite" style={{ marginTop: '0.5rem' }}>
          {externalError ? (
            <p style={noticeStyle('error')}>{externalError}</p>
          ) : touched && status.state === 'invalid' ? (
            <p style={noticeStyle('error')}>{status.message}</p>
          ) : touched && status.state === 'unavailable' ? (
            <p style={noticeStyle('error')}>{status.message}</p>
          ) : status.state === 'available' ? (
            <p style={noticeStyle('success')}>portvilla.in/{username} is yours</p>
          ) : status.state === 'unknown' ? (
            <p style={noticeStyle('info')}>
              Couldn't check availability right now — you can continue, and we'll confirm when we
              save.
            </p>
          ) : (
            <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', margin: 0 }}>
              Lowercase letters, numbers and hyphens. 3–30 characters.
            </p>
          )}
        </div>
      </div>

      <div style={fieldGroupStyle('1.25rem')}>
        <span style={labelStyle}>Who can see it?</span>
        <div
          role="radiogroup"
          aria-label="Profile visibility"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          {VISIBILITY_OPTIONS.map((opt) => (
            <label key={opt.value} style={optionCardStyle(visibility === opt.value)}>
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
                style={{ accentColor: COLORS.accent, marginTop: '0.15rem' }}
              />
              <span>
                <span
                  style={{
                    display: 'block',
                    color: COLORS.textPrimary,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {opt.label}
                </span>
                <span style={{ display: 'block', color: COLORS.textMuted, fontSize: '0.75rem' }}>
                  {opt.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {isProtected && (
        <div style={fieldGroupStyle('1.25rem')}>
          <label style={labelStyle} htmlFor="pv-access-password">
            Access password
          </label>
          <input
            id="pv-access-password"
            className="pv-field"
            type="text"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle(password.length > 0 && password.length < 6 ? 'error' : 'default')}
            placeholder="At least 6 characters"
            autoComplete="off"
          />
          <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', margin: '0.4rem 0 0' }}>
            Share this with anyone you want to let in.
          </p>
        </div>
      )}

      <StepActions
        continueLabel="Continue"
        disabled={!canContinue}
        busy={busy}
        disabledHint={
          !usernameOk
            ? 'Pick an available address to continue.'
            : !passwordValid
              ? 'Your access password needs at least 6 characters.'
              : undefined
        }
      />
    </form>
  );
}

function StatusDot({ status, touched }: { status: string; touched: boolean }) {
  if (!touched || status === 'idle') return null;

  if (status === 'checking') {
    return (
      <span
        aria-hidden="true"
        style={{
          width: '0.85rem',
          height: '0.85rem',
          flexShrink: 0,
          borderRadius: '50%',
          border: `2px solid ${COLORS.borderSubtle}`,
          borderTopColor: COLORS.accent,
          animation: 'spin 0.7s linear infinite',
        }}
      />
    );
  }

  if (status === 'available') {
    return (
      <span aria-hidden="true" style={{ color: COLORS.success, flexShrink: 0, fontFamily: FONT.mono, fontSize: '0.65rem' }}>yes</span>
    );
  }

  if (status === 'unavailable' || status === 'invalid') {
    return (
      <span aria-hidden="true" style={{ color: COLORS.danger, flexShrink: 0, fontFamily: FONT.mono, fontSize: '0.65rem' }}>no</span>
    );
  }

  return null;
}
