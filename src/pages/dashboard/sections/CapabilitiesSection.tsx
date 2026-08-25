import { useState } from 'react';
import type { CapabilityEntryDto, CapabilityProficiency, EntityType } from '@typings/profileApi';
import { CapabilityProficiency as Proficiency } from '@typings/profileApi';
import { labelStyle, inputStyle, selectStyle, textareaStyle } from '@shared-components/theme';
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
  const entityType = profile.identity.entityType;
  const title = entityType === 'individual' ? 'Skills & capabilities' : entityType === 'product' ? 'Product features' : 'Capabilities';
  const description = entityType === 'individual'
    ? 'Expertise your agent can speak to with confidence.'
    : 'Strengths and features your agent can explain to visitors.';

  return (
    <EditableSection
      title={title}
      description={description}
      view={
        capabilities.length === 0 ? (
          <EmptyText>No {entityType === 'individual' ? 'skills' : 'capabilities'} yet — add some so your agent can speak to them.</EmptyText>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {capabilities.map((c, i) => (
              <span key={`${c.name}-${i}`} style={pillStyle}>
                {c.name}
                {c.proficiency && (
                  <span style={{ color: COLORS.textMuted, fontSize: '0.65rem' }}>· {c.proficiency}</span>
                )}
              </span>
            ))}
          </div>
        )
      }
      edit={({ done }) => <CapabilitiesEdit initial={capabilities} entityType={entityType} save={save} done={done} />}
    />
  );
}

function CapabilitiesEdit({
  initial,
  entityType,
  save,
  done,
}: {
  initial: CapabilityEntryDto[];
  entityType: EntityType;
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
        addLabel={entityType === 'individual' ? 'Add a skill' : entityType === 'product' ? 'Add a feature' : 'Add a capability'}
        emptyHint={`No ${entityType === 'individual' ? 'skills' : 'capabilities'} yet.`}
        renderItem={(item, update, index) => (
          <>
            <div>
              <label style={miniLabel}>Skill</label>
              <input
                aria-label={`Skill ${index + 1} name`}
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
                style={inputStyle()}
                placeholder="e.g. React"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Category</label>
                <input
                  aria-label={`Skill ${index + 1} category`}
                  value={item.category ?? ''}
                  onChange={(e) => update({ category: e.target.value || null })}
                  style={inputStyle()}
                />
              </div>
              {entityType === 'individual' ? (
                <div style={{ flex: 1 }}>
                  <label style={miniLabel}>Level</label>
                  <select
                    aria-label={`Skill ${index + 1} proficiency`}
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
              ) : null}
            </div>
            <div>
              <label style={miniLabel}>Description</label>
              <textarea
                aria-label={`${entityType === 'product' ? 'Feature' : 'Capability'} ${index + 1} description`}
                value={item.description ?? ''}
                onChange={(e) => update({ description: e.target.value || null })}
                style={textareaStyle()}
                rows={2}
              />
            </div>
          </>
        )}
      />
      <EditActions onCancel={done} saving={saving} />
    </form>
  );
}
