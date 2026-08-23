import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, ButtonAnchor } from '@shared-components/ui';
import type { ProfileDataResponseDto, ProfileVisibility, UpdateProfilePayload } from '@typings/profileApi';
import { publicProfileLabel, publicProfileUrl } from '@app/lib/publicProfile';
import { COLORS, RADIUS, SHADOW, FONT, MOTION, inputStyle, selectStyle, noticeStyle } from '../styles';
// The theme's tone-taking pillStyle, not the flat object `../styles` re-exports
// under the same name for the legacy sections.
import { pillStyle } from '@shared-components/theme';

interface ProfileHeroProps {
  profile: ProfileDataResponseDto;
  onLogout: () => void;
  save: (payload: UpdateProfilePayload) => Promise<void>;
}

/**
 * The dashboard's centre of gravity: the thing the user came here to make.
 *
 * Previously the address was plain text at the top of a header whose only
 * action was "Log out" — the most prominent control on the page was the one
 * that leaves it.
 */
export function ProfileHero({ profile, onLogout, save }: ProfileHeroProps) {
  const id = profile.identity;
  const persona = profile.agentPersona;
  const label = publicProfileLabel(profile.username);
  const url = publicProfileUrl(profile.username);
  const initial = (id.name || profile.username || '?').charAt(0).toUpperCase();

  const [copied, setCopied] = useState(false);
  const [editingAccess, setEditingAccess] = useState(false);
  const [visibility, setVisibility] = useState<ProfileVisibility>(profile.visibility);
  const [password, setPassword] = useState('');
  const [savingAccess, setSavingAccess] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked without a secure context or permission. Selecting
      // the address is the fallback; silently doing nothing would look broken.
      window.prompt('Copy your profile link:', url);
    }
  }, [url]);

  const share = useCallback(async () => {
    if (profile.visibility === 'private') return;
    if (!navigator.share) {
      void copy();
      return;
    }
    try {
      await navigator.share({ title: id.name || profile.username, url });
    } catch {
      // The user dismissed the sheet — not an error worth reporting.
    }
  }, [id.name, profile.username, profile.visibility, url, copy]);

  const saveAccess = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingAccess || (visibility === 'protected' && password.length < 6)) return;
    setSavingAccess(true);
    try {
      await save({
        visibility: {
          visibility,
          ...(visibility === 'protected' ? { protectedPassword: password } : {}),
        },
      });
      setPassword('');
      setEditingAccess(false);
    } catch {
      /* mutation hook owns the error toast */
    } finally {
      setSavingAccess(false);
    }
  }, [password, save, savingAccess, visibility]);

  const visibilityTone =
    profile.visibility === 'public' ? 'success' : profile.visibility === 'private' ? 'warning' : 'neutral';
  const visibilityLabel =
    profile.visibility === 'public'
      ? 'Public'
      : profile.visibility === 'private'
        ? 'Private — only you'
        : 'Password-protected';

  return (
    <section
      className="pv-card"
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.borderSubtle}`,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.md,
        padding: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '3.5rem',
            height: '3.5rem',
            flexShrink: 0,
            borderRadius: RADIUS.lg,
            background: COLORS.accentSubtle,
            border: `1px solid ${COLORS.borderSubtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            color: COLORS.accent,
            fontSize: '1.5rem',
            fontWeight: 700,
          }}
        >
          {id.primaryImage ? (
            <img
              src={id.primaryImage}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            initial
          )}
        </div>

        <div style={{ flex: '1 1 14rem', minWidth: 0 }}>
          <p style={{ color: COLORS.accent, fontFamily: FONT.mono, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>
            Voice representative
          </p>
          <h1
            style={{
              color: COLORS.textPrimary,
              fontSize: '1.3rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {persona.agentName} represents {id.name || profile.username}
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: '0.88rem', lineHeight: 1.55, margin: '0.3rem 0 0', maxWidth: '38rem' }}>
            Visitors use one link to ask about your experience, expertise and work. The answers are grounded in the context you manage below.
          </p>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
            <span style={pillStyle(visibilityTone)}>{visibilityLabel}</span>
            <span style={pillStyle('neutral')}>{persona.tone} tone</span>
            <span style={pillStyle('neutral')}>{persona.speakingSpeed} pace</span>
            <Button type="button" variant="ghost" size="compact" onClick={() => setEditingAccess((value) => !value)} aria-expanded={editingAccess}>
              Change access
            </Button>
          </div>
        </div>

        {/* Demoted to a quiet corner control. It is not the job to be done. */}
        <Button type="button" variant="ghost" size="compact" onClick={onLogout}>Log out</Button>
      </div>

      {editingAccess ? (
        <form onSubmit={(event) => void saveAccess(event)} style={{ marginTop: '1rem', padding: '1rem', background: COLORS.canvas, border: `1px solid ${COLORS.borderSubtle}`, borderRadius: RADIUS.md }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 15rem' }}>
              <label htmlFor="pv-agent-access" style={{ display: 'block', color: COLORS.textMuted, fontFamily: FONT.mono, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Visitor access
              </label>
              <select id="pv-agent-access" className="pv-field" value={visibility} onChange={(event) => setVisibility(event.target.value as ProfileVisibility)} style={selectStyle()}>
                <option value="public">Public — anyone with the link</option>
                <option value="protected">Password-protected</option>
                <option value="private">Private — only you</option>
              </select>
            </div>
            {visibility === 'protected' ? (
              <div style={{ flex: '1 1 15rem' }}>
                <label htmlFor="pv-agent-password" style={{ display: 'block', color: COLORS.textMuted, fontFamily: FONT.mono, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  New visitor password
                </label>
                <input id="pv-agent-password" className="pv-field" type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyle(password && password.length < 6 ? 'error' : 'default')} autoComplete="new-password" placeholder="At least 6 characters" />
              </div>
            ) : null}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button type="button" variant="secondary" size="compact" disabled={savingAccess} onClick={() => { setVisibility(profile.visibility); setPassword(''); setEditingAccess(false); }}>Cancel</Button>
              <Button type="submit" size="compact" disabled={savingAccess || (visibility === 'protected' && password.length < 6)}>{savingAccess ? 'Saving…' : 'Save access'}</Button>
            </div>
          </div>
          {visibility === 'private' ? <p style={{ ...noticeStyle('info'), marginTop: '0.75rem' }}>Private links cannot be opened or tested in the visitor view.</p> : null}
        </form>
      ) : null}

      {/* The public conversation address, as an actual address. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '1.25rem',
          padding: '0.6rem 0.75rem',
          background: COLORS.canvas,
          border: `1px solid ${COLORS.borderSubtle}`,
          borderRadius: RADIUS.md,
        }}
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="pv-focusable"
          style={{
            flex: '1 1 12rem',
            minWidth: 0,
            fontFamily: FONT.mono,
            fontSize: '0.85rem',
            color: COLORS.accent,
            textDecoration: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: `color ${MOTION.fast}`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          {label}
        </a>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button type="button" variant="secondary" size="compact" onClick={() => void copy()} disabled={profile.visibility === 'private'} aria-label="Copy your agent link" title={profile.visibility === 'private' ? 'Make the agent public or password-protected before sharing' : undefined}>
            {copied ? 'Agent link copied' : 'Copy agent link'}
          </Button>

          <Button type="button" variant="secondary" size="compact" onClick={() => void share()} disabled={profile.visibility === 'private'} title={profile.visibility === 'private' ? 'Make the agent public or password-protected before sharing' : undefined}>Share</Button>

          {profile.visibility === 'private' ? (
            <Button type="button" size="compact" onClick={() => setEditingAccess(true)}>Make shareable</Button>
          ) : (
            <ButtonAnchor href={url} target="_blank" rel="noopener noreferrer" size="compact">
              Open visitor view ↗
            </ButtonAnchor>
          )}
        </div>
      </div>

      {profile.visibility === 'private' && (
        <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', margin: '0.6rem 0 0' }}>
          Visitors cannot open this link right now. Choose “Make shareable” when the agent is ready.
        </p>
      )}
    </section>
  );
}
