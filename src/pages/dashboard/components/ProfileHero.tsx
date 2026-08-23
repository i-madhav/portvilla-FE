import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, ButtonAnchor } from '@shared-components/ui';
import type { ProfileDataResponseDto } from '@typings/profileApi';
import { publicProfileLabel, publicProfileUrl } from '@app/lib/publicProfile';
import { COLORS, RADIUS, SHADOW, FONT, MOTION } from '../styles';
// The theme's tone-taking pillStyle, not the flat object `../styles` re-exports
// under the same name for the legacy sections.
import { pillStyle } from '@shared-components/theme';

interface ProfileHeroProps {
  profile: ProfileDataResponseDto;
  onLogout: () => void;
}

/**
 * The dashboard's centre of gravity: the thing the user came here to make.
 *
 * Previously the address was plain text at the top of a header whose only
 * action was "Log out" — the most prominent control on the page was the one
 * that leaves it.
 */
export function ProfileHero({ profile, onLogout }: ProfileHeroProps) {
  const id = profile.identity;
  const label = publicProfileLabel(profile.username);
  const url = publicProfileUrl(profile.username);
  const initial = (id.name || profile.username || '?').charAt(0).toUpperCase();

  const [copied, setCopied] = useState(false);
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
    if (!navigator.share) {
      void copy();
      return;
    }
    try {
      await navigator.share({ title: id.name || profile.username, url });
    } catch {
      // The user dismissed the sheet — not an error worth reporting.
    }
  }, [id.name, profile.username, url, copy]);

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
          <h1
            style={{
              color: COLORS.textPrimary,
              fontSize: '1.3rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {id.name || 'Unnamed profile'}
          </h1>
          {id.tagline && (
            <p style={{ color: COLORS.textSecondary, fontSize: '0.85rem', margin: '0.15rem 0 0' }}>
              {id.tagline}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
            <span style={pillStyle(visibilityTone)}>{visibilityLabel}</span>
            {id.availability && <span style={pillStyle('neutral')}>{id.availability}</span>}
          </div>
        </div>

        {/* Demoted to a quiet corner control. It is not the job to be done. */}
        <Button type="button" variant="ghost" size="compact" onClick={onLogout}>Log out</Button>
      </div>

      {/* The address, as an actual address. */}
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
          <Button type="button" variant="secondary" size="compact" onClick={() => void copy()} aria-label="Copy your profile link">
            {copied ? 'Copied' : 'Copy link'}
          </Button>

          <Button type="button" variant="secondary" size="compact" onClick={() => void share()}>Share</Button>

          <ButtonAnchor
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            size="compact"
          >
            View page ↗
          </ButtonAnchor>
        </div>
      </div>

      {profile.visibility === 'private' && (
        <p style={{ color: COLORS.textMuted, fontSize: '0.75rem', margin: '0.6rem 0 0' }}>
          Only you can open this right now. Switch to public when you're ready to share it.
        </p>
      )}
    </section>
  );
}
