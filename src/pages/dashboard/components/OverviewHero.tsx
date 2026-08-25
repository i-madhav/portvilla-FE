import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProfileDataResponseDto } from '@typings/profileApi';
import { publicProfileLabel, publicProfileUrl } from '@app/lib/api';

interface OverviewHeroProps {
  profile: ProfileDataResponseDto;
  onEditKnowledge: () => void;
  onConfigure: () => void;
}

export function OverviewHero({ profile, onEditKnowledge, onConfigure }: OverviewHeroProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const url = publicProfileUrl(profile.username);
  const label = publicProfileLabel(profile.username);
  const isPrivate = profile.visibility === 'private';

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(async () => {
    if (isPrivate) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy your agent link:', url);
    }
  }, [isPrivate, url]);

  const initial = (profile.identity.name || profile.username).charAt(0).toUpperCase();
  const updated = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(profile.updatedAt),
  );

  return (
    <section className="pv-overview-hero">
      <div className="pv-overview-hero-orb" aria-hidden="true" />
      <div className="pv-overview-hero-content">
        <div className="pv-overview-hero-status">
          <span className={isPrivate ? 'pv-status-dot' : 'pv-status-dot pv-status-dot-live'} />
          {isPrivate ? 'Private workspace' : 'Live visitor experience'}
        </div>
        <h2>
          {profile.agentPersona.agentName} is ready to represent{' '}
          {profile.identity.name || profile.username}.
        </h2>
        <p>
          Keep the knowledge current, watch how visitors engage, and share one link when you are ready.
        </p>

        <div className="pv-overview-hero-actions">
          {isPrivate ? (
            <button type="button" className="pv-hero-button pv-focusable" onClick={onConfigure}>
              Make agent shareable
            </button>
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer" className="pv-hero-button pv-focusable">
              Open visitor view <span aria-hidden="true">↗</span>
            </a>
          )}
          <button
            type="button"
            className="pv-hero-button pv-hero-button-secondary pv-focusable"
            onClick={() => void copy()}
            disabled={isPrivate}
            title={isPrivate ? 'Make the agent shareable first' : undefined}
          >
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <button type="button" className="pv-hero-text-button pv-focusable" onClick={onEditKnowledge}>
            Edit knowledge
          </button>
        </div>
      </div>

      <div className="pv-overview-profile-chip">
        <span className="pv-overview-profile-avatar" aria-hidden="true">
          {profile.identity.primaryImage ? <img src={profile.identity.primaryImage} alt="" /> : initial}
        </span>
        <span>
          <strong>{label}</strong>
          <small>Updated {updated}</small>
        </span>
      </div>
    </section>
  );
}
