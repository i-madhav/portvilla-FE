import { COLORS, FONT, RADIUS } from '@shared-components/theme';
import type {
  CapabilitiesSlidePayload,
  ContactSlidePayload,
  IdentitySlidePayload,
  TimelineSlidePayload,
  WorkSlidePayload,
  WorkStageSlidePayload,
} from '@typings/slides';
import { DateRange, Eyebrow, Highlights, Pills, SlideImage } from './parts';
import { slideBodyStyle, slideTitleStyle, stackStyle } from './styles';

/**
 * One renderer per slide template.
 *
 * Each takes only its own payload — never the profile — because a slide arrives
 * complete on the data channel. That is what lets the agent show something this
 * page never fetched, and what keeps a stale page from rendering stale content.
 *
 * None of them render the talk track: the spoken line is the agent's script,
 * and printing it invites the visitor to read ahead of the voice.
 */

export function IdentitySlide({ payload }: { payload: IdentitySlidePayload }) {
  const facts = [payload.location, payload.industry, payload.foundedOrBorn].filter(
    (f): f is string => Boolean(f),
  );

  return (
    <div style={stackStyle('1rem')}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {payload.primaryImage && (
          <div style={{ width: '4rem', flexShrink: 0 }}>
            <SlideImage src={payload.primaryImage} alt={payload.name} height="4rem" />
          </div>
        )}
        <div style={stackStyle('0.2rem')}>
          <h2 style={slideTitleStyle}>{payload.name}</h2>
          {payload.tagline && (
            <p style={{ ...slideBodyStyle, fontSize: '0.95rem' }}>{payload.tagline}</p>
          )}
        </div>
      </div>

      {facts.length > 0 && <Pills items={facts} />}
      {payload.availability && <Pills items={[payload.availability]} tone="accent" />}
      {(payload.bio || payload.about) && (
        <p style={{ ...slideBodyStyle, whiteSpace: 'pre-wrap' }}>{payload.bio ?? payload.about}</p>
      )}
    </div>
  );
}

export function WorkSlide({ payload }: { payload: WorkSlidePayload }) {
  return (
    <div style={stackStyle('0.9rem')}>
      {payload.coverImage && <SlideImage src={payload.coverImage} alt="" height="9rem" />}

      <div style={stackStyle('0.25rem')}>
        <Eyebrow>{payload.type.replace(/_/g, ' ')}</Eyebrow>
        <h2 style={slideTitleStyle}>{payload.name}</h2>
        {payload.tagline && <p style={slideBodyStyle}>{payload.tagline}</p>}
      </div>

      {payload.description && <p style={slideBodyStyle}>{payload.description}</p>}
      <Highlights items={payload.highlights} />
      <Pills items={payload.technologies} tone="accent" />

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <DateRange date={payload.date} endDate={null} />
        {payload.url && <SlideLink href={payload.url}>Visit ↗</SlideLink>}
        {payload.repoUrl && <SlideLink href={payload.repoUrl}>Source ↗</SlideLink>}
      </div>

      {/*
        The arc is announced, not walked: the visitor is told a story exists so
        they can ask for it, and the agent reveals it one stage at a time.
      */}
      {payload.stageCount > 0 && (
        <p style={{ ...slideBodyStyle, fontSize: '0.8rem', color: COLORS.textMuted }}>
          {payload.stageCount}-part story · ask to hear it
        </p>
      )}
    </div>
  );
}

export function WorkStageSlide({ payload }: { payload: WorkStageSlidePayload }) {
  return (
    <div style={stackStyle('0.9rem')}>
      <div style={stackStyle('0.25rem')}>
        <Eyebrow>
          {payload.workName} · part {payload.position} of {payload.total}
        </Eyebrow>
        <h2 style={slideTitleStyle}>{payload.label}</h2>
      </div>

      <ArcProgress position={payload.position} total={payload.total} />

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <DateRange date={payload.date} endDate={payload.endDate} />
        <Pills items={[payload.status.replace(/-/g, ' ')]} />
      </div>

      <Highlights items={payload.highlights} />
    </div>
  );
}

export function CapabilitiesSlide({ payload }: { payload: CapabilitiesSlidePayload }) {
  return (
    <div style={stackStyle('0.9rem')}>
      <Eyebrow>Capabilities</Eyebrow>
      <div style={stackStyle('0.6rem')}>
        {payload.items.map((item) => (
          <div key={item.key} style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline' }}>
            <span style={{ color: COLORS.textPrimary, fontSize: '0.9rem', fontWeight: 600 }}>
              {item.name}
            </span>
            {item.proficiency && (
              <span style={{ fontFamily: FONT.mono, fontSize: '0.7rem', color: COLORS.accent }}>
                {item.proficiency}
              </span>
            )}
            {item.yearsOfExperience !== null && (
              <span style={{ fontFamily: FONT.mono, fontSize: '0.7rem', color: COLORS.textMuted }}>
                {item.yearsOfExperience}y
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimelineSlide({ payload }: { payload: TimelineSlidePayload }) {
  return (
    <div style={stackStyle('0.9rem')}>
      <Eyebrow>Timeline</Eyebrow>
      <div style={stackStyle('0.85rem')}>
        {payload.items.map((item) => (
          <div key={item.key} style={{ display: 'flex', gap: '0.85rem' }}>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: '0.72rem',
                color: item.highlight ? COLORS.accent : COLORS.textMuted,
                width: '4.5rem',
                flexShrink: 0,
                paddingTop: '0.15rem',
              }}
            >
              {item.date}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: COLORS.textPrimary, fontSize: '0.88rem', fontWeight: 600 }}>
                {item.label}
                {item.organization && (
                  <span style={{ color: COLORS.textMuted, fontWeight: 400 }}> · {item.organization}</span>
                )}
              </div>
              {item.description && (
                <p style={{ ...slideBodyStyle, fontSize: '0.82rem', marginTop: '0.2rem' }}>
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactSlide({ payload }: { payload: ContactSlidePayload }) {
  return (
    <div style={stackStyle('0.9rem')}>
      <Eyebrow>Get in touch</Eyebrow>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {payload.calendarUrl && <SlideLink href={payload.calendarUrl}>Book a call ↗</SlideLink>}
        {payload.links.map((link, i) => (
          <SlideLink key={`${link.platform}-${i}`} href={link.url}>
            {link.label || link.platform} ↗
          </SlideLink>
        ))}
      </div>
    </div>
  );
}

// ─── Local parts ──────────────────────────────────────────────────────────────

function SlideLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="pv-focusable"
      style={{
        color: COLORS.accent,
        fontSize: '0.82rem',
        fontWeight: 600,
        textDecoration: 'none',
        border: `1px solid ${COLORS.borderSubtle}`,
        borderRadius: RADIUS.pill,
        padding: '0.35rem 0.75rem',
      }}
    >
      {children}
    </a>
  );
}

/** Where this stage sits in the arc, as a row of segments. */
function ArcProgress({ position, total }: { position: number; total: number }) {
  if (total <= 1) return null;
  return (
    <div
      style={{ display: 'flex', gap: '0.25rem' }}
      role="img"
      aria-label={`Part ${position} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{
            height: '0.25rem',
            flex: 1,
            borderRadius: RADIUS.pill,
            background: i < position ? COLORS.accent : COLORS.borderSubtle,
            transition: 'background 250ms',
          }}
        />
      ))}
    </div>
  );
}
