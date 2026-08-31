import { useState } from 'react';
import type {
  ContentEntryDto,
  ContentType,
  MediaEntryDto,
  MetricEntryDto,
  OfferingEntryDto,
  TeamMemberEntryDto,
  TestimonialEntryDto,
  TestimonialRelationship,
} from '@typings/profileApi';
import { ContentType as Content, TestimonialRelationship as Relationship } from '@typings/profileApi';
import { arrayToCsv, csvToArray } from '@app/lib/ui/formHelpers';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { inputStyle, labelStyle, selectStyle, textareaStyle } from '@shared-components/theme';
import { EditableSection } from '../components/EditableSection';
import { EditActions } from '../components/EditActions';
import { Chips, EmptyText } from '../components/display';
import type { SectionProps } from './types';

export type ExtraSectionId = 'offerings' | 'metrics' | 'testimonials' | 'team' | 'media' | 'content';

interface ExtraSectionsProps extends SectionProps {
  visible?: ExtraSectionId[];
}

const miniLabel = { ...labelStyle, fontSize: '0.68rem', marginBottom: '0.25rem' };
const fieldPair = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))', gap: '0.6rem' };
const checkboxLabel = { ...miniLabel, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 0, whiteSpace: 'nowrap' as const };

const RELATIONSHIP_OPTIONS: { value: TestimonialRelationship; label: string }[] = [
  { value: Relationship.Colleague, label: 'Colleague' },
  { value: Relationship.Manager, label: 'Manager' },
  { value: Relationship.Client, label: 'Client' },
  { value: Relationship.User, label: 'User' },
  { value: Relationship.Investor, label: 'Investor' },
  { value: Relationship.Other, label: 'Other' },
];

/** Less common schema sections stay editable here, but the parent controls
 * which ones make sense for the selected entity type. */
export function ExtraSections({ profile, save, visible }: ExtraSectionsProps) {
  const show = (id: ExtraSectionId) => !visible || visible.includes(id);
  return (
    <div className="pv-extra-sections">
      {show('offerings') ? <OfferingsCard profile={profile} save={save} /> : null}
      {show('metrics') ? <MetricsCard profile={profile} save={save} /> : null}
      {show('testimonials') ? <TestimonialsCard profile={profile} save={save} /> : null}
      {show('team') ? <TeamCard profile={profile} save={save} /> : null}
      {show('content') ? <ContentCard profile={profile} save={save} /> : null}
      {show('media') ? <MediaCard profile={profile} save={save} /> : null}
    </div>
  );
}

function OfferingsCard({ profile, save }: SectionProps) {
  const [items, setItems] = useState(profile.offerings);
  return (
    <EditableSection
      title="Offerings"
      description="Services, products, or plans visitors can explore."
      view={items.length ? <div>{items.map((item, i) => <Row key={i} primary={item.name} secondary={item.description} trailing={item.price ?? undefined} />)}</div> : <EmptyText>No offerings yet.</EmptyText>}
      edit={({ done }) => (
        <ListForm
          items={items}
          setItems={setItems}
          makeEmpty={emptyOffering}
          addLabel="Add an offering"
          onSave={() => save({ offerings: items.filter((item) => item.name.trim() && item.description.trim()) })}
          done={done}
          render={(item, update, i) => (
            <>
              <div style={fieldPair}>
                <Field label="Name"><input aria-label={`Offering ${i + 1} name`} value={item.name} onChange={(e) => update({ name: e.target.value })} style={inputStyle()} /></Field>
                <Field label="Price"><input aria-label={`Offering ${i + 1} price`} value={item.price ?? ''} onChange={(e) => update({ price: e.target.value || null })} style={inputStyle()} placeholder="e.g. $49/mo" /></Field>
              </div>
              <Field label="Description"><textarea aria-label={`Offering ${i + 1} description`} value={item.description} onChange={(e) => update({ description: e.target.value })} style={textareaStyle()} rows={2} /></Field>
              <Field label="Features"><input aria-label={`Offering ${i + 1} features`} value={arrayToCsv(item.features)} onChange={(e) => update({ features: csvToArray(e.target.value) })} style={inputStyle()} placeholder="Comma-separated" /></Field>
              <Field label="Tags"><input aria-label={`Offering ${i + 1} tags`} value={arrayToCsv(item.tags)} onChange={(e) => update({ tags: csvToArray(e.target.value) })} style={inputStyle()} placeholder="Comma-separated" /></Field>
              <div style={fieldPair}>
                <Field label="CTA label"><input aria-label={`Offering ${i + 1} CTA label`} value={item.cta?.label ?? ''} onChange={(e) => update({ cta: e.target.value ? { label: e.target.value, url: item.cta?.url ?? '' } : null })} style={inputStyle()} placeholder="Get started" /></Field>
                <Field label="CTA link"><input aria-label={`Offering ${i + 1} CTA link`} value={item.cta?.url ?? ''} onChange={(e) => update({ cta: item.cta?.label ? { label: item.cta.label, url: e.target.value } : item.cta }) } style={inputStyle()} placeholder="https://…" disabled={!item.cta?.label} /></Field>
              </div>
              <label style={checkboxLabel}>
                <input aria-label={`Offering ${i + 1} highlighted`} type="checkbox" checked={item.highlighted} onChange={(e) => update({ highlighted: e.target.checked })} />
                Highlighted
              </label>
            </>
          )}
        />
      )}
    />
  );
}

