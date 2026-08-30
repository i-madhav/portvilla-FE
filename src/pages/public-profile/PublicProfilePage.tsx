import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Brand, Button, ButtonAnchor, Surface } from '@shared-components/ui';
import {
  COLORS,
  RADIUS,
  SHADOW,
  FONT,
  pillStyle,
  inputStyle,
  noticeStyle,
} from '@shared-components/theme';
import type { PublicProfileDto } from '@typings/profileApi';
import { usePublicProfile } from './usePublicProfile';

const page: React.CSSProperties = {
  background: COLORS.canvas,
  minHeight: '100vh',
  padding: '2rem 1rem 5rem',
};
const shell: React.CSSProperties = { maxWidth: '46rem', margin: '0 auto' };

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { state, unlock } = usePublicProfile(username);

  if (state.status === 'loading') {
    return (
      <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          aria-label="Loading"
          style={{
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: '50%',
            border: `2px solid ${COLORS.borderSubtle}`,
            borderTopColor: COLORS.accent,
            animation: 'spin 0.7s linear infinite',
          }}
        />
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <Centered
        title="Nothing here"
        body="This profile doesn't exist, or its owner keeps it private."
      />
    );
  }

  if (state.status === 'error') {
    return (
      <Centered title="Something went wrong" body="We couldn't load this profile. Try again shortly." />
    );
  }

  if (state.status === 'protected') {
    return <PasswordGate username={username ?? ''} state={state} onUnlock={unlock} />;
  }

  return <ProfileView profile={state.profile} />;
}

function Centered({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '22rem' }}>
        <h1 style={{ color: COLORS.textPrimary, fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
          {title}
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: '0.9rem', margin: '0.6rem 0 0', lineHeight: 1.55 }}>
          {body}
        </p>
      </div>
    </div>
  );
}

