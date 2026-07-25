import { COLORS, RADIUS, SHADOW, FONT, MOTION, pillStyle } from '@shared-components/theme';
import type { OnboardingData } from '../useOnboardingFlow';

interface ProfilePreviewProps {
  data: OnboardingData;
}

/**
 * A live sketch of the profile being built, shown beside the form on wide
 * screens. Onboarding previously ran six steps of forms with no sight of the
 * result until submit, which is what made it feel like paperwork rather than
 * like making something.
 *
 * Deliberately an impression, not a faithful render of the public page: it must
 * stay readable at ~28rem and must not imply a layout the real page doesn't use.
 */
export function ProfilePreview({ data }: ProfilePreviewProps) {
  const { identity, username, capabilities, timeline, works } = data;
  const name = identity.name.trim();
  const initial = (name || username || '?').charAt(0).toUpperCase();

  return (
    <aside
      aria-label="Live preview of your profile"
      style={{
        position: 'sticky',
        top: '2rem',
        background: COLORS.surface,
        border: `1px solid ${COLORS.borderSubtle}`,
        borderRadius: RADIUS.xl,
        boxShadow: SHADOW.md,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.6rem 0.9rem',
          borderBottom: `1px solid ${COLORS.borderSubtle}`,
          background: COLORS.canvas,
        }}
      >
        <span style={{ display: 'flex', gap: '0.25rem' }} aria-hidden="true">
          {[COLORS.borderSubtle, COLORS.borderSubtle, COLORS.borderSubtle].map((c, i) => (
            <span
              key={i}
              style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: c }}
            />
          ))}
        </span>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: '0.72rem',
            color: COLORS.textMuted,
            marginLeft: '0.35rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          portvilla.in/{username || '…'}
        </span>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              flexShrink: 0,
              borderRadius: RADIUS.lg,
              background: COLORS.accentSubtle,
              border: `1px solid ${COLORS.borderSubtle}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.accent,
              fontSize: '1.25rem',
              fontWeight: 700,
              transition: `all ${MOTION.base}`,
            }}
          >
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: name ? COLORS.textPrimary : COLORS.textMuted,
                fontSize: '1.05rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name || 'Your name'}
            </div>
            <div
              style={{
                color: COLORS.textMuted,
                fontSize: '0.8rem',
                marginTop: '0.1rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {identity.tagline.trim() || 'Your tagline appears here'}
            </div>
          </div>
        </div>

        {(identity.location.trim() || identity.availability.trim()) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.9rem' }}>
            {identity.location.trim() && <span style={pillStyle('neutral')}>{identity.location}</span>}
            {identity.availability.trim() && (
              <span style={pillStyle('success')}>{identity.availability}</span>
            )}
          </div>
        )}

        {identity.bio.trim() && (
          <p
            style={{
              color: COLORS.textSecondary,
              fontSize: '0.82rem',
              lineHeight: 1.55,
              margin: '0.9rem 0 0',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {identity.bio}
          </p>
        )}

        {capabilities.length > 0 && (
          <PreviewBlock title="Skills">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {capabilities.slice(0, 8).map((c, i) => (
                <span key={`${c.name}-${i}`} style={pillStyle('accent')}>
                  {c.name}
                </span>
              ))}
              {capabilities.length > 8 && (
                <span style={pillStyle('neutral')}>+{capabilities.length - 8}</span>
              )}
            </div>
          </PreviewBlock>
        )}

        {timeline.length > 0 && (
          <PreviewBlock title="Journey">
            {timeline.slice(0, 3).map((t, i) => (
              <div key={`${t.label}-${i}`} style={{ display: 'flex', gap: '0.6rem', marginTop: i ? '0.5rem' : 0 }}>
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: '0.7rem',
                    color: COLORS.textMuted,
                    flexShrink: 0,
                    width: '3.5rem',
                  }}
                >
                  {t.date || '—'}
                </span>
                <span style={{ fontSize: '0.8rem', color: COLORS.textSecondary, minWidth: 0 }}>
                  {t.label}
                  {t.organization && (
                    <span style={{ color: COLORS.textMuted }}> · {t.organization}</span>
                  )}
                </span>
              </div>
            ))}
          </PreviewBlock>
        )}

        {works.length > 0 && (
          <PreviewBlock title="Work">
            {works.slice(0, 3).map((w, i) => (
              <div
                key={`${w.name}-${i}`}
                style={{
                  fontSize: '0.8rem',
                  color: COLORS.textSecondary,
                  marginTop: i ? '0.4rem' : 0,
                }}
              >
                {w.name}
                {w.tagline && <span style={{ color: COLORS.textMuted }}> — {w.tagline}</span>}
              </div>
            ))}
          </PreviewBlock>
        )}
      </div>
    </aside>
  );
}

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div
        style={{
          color: COLORS.textMuted,
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