function MetricsCard({ profile, save }: SectionProps) {
  const [items, setItems] = useState(profile.metrics);
  return (
    <EditableSection
      title="Metrics"
      description="Specific numbers that make the story credible."
      view={items.length ? <div className="pv-metrics-preview">{items.map((item, i) => <div key={i}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div> : <EmptyText>No metrics yet.</EmptyText>}
      edit={({ done }) => (
        <ListForm items={items} setItems={setItems} makeEmpty={emptyMetric} addLabel="Add a metric" onSave={() => save({ metrics: items.filter((item) => item.value.trim() && item.label.trim()) })} done={done} render={(item, update, i) => (
          <>
            <div style={fieldPair}>
              <Field label="Value"><input aria-label={`Metric ${i + 1} value`} value={item.value} onChange={(e) => update({ value: e.target.value })} style={inputStyle()} placeholder="e.g. 5k+" /></Field>
              <Field label="Label"><input aria-label={`Metric ${i + 1} label`} value={item.label} onChange={(e) => update({ label: e.target.value })} style={inputStyle()} placeholder="e.g. Active users" /></Field>
            </div>
            <div style={fieldPair}>
              <Field label="Context"><input aria-label={`Metric ${i + 1} description`} value={item.description ?? ''} onChange={(e) => update({ description: e.target.value || null })} style={inputStyle()} /></Field>
              <Field label="Category"><input aria-label={`Metric ${i + 1} category`} value={item.category ?? ''} onChange={(e) => update({ category: e.target.value || null })} style={inputStyle()} /></Field>
            </div>
          </>
        )} />
      )}
    />
  );
}

function TestimonialsCard({ profile, save }: SectionProps) {
  const [items, setItems] = useState(profile.testimonials);
  return (
    <EditableSection
      title="Testimonials"
      description="Approved quotes your agent can show as social proof."
      view={items.length ? <div>{items.map((item, i) => <blockquote className="pv-knowledge-quote" key={i}>“{item.text}”<footer>— {item.author}{item.organization ? `, ${item.organization}` : ''}</footer></blockquote>)}</div> : <EmptyText>No testimonials yet.</EmptyText>}
      edit={({ done }) => (
        <ListForm items={items} setItems={setItems} makeEmpty={emptyTestimonial} addLabel="Add a testimonial" onSave={() => save({ testimonials: items.filter((item) => item.text.trim() && item.author.trim()) })} done={done} render={(item, update, i) => (
          <>
            <Field label="Quote"><textarea aria-label={`Testimonial ${i + 1} quote`} value={item.text} onChange={(e) => update({ text: e.target.value })} style={textareaStyle()} rows={3} /></Field>
            <div style={fieldPair}>
              <Field label="Author"><input aria-label={`Testimonial ${i + 1} author`} value={item.author} onChange={(e) => update({ author: e.target.value })} style={inputStyle()} /></Field>
              <Field label="Role"><input aria-label={`Testimonial ${i + 1} role`} value={item.role ?? ''} onChange={(e) => update({ role: e.target.value || null })} style={inputStyle()} /></Field>
            </div>
            <div style={fieldPair}>
              <Field label="Organization"><input aria-label={`Testimonial ${i + 1} organization`} value={item.organization ?? ''} onChange={(e) => update({ organization: e.target.value || null })} style={inputStyle()} /></Field>
              <Field label="Relationship">
                <select aria-label={`Testimonial ${i + 1} relationship`} value={item.relationship} onChange={(e) => update({ relationship: e.target.value as TestimonialRelationship })} style={selectStyle()}>
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <label style={checkboxLabel}>
              <input aria-label={`Testimonial ${i + 1} featured`} type="checkbox" checked={item.featured} onChange={(e) => update({ featured: e.target.checked })} />
              Featured
            </label>
          </>
        )} />
      )}
    />
  );
}

function TeamCard({ profile, save }: SectionProps) {
  const [items, setItems] = useState(profile.team);
  return (
    <EditableSection
      title="Team"
      description="People the agent may introduce on behalf of the organization."
      view={items.length ? <div>{items.map((item, i) => <Row key={i} primary={item.name} secondary={item.role} />)}</div> : <EmptyText>No team members yet.</EmptyText>}
      edit={({ done }) => (
        <ListForm items={items} setItems={setItems} makeEmpty={emptyTeamMember} addLabel="Add a team member" onSave={() => save({ team: items.filter((item) => item.name.trim() && item.role.trim()) })} done={done} render={(item, update, i) => (
          <>
            <div style={fieldPair}>
              <Field label="Name"><input aria-label={`Team member ${i + 1} name`} value={item.name} onChange={(e) => update({ name: e.target.value })} style={inputStyle()} /></Field>
              <Field label="Role"><input aria-label={`Team member ${i + 1} role`} value={item.role} onChange={(e) => update({ role: e.target.value })} style={inputStyle()} /></Field>
            </div>
            <Field label="Bio"><textarea aria-label={`Team member ${i + 1} bio`} value={item.bio ?? ''} onChange={(e) => update({ bio: e.target.value || null })} style={textareaStyle()} rows={2} /></Field>
            <label style={miniLabel}>Links</label>
            <RepeatableList
              items={item.links}
              onChange={(links) => update({ links })}
              makeEmpty={() => ({ platform: '', url: '' })}
              addLabel="Add a link"
              emptyHint="No links yet."
              renderItem={(link, updateLink, li) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={miniLabel}>Platform</label>
                    <input aria-label={`Team member ${i + 1} link ${li + 1} platform`} value={link.platform} onChange={(e) => updateLink({ platform: e.target.value })} style={inputStyle()} />
                  </div>
                  <div style={{ flex: 1.6 }}>
                    <label style={miniLabel}>URL</label>
                    <input aria-label={`Team member ${i + 1} link ${li + 1} URL`} value={link.url} onChange={(e) => updateLink({ url: e.target.value })} style={inputStyle()} placeholder="https://…" />
                  </div>
                </div>
              )}
            />
          </>
        )} />
      )}
    />
  );
}

function ContentCard({ profile, save }: SectionProps) {
  const [items, setItems] = useState(profile.content);
  return (
    <EditableSection
      title="Published content"
      description="Writing, talks, and media the agent can recommend."
      view={items.length ? <div>{items.map((item, i) => <Row key={i} primary={item.title} secondary={item.type} trailing={<a href={item.url} target="_blank" rel="noreferrer">↗</a>} />)}</div> : <EmptyText>No published content yet.</EmptyText>}
      edit={({ done }) => (
        <ListForm items={items} setItems={setItems} makeEmpty={emptyContent} addLabel="Add content" onSave={() => save({ content: items.filter((item) => item.title.trim() && item.url.trim()) })} done={done} render={(item, update, i) => (
          <>
            <div style={fieldPair}>
              <Field label="Type"><select aria-label={`Content ${i + 1} type`} value={item.type} onChange={(e) => update({ type: e.target.value as ContentType })} style={selectStyle()}>{CONTENT_OPTIONS.map((type) => <option key={type} value={type}>{titleCase(type)}</option>)}</select></Field>
              <Field label="Title"><input aria-label={`Content ${i + 1} title`} value={item.title} onChange={(e) => update({ title: e.target.value })} style={inputStyle()} /></Field>
            </div>
            <Field label="URL"><input type="url" aria-label={`Content ${i + 1} URL`} value={item.url} onChange={(e) => update({ url: e.target.value })} style={inputStyle()} placeholder="https://…" /></Field>
            <Field label="Description"><textarea aria-label={`Content ${i + 1} description`} value={item.description ?? ''} onChange={(e) => update({ description: e.target.value || null })} style={textareaStyle()} rows={2} /></Field>
            <div style={fieldPair}>
              <Field label="Date"><input aria-label={`Content ${i + 1} date`} type="month" value={item.date ?? ''} onChange={(e) => update({ date: e.target.value || null })} style={inputStyle()} /></Field>
              <Field label="Tags"><input aria-label={`Content ${i + 1} tags`} value={arrayToCsv(item.tags)} onChange={(e) => update({ tags: csvToArray(e.target.value) })} style={inputStyle()} placeholder="Comma-separated" /></Field>
            </div>
            <label style={checkboxLabel}>
              <input aria-label={`Content ${i + 1} featured`} type="checkbox" checked={item.featured} onChange={(e) => update({ featured: e.target.checked })} />
              Featured
            </label>
          </>
        )} />
      )}
    />
  );
}

function MediaCard({ profile, save }: SectionProps) {
  const [items, setItems] = useState(profile.media);
  return (
    <EditableSection
      title="Media"
      description="Images and videos available for visual responses."
      view={items.length ? <Chips items={items.map((item) => item.caption || titleCase(item.type))} /> : <EmptyText>No media yet.</EmptyText>}
      edit={({ done }) => (
        <ListForm items={items} setItems={setItems} makeEmpty={emptyMedia} addLabel="Add media" onSave={() => save({ media: items.filter((item) => item.url.trim()) })} done={done} render={(item, update, i) => (
          <>
            <div style={fieldPair}>
              <Field label="Type"><select aria-label={`Media ${i + 1} type`} value={item.type} onChange={(e) => update({ type: e.target.value as MediaEntryDto['type'] })} style={selectStyle()}><option value="image">Image</option><option value="video">Video</option></select></Field>
              <Field label="Category"><input aria-label={`Media ${i + 1} category`} value={item.category ?? ''} onChange={(e) => update({ category: e.target.value || null })} style={inputStyle()} /></Field>
            </div>
            <Field label="URL"><input type="url" aria-label={`Media ${i + 1} URL`} value={item.url} onChange={(e) => update({ url: e.target.value })} style={inputStyle()} placeholder="https://…" /></Field>
            <Field label="Caption"><input aria-label={`Media ${i + 1} caption`} value={item.caption ?? ''} onChange={(e) => update({ caption: e.target.value || null })} style={inputStyle()} /></Field>
          </>
        )} />
      )}
    />
  );
}

function ListForm<T>({ items, setItems, makeEmpty, addLabel, onSave, done, render }: {
  items: T[];
  setItems: (items: T[]) => void;
  makeEmpty: () => T;
  addLabel: string;
  onSave: () => Promise<void>;
  done: () => void;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSave();
      done();
    } catch {
      // Mutation hook owns the error toast.
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={(event) => void submit(event)}>
      <RepeatableList items={items} onChange={setItems} makeEmpty={makeEmpty} addLabel={addLabel} emptyHint="Nothing added yet." renderItem={render} />
      <EditActions onCancel={done} saving={saving} />
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={miniLabel}>{label}{children}</label>;
}

function Row({ primary, secondary, trailing }: { primary: string; secondary?: string; trailing?: React.ReactNode }) {
  return (
    <div className="pv-knowledge-row">
      <span><strong>{primary}</strong>{secondary ? <small>{secondary}</small> : null}</span>
      {trailing ? <span className="pv-knowledge-row-trailing">{trailing}</span> : null}
    </div>
  );
}

const CONTENT_OPTIONS = Object.values(Content);
const titleCase = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const emptyOffering = (): OfferingEntryDto => ({ name: '', description: '', icon: null, price: null, features: [], highlighted: false, tags: [], cta: null });
const emptyMetric = (): MetricEntryDto => ({ value: '', label: '', description: null, icon: null, category: null });
const emptyTestimonial = (): TestimonialEntryDto => ({ text: '', author: '', role: null, organization: null, avatarUrl: null, relationship: Relationship.Other as TestimonialRelationship, featured: false });
const emptyTeamMember = (): TeamMemberEntryDto => ({ name: '', role: '', bio: null, avatarUrl: null, links: [] });
const emptyContent = (): ContentEntryDto => ({ type: Content.Other, title: '', url: '', description: null, thumbnailUrl: null, date: null, tags: [], featured: false });
const emptyMedia = (): MediaEntryDto => ({ url: '', caption: null, type: 'image', category: null });