function PasswordGate({
  username,
  state,
  onUnlock,
}: {
  username: string;
  state: { status: 'protected'; unlocking: boolean; error: string | null };
  onUnlock: (password: string) => void;
}) {
  const [password, setPassword] = useState('');
  return (
    <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password) onUnlock(password);
        }}
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.borderSubtle}`,
          borderRadius: RADIUS.xl,
          boxShadow: SHADOW.lg,
          padding: '2rem',
          width: '100%',
          maxWidth: '22rem',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: RADIUS.md,
            background: COLORS.accentSubtle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 style={{ color: COLORS.textPrimary, fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
          This profile is private
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: '0.85rem', margin: '0.4rem 0 1.25rem', lineHeight: 1.5 }}>
          Enter the password{' '}
          <span style={{ fontFamily: FONT.mono, color: COLORS.textSecondary }}>{username}</span> shared
          with you.
        </p>

        <input
          className="pv-field"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle(state.error ? 'error' : 'default')}
          placeholder="Password"
        />
        {state.error && <p style={{ ...noticeStyle('error'), marginTop: '0.6rem' }}>{state.error}</p>}

        <Button type="submit" fullWidth disabled={!password || state.unlocking} className="mt-4">
          {state.unlocking ? 'Checking…' : 'View profile'}
        </Button>
      </form>
    </div>
  );
}

function ProfileView({ profile }: { profile: PublicProfileDto }) {
  const id = profile.identity;
  const initial = (id.name || profile.username || '?').charAt(0).toUpperCase();

  return (
    <div style={page}>
      <div style={shell}>
        <div style={{ marginBottom: '1.5rem' }}><Brand /></div>
        {id.coverImage && (
          <div
            style={{
              height: '10rem',
              borderRadius: RADIUS.xl,
              backgroundImage: `url(${id.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginBottom: '-3rem',
            }}
          />
        )}

        <header
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.borderSubtle}`,
            borderRadius: RADIUS.xl,
            boxShadow: SHADOW.md,
            padding: '1.5rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '4rem',
                height: '4rem',
                flexShrink: 0,
                borderRadius: RADIUS.lg,
                background: COLORS.accentSubtle,
                border: `1px solid ${COLORS.borderSubtle}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: COLORS.accent,
                fontSize: '1.6rem',
                fontWeight: 700,
              }}
            >
              {id.primaryImage ? (
                <img src={id.primaryImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initial
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={{ color: COLORS.textPrimary, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
                {id.name}
              </h1>
              {id.tagline && (
                <p style={{ color: COLORS.textSecondary, fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
                  {id.tagline}
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                {id.location && <span style={pillStyle('neutral')}>{id.location}</span>}
                {id.industry && <span style={pillStyle('neutral')}>{id.industry}</span>}
                {id.availability && <span style={pillStyle('success')}>{id.availability}</span>}
              </div>
            </div>
          </div>

          {id.bio && (
            <p style={{ color: COLORS.textSecondary, fontSize: '0.9rem', lineHeight: 1.6, margin: '1.25rem 0 0' }}>
              {id.bio}
            </p>
          )}
        </header>

        {id.about && (
          <Card title="About">
            <p style={{ color: COLORS.textSecondary, fontSize: '0.9rem', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>
              {id.about}
            </p>
          </Card>
        )}

        {profile.capabilities.length > 0 && (
          <Card title="Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {profile.capabilities.map((c, i) => (
                <span key={`${c.name}-${i}`} style={pillStyle('accent')}>
                  {c.name}
                </span>
              ))}
            </div>
          </Card>
        )}

        {profile.timeline.length > 0 && (
          <Card title="Journey">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {profile.timeline.map((t, i) => (
                <div key={`${t.label}-${i}`} style={{ display: 'flex', gap: '0.85rem' }}>
                  <span style={{ fontFamily: FONT.mono, fontSize: '0.72rem', color: COLORS.textMuted, width: '4.5rem', flexShrink: 0, paddingTop: '0.1rem' }}>
                    {t.date}
                    {t.endDate ? `–${t.endDate}` : t.date ? '–now' : ''}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: COLORS.textPrimary, fontSize: '0.88rem', fontWeight: 600 }}>
                      {t.label}
                      {t.organization && <span style={{ color: COLORS.textMuted, fontWeight: 400 }}> · {t.organization}</span>}
                    </div>
                    {t.description && (
                      <p style={{ color: COLORS.textMuted, fontSize: '0.82rem', margin: '0.2rem 0 0', lineHeight: 1.5 }}>
                        {t.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {profile.works.length > 0 && (
          <Card title="Work">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {profile.works.map((w, i) => (
                <div key={`${w.name}-${i}`}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: COLORS.textPrimary, fontSize: '0.92rem', fontWeight: 700 }}>{w.name}</span>
                    {w.url && (
                      <a href={w.url} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.accent, fontSize: '0.78rem', textDecoration: 'none' }}>
                        Visit ↗
                      </a>
                    )}
                  </div>
                  {w.tagline && <p style={{ color: COLORS.textMuted, fontSize: '0.82rem', margin: '0.15rem 0 0' }}>{w.tagline}</p>}
                  {w.description && (
                    <p style={{ color: COLORS.textSecondary, fontSize: '0.85rem', margin: '0.4rem 0 0', lineHeight: 1.55 }}>
                      {w.description}
                    </p>
                  )}
                  {w.technologies.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                      {w.technologies.map((t, j) => (
                        <span key={`${t}-${j}`} style={pillStyle('neutral')}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {(profile.social.links.length > 0 || profile.social.calendarUrl) && (
          <Card title="Get in touch">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profile.social.calendarUrl && (
                <ButtonAnchor href={profile.social.calendarUrl} target="_blank" rel="noopener noreferrer">
                  Book a call
                </ButtonAnchor>
              )}
              {profile.social.links.map((l, i) => (
                <ButtonAnchor key={`${l.platform}-${i}`} href={l.url} target="_blank" rel="noopener noreferrer" variant="secondary">
                  {l.label || l.platform}
                </ButtonAnchor>
              ))}
            </div>
          </Card>
        )}

        <p style={{ textAlign: 'center', color: COLORS.textMuted, fontSize: '0.75rem', marginTop: '2rem' }}>
          Ask {profile.agentName} anything · powered by Portvilla
        </p>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Surface className="pv-card mt-4 p-card">
      <h2
        style={{
          color: COLORS.textMuted,
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          margin: '0 0 0.9rem',
        }}
      >
        {title}
      </h2>
      {children}
    </Surface>
  );
}
