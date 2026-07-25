import { useState } from 'react';
import type { EntityType } from '@typings/profileApi';
import { labelStyle, inputStyle, textareaStyle, selectStyle } from '@shared-components/theme';
import { EditableSection } from '../components/EditableSection';
import { EditActions } from '../components/EditActions';
import { KeyValue } from '../components/display';
import type { SectionProps } from './types';

const ENTITY_LABELS: Record<EntityType, string> = {
  individual: 'Individual / Freelancer',
  company: 'Company / Startup',
  product: 'Product',
  organization: 'Organization / Community',
};

const miniLabel = { ...labelStyle, fontSize: '0.7rem', marginTop: '0.75rem' };
const orNull = (s: string) => (s.trim() ? s.trim() : null);

export function IdentitySection({ profile, save }: SectionProps) {
  const id = profile.identity;

  return (
    <EditableSection
      title="Identity"
      description="The first thing visitors and your agent know about you."
      view={
        <div>
          <KeyValue label="Name" value={id.name} />
          <KeyValue label="Type" value={ENTITY_LABELS[id.entityType]} />
          <KeyValue label="Tagline" value={id.tagline} />
          <KeyValue label="Bio" value={id.bio} />
          <KeyValue label="About" value={id.about} />
          <KeyValue label="Location" value={id.location} />
          <KeyValue label="Industry" value={id.industry} />
          <KeyValue label="Availability" value={id.availability} />
        </div>
      }
      edit={({ done }) => <IdentityEdit id={id} save={save} done={done} />}
    />
  );
}

function IdentityEdit({
  id,
  save,
  done,
}: {
  id: SectionProps['profile']['identity'];
  save: SectionProps['save'];
  done: () => void;
}) {
  const [name, setName] = useState(id.name);
  const [entityType, setEntityType] = useState<EntityType>(id.entityType);
  const [tagline, setTagline] = useState(id.tagline ?? '');
  const [bio, setBio] = useState(id.bio ?? '');
  const [about, setAbout] = useState(id.about ?? '');
  const [location, setLocation] = useState(id.location ?? '');
  const [industry, setIndustry] = useState(id.industry ?? '');
  const [availability, setAvailability] = useState(id.availability ?? '');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await save({
        identity: {
          name: name.trim(),
          entityType,
          tagline: orNull(tagline),
          bio: orNull(bio),
          about: orNull(about),
          location: orNull(location),
          industry: orNull(industry),
          availability: orNull(availability),
        },
      });
      done();
    } catch {
      /* toast handled upstream */
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <label style={{ ...miniLabel, marginTop: 0 }}>Type</label>
      <select value={entityType} onChange={(e) => setEntityType(e.target.value as EntityType)} style={selectStyle()}>
        {Object.entries(ENTITY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <label style={miniLabel}>Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle(name.trim() ? 'default' : 'error')} />

      <label style={miniLabel}>Tagline</label>
      <input value={tagline} onChange={(e) => setTagline(e.target.value)} style={inputStyle()} maxLength={120} />

      <label style={miniLabel}>Bio</label>
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={textareaStyle()} rows={2} maxLength={500} />

      <label style={miniLabel}>About</label>
      <textarea value={about} onChange={(e) => setAbout(e.target.value)} style={textareaStyle()} rows={4} maxLength={2000} />

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <label style={miniLabel}>Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle()} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={miniLabel}>Industry</label>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle()} />
        </div>
      </div>

      <label style={miniLabel}>Availability</label>
      <input value={availability} onChange={(e) => setAvailability(e.target.value)} style={inputStyle()} />

      <EditActions onCancel={done} saving={saving} />
    </form>
  );
}
