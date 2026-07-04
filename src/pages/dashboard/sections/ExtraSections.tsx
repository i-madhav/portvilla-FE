import type { ReactNode } from 'react';
import { EditableSection } from '../components/EditableSection';
import { Chips } from '../components/display';
import { COLORS } from '../styles';
import type { SectionProps } from './types';

/**
 * Read-only display for the profile sections that don't yet have inline editors
 * (offerings, metrics, testimonials, team, media, content). Each card renders
 * only when it has data. Inline editing for these is a tracked follow-up.
 */
export function ExtraSections({ profile }: Pick<SectionProps, 'profile'>) {
  const { offerings, metrics, testimonials, team, media, content } = profile;

  return (
    <>
      {offerings.length > 0 && (
        <ReadOnlyCard title="Offerings" description="Services and products you offer.">
          {offerings.map((o, i) => (
            <Row key={i} primary={o.name} secondary={o.description} trailing={o.price ?? undefined} />
          ))}
        </ReadOnlyCard>
      )}

      {metrics.length > 0 && (
        <ReadOnlyCard title="Metrics" description="Numbers that back you up.">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            {metrics.map((m, i) => (
              <div key={i}>
                <div style={{ color: COLORS.primaryText, fontSize: '1.1rem', fontWeight: 700 }}>{m.value}</div>
                <div style={{ color: COLORS.mutedText, fontSize: '0.72rem' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </ReadOnlyCard>
      )}

      {testimonials.length > 0 && (
        <ReadOnlyCard title="Testimonials" description="What others say.">
          {testimonials.map((t, i) => (
            <div key={i} style={{ marginBottom: '0.6rem' }}>
              <div style={{ color: COLORS.secondaryText, fontSize: '0.8rem', fontStyle: 'italic' }}>“{t.text}”</div>
              <div style={{ color: COLORS.mutedText, fontSize: '0.72rem', marginTop: '0.15rem' }}>
                — {t.author}
                {t.organization ? `, ${t.organization}` : ''}
              </div>
            </div>
          ))}
        </ReadOnlyCard>
      )}

      {team.length > 0 && (
        <ReadOnlyCard title="Team" description="The people behind it.">
          {team.map((m, i) => (
            <Row key={i} primary={m.name} secondary={m.role} />
          ))}
        </ReadOnlyCard>
      )}

      {content.length > 0 && (
        <ReadOnlyCard title="Content" description="Writing, talks, and media you've published.">
          {content.map((c, i) => (
            <Row
              key={i}
              primary={c.title}
              secondary={c.type}
              trailing={
                <a href={c.url} target="_blank" rel="noreferrer" style={{ color: COLORS.secondaryText, fontSize: '0.72rem' }}>
                  ↗
                </a>
              }
            />
          ))}
        </ReadOnlyCard>
      )}

      {media.length > 0 && (
        <ReadOnlyCard title="Media" description="Images and video.">
          <Chips items={media.map((m) => m.caption || m.type)} />
        </ReadOnlyCard>
      )}
    </>
  );
}

function ReadOnlyCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return <EditableSection title={title} description={description} readOnly view={<div>{children}</div>} edit={() => null} />;
}

function Row({
  primary,
  secondary,
  trailing,
}: {
  primary: string;
  secondary?: string;
  trailing?: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem', padding: '0.25rem 0' }}>
      <div>
        <span style={{ color: COLORS.primaryText, fontSize: '0.82rem', fontWeight: 600 }}>{primary}</span>
        {secondary && <span style={{ color: COLORS.mutedText, fontSize: '0.72rem', marginLeft: '0.5rem' }}>{secondary}</span>}
      </div>
      {trailing && <div style={{ flexShrink: 0 }}>{trailing}</div>}
    </div>
  );
}
