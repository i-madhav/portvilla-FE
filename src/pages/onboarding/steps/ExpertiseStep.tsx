import { useState } from 'react';
import type { CapabilityEntryDto, CapabilityProficiency } from '@typings/profileApi';
import { CapabilityProficiency as Proficiency } from '@typings/profileApi';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { StepActions } from '../components/StepActions';
import {
  titleStyle,
  subtitleStyle,
  labelStyle,
  inputStyle,
  selectStyle,
  COLORS,
} from '../styles';

interface ExpertiseStepProps {
  initial: CapabilityEntryDto[];
  onContinue: (capabilities: CapabilityEntryDto[]) => void;
  onBack: () => void;
}

const makeEmpty = (): CapabilityEntryDto => ({
  name: '',
  description: null,
  icon: null,
  category: null,
  proficiency: null,
  yearsOfExperience: null,
});

const PROFICIENCY_OPTIONS: { value: CapabilityProficiency | ''; label: string }[] = [
  { value: '', label: 'Proficiency (optional)' },
  { value: Proficiency.Familiar, label: 'Familiar' },
  { value: Proficiency.Proficient, label: 'Proficient' },
  { value: Proficiency.Expert, label: 'Expert' },
];

const miniLabel = { ...labelStyle, fontSize: '0.68rem', marginBottom: '0.25rem' };

export function ExpertiseStep({ initial, onContinue, onBack }: ExpertiseStepProps) {
  const [items, setItems] = useState<CapabilityEntryDto[]>(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onContinue(items.filter((c) => c.name.trim().length > 0));
      }}
    >
      <h1 style={titleStyle}>What are you great at?</h1>
      <p style={subtitleStyle}>
        Skills and capabilities your agent can speak to. Add a few — you can
        expand this anytime.
      </p>

      <RepeatableList
        items={items}
        onChange={setItems}
        makeEmpty={makeEmpty}
        addLabel="Add a skill"
        emptyHint="No skills yet. Add your strongest ones."
        renderItem={(item, update) => (
          <>
            <div>
              <label style={miniLabel}>Skill</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => update({ name: e.target.value })}
                style={inputStyle(false)}
                placeholder="e.g. React, System Design, Brand Strategy"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Category</label>
                <input
                  type="text"
                  value={item.category ?? ''}
                  onChange={(e) => update({ category: e.target.value || null })}
                  style={inputStyle(false)}
                  placeholder="e.g. Frontend"
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

      <p style={{ color: COLORS.mutedText, fontSize: '0.68rem', marginTop: '0.75rem' }}>
        Empty skills are ignored on save.
      </p>

      <StepActions onSkip={() => onContinue([])} onBack={onBack} />
    </form>
  );
}
