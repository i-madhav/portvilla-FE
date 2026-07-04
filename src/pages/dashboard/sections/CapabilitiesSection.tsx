import { useState } from 'react';
import type { CapabilityEntryDto, CapabilityProficiency } from '@typings/profileApi';
import { CapabilityProficiency as Proficiency } from '@typings/profileApi';
import { labelStyle, inputStyle, selectStyle } from '@pages/onboarding/styles';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { EditableSection } from '../components/EditableSection';
import { EditActions } from '../components/EditActions';
import { EmptyText } from '../components/display';
import { pillStyle, COLORS } from '../styles';
import type { SectionProps } from './types';

const makeEmpty = (): CapabilityEntryDto => ({
  name: '',
  description: null,
  icon: null,
  category: null,
  proficiency: null,
  yearsOfExperience: null,
});

const PROFICIENCY_OPTIONS: { value: CapabilityProficiency | ''; label: string }[] = [
  { value: '', label: 'Level (optional)' },
  { value: Proficiency.Familiar, label: 'Familiar' },
  { value: Proficiency.Proficient, label: 'Proficient' },
  { value: Proficiency.Expert, label: 'Expert' },
];

const miniLabel = { ...labelStyle, fontSize: '0.68rem', marginBottom: '0.25rem' };

export function CapabilitiesSection({ profile, save }: SectionProps) {
  const capabilities = profile.capabilities;

  return (
    <EditableSection
      title="Skills & Capabilities"
      description="What your agent can vouch for."
      view={
        capabilities.length === 0 ? (
          <EmptyText>No skills yet — add some so your agent can speak to them.</EmptyText>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {capabilities.map((c, i) => (
              <span key={`${c.name}-${i}`} style={pillStyle}>
                {c.name}
                {c.proficiency && (
                  <span style={{ color: COLORS.mutedText, fontSize: '0.65rem' }}>· {c.proficiency}</span>
                )}
              </span>
            ))}
          </div>
        )
      }
      edit={({ done }) => <CapabilitiesEdit initial={capabilities} save={save} done={done} />}
    />
  );
}

function CapabilitiesEdit({
  initial,
  save,
  done,
}: {
  initial: CapabilityEntryDto[];
  save: SectionProps['save'];
  done: () => void;
}) {
  const [items, setItems] = useState<CapabilityEntryDto[]>(initial);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await save({ capabilities: items.filter((c) => c.name.trim().length > 0) });
      done();
    } catch {
      /* toast handled upstream */
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <RepeatableList
        items={items}
        onChange={setItems}
        makeEmpty={makeEmpty}
        addLabel="Add a skill"
        emptyHint="No skills yet."
        renderItem={(item, update) => (
          <>
            <div>
              <label style={miniLabel}>Skill</label>
              <input
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
                style={inputStyle(false)}
                placeholder="e.g. React"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Category</label>
                <input
                  value={item.category ?? ''}
                  onChange={(e) => update({ category: e.target.value || null })}
                  style={inputStyle(false)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Level</label>
                <select
                  value={item.proficiency ?? ''}
                  onChange={(e) =>
                    update({ proficiency: (e.target.value || null) as CapabilityProficiency | null })
                  }
                  style={selectStyle()}
                >
                  {PROFICIENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      />
      <EditActions onCancel={done} saving={saving} />
    </form>
  );
}
