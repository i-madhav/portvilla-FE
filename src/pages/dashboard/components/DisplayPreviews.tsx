import { useMemo, useState } from 'react';
import type { ProfileDataResponseDto } from '@typings/profileApi';

interface DisplayPreviewsProps {
  profile: ProfileDataResponseDto;
  onEditSource: (section: string) => void;
}

type PreviewKind = 'profile' | 'feature' | 'gallery' | 'timeline' | 'comparison' | 'quote';

interface PreviewItem {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceLabel: string;
  kind: PreviewKind;
  count: number;
  ready: boolean;
}

/** A deterministic preview of the display-schema layouts the saved profile can
 * support. This never claims an LLM generation succeeded when no schema API is
 * available; readiness is based solely on persisted source data. */
export function DisplayPreviews({ profile, onEditSource }: DisplayPreviewsProps) {
  const previews = useMemo(() => buildPreviews(profile), [profile]);
  const ready = previews.filter((preview) => preview.ready);
  const [selectedId, setSelectedId] = useState(ready[0]?.id ?? previews[0].id);
  const selected = previews.find((preview) => preview.id === selectedId) ?? previews[0];

  return (
    <section className="pv-display-library" aria-labelledby="display-library-title">
      <div className="pv-display-library-heading">
        <div>
          <p className="meta">Visitor experience</p>
          <h2 id="display-library-title">Agent display previews</h2>
          <p>Visual stories your agent can show from the content you have saved.</p>
        </div>
        <span className="pv-ready-count">{ready.length} of {previews.length} ready</span>
      </div>

      <div className="pv-display-library-grid">
        <div className="pv-display-preview-stage">
          <div className="pv-preview-window-bar">
            <span /><span /><span />
            <small>Visitor display · {selected.kind}</small>
          </div>
          <PreviewCanvas preview={selected} profile={profile} />
          <div className="pv-preview-stage-footer">
            <span>Source: {selected.sourceLabel}</span>
            <strong>{selected.ready ? 'Ready to show' : 'Needs content'}</strong>
          </div>
        </div>

        <div className="pv-display-topic-list" role="list" aria-label="Available display topics">
          {previews.map((preview) => {
            const active = preview.id === selected.id;
            return (
              <div className={active ? 'pv-display-topic pv-display-topic-active' : 'pv-display-topic'} key={preview.id} role="listitem">
                <button
                  type="button"
                  className="pv-display-topic-main pv-focusable"
                  onClick={() => setSelectedId(preview.id)}
                  aria-pressed={active}
                >
                  <span className={`pv-display-kind-icon pv-display-kind-${preview.kind}`} aria-hidden="true">
                    <MiniLayout kind={preview.kind} />
                  </span>
                  <span>
                    <strong>{preview.title}</strong>
                    <small>{preview.description}</small>
                  </span>
                </button>
                {preview.ready ? (
                  <span className="pv-display-ready" aria-label="Ready">{preview.count}</span>
                ) : (
                  <button type="button" className="pv-display-add pv-focusable" onClick={() => onEditSource(preview.source)}>
                    Add content
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function buildPreviews(profile: ProfileDataResponseDto): PreviewItem[] {
  const entity = profile.identity.entityType;
  const worksName = entity === 'company' ? 'Products & case studies' : entity === 'product' ? 'Product stories' : 'Selected work';
  const capabilityName = entity === 'product' ? 'Product features' : entity === 'company' ? 'Capabilities' : 'Expertise';
  const timelineName = entity === 'individual' ? 'Career journey' : 'Milestones';

  const items: PreviewItem[] = [
    {
      id: 'profile', title: 'Introduction', description: 'Profile card', source: 'identity', sourceLabel: 'Identity',
      kind: 'profile', count: profile.identity.name ? 1 : 0, ready: Boolean(profile.identity.name && (profile.identity.bio || profile.identity.tagline)),
    },
    {
      id: 'capabilities', title: capabilityName, description: 'Feature grid', source: 'capabilities', sourceLabel: 'Capabilities',
      kind: 'feature', count: profile.capabilities.length, ready: profile.capabilities.length > 0,
    },
    {
      id: 'works', title: worksName, description: 'Card gallery', source: 'works', sourceLabel: 'Work',
      kind: 'gallery', count: profile.works.length, ready: profile.works.length > 0,
    },
    {
      id: 'timeline', title: timelineName, description: 'Timeline', source: 'timeline', sourceLabel: entity === 'individual' ? 'Experience' : 'Milestones',
      kind: 'timeline', count: profile.timeline.length, ready: profile.timeline.length > 0,
    },
  ];

  if (entity !== 'product' || profile.offerings.length > 0) {
    items.push({
      id: 'offerings', title: entity === 'company' ? 'Plans & offerings' : 'Services & offerings', description: 'Comparison',
      source: 'more', sourceLabel: 'Offerings', kind: 'comparison', count: profile.offerings.length, ready: profile.offerings.length > 0,
    });
  }
  items.push({
    id: 'testimonials', title: 'What people say', description: 'Quote carousel', source: 'more', sourceLabel: 'Testimonials',
    kind: 'quote', count: profile.testimonials.length, ready: profile.testimonials.length > 0,
  });
  return items;
}

function PreviewCanvas({ preview, profile }: { preview: PreviewItem; profile: ProfileDataResponseDto }) {
  if (!preview.ready) {
    return (
      <div className="pv-preview-empty">
        <span aria-hidden="true">＋</span>
        <h3>Add {preview.sourceLabel.toLowerCase()} to unlock this display</h3>
        <p>Your agent will only show visual stories supported by information you have approved.</p>
      </div>
    );
  }

  if (preview.kind === 'profile') {
    return (
      <div className="pv-preview-profile">
        <div className="pv-preview-profile-image">
          {profile.identity.primaryImage ? <img src={profile.identity.primaryImage} alt="" /> : profile.identity.name.charAt(0)}
        </div>
        <p className="meta">Meet {profile.identity.name}</p>
        <h3>{profile.identity.tagline || profile.identity.name}</h3>
        <p>{profile.identity.bio}</p>
      </div>
    );
  }

  if (preview.kind === 'feature') {
    return (
      <div className="pv-preview-feature-grid">
        {profile.capabilities.slice(0, 4).map((capability, index) => (
          <div key={`${capability.name}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{capability.name}</strong><small>{capability.category || 'Capability'}</small></div>
        ))}
      </div>
    );
  }

  if (preview.kind === 'gallery') {
    return (
      <div className="pv-preview-gallery">
        {profile.works.slice(0, 3).map((work, index) => (
          <article key={`${work.name}-${index}`}>
            <div style={work.coverImage ? { backgroundImage: `linear-gradient(rgba(20,19,26,.12), rgba(20,19,26,.5)), url(${work.coverImage})` } : undefined} />
            <span>{work.type.replace('_', ' ')}</span><strong>{work.name}</strong><small>{work.tagline || work.description}</small>
          </article>
        ))}
      </div>
    );
  }

  if (preview.kind === 'timeline') {
    return (
      <div className="pv-preview-timeline">
        {profile.timeline.slice(0, 4).map((item, index) => (
          <div key={`${item.label}-${index}`}><span /><small>{item.date}</small><strong>{item.label}</strong><p>{item.organization}</p></div>
        ))}
      </div>
    );
  }

  if (preview.kind === 'comparison') {
    return (
      <div className="pv-preview-comparison">
        {profile.offerings.slice(0, 3).map((offering, index) => (
          <article className={offering.highlighted ? 'pv-preview-plan-highlighted' : ''} key={`${offering.name}-${index}`}>
            <span>{offering.highlighted ? 'Popular' : 'Option'}</span><strong>{offering.name}</strong><b>{offering.price || 'Let’s talk'}</b><small>{offering.description}</small>
          </article>
        ))}
      </div>
    );
  }

  const testimonial = profile.testimonials[0];
  return (
    <blockquote className="pv-preview-quote">
      <span aria-hidden="true">“</span>
      <p>{testimonial.text}</p>
      <footer>{testimonial.author}{testimonial.organization ? ` · ${testimonial.organization}` : ''}</footer>
    </blockquote>
  );
}

function MiniLayout({ kind }: { kind: PreviewKind }) {
  return (
    <span className={`pv-mini-layout pv-mini-layout-${kind}`}>
      <i /><i /><i />
    </span>
  );
}
