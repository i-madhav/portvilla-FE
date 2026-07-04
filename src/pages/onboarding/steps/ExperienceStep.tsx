import { useState } from 'react';
import type { TimelineEntryDto, TimelineCategory } from '@typings/profileApi';
import { TimelineCategory as Category } from '@typings/profileApi';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { StepActions } from '../components/StepActions';
import {
  titleStyle,
  subtitleStyle,
  labelStyle,
  inputStyle,
  textareaStyle,
  selectStyle,
  COLORS,
} from '../styles';

interface ExperienceStepProps {
  initial: TimelineEntryDto[];
  onContinue: (timeline: TimelineEntryDto[]) => void;
  onBack: () => void;
}

const makeEmpty = (): TimelineEntryDto => ({
  category: Category.Career,
  date: '',
  endDate: null,
  label: '',
  organization: null,
  organizationLogoUrl: null,
  description: null,
  highlight: false,
  url: null,
});

const CATEGORY_OPTIONS: { value: TimelineCategory; label: string }[] = [
  { value: Category.Career, label: 'Career / Job' },
  { value: Category.Education, label: 'Education' },
  { value: Category.Certification, label: 'Certification' },
  { value: Category.Award, label: 'Award' },
  { value: Category.Milestone, label: 'Milestone' },
  { value: Category.ProductLaunch, label: 'Product launch' },
  { value: Category.Other, label: 'Other' },
];

const miniLabel = { ...labelStyle, fontSize: '0.68rem', marginBottom: '0.25rem' };

export function ExperienceStep({ initial, onContinue, onBack }: ExperienceStepProps) {
  const [items, setItems] = useState<TimelineEntryDto[]>(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // date + label are required by the API; drop incomplete rows.
        onContinue(items.filter((t) => t.label.trim() && t.date.trim()));
      }}
    >
      <h1 style={titleStyle}>Your journey</h1>
      <p style={subtitleStyle}>
        Roles, education, and milestones. This gives your agent a timeline to
        reference.
      </p>

      <RepeatableList
        items={items}
        onChange={setItems}
        makeEmpty={makeEmpty}
        addLabel="Add an entry"
        emptyHint="No timeline entries yet."
        renderItem={(item, update) => (
          <>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Type</label>
                <select
                  value={item.category}
                  onChange={(e) => update({ category: e.target.value as TimelineCategory })}
                  style={selectStyle()}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Organization</label>
                <input
                  type="text"
                  value={item.organization ?? ''}
                  onChange={(e) => update({ organization: e.target.value || null })}
                  style={inputStyle(false)}
                  placeholder="e.g. Google"
                />
              </div>
            </div>

            <div>
              <label style={miniLabel}>Title / Label</label>
              <input
                type="text"
                value={item.label}
                onChange={(e) => update({ label: e.target.value })}
                style={inputStyle(false)}
                placeholder="e.g. Senior Engineer · B.Sc. Computer Science"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Start</label>
                <input
                  type="month"
                  value={item.date}
                  onChange={(e) => update({ date: e.target.value })}
                  style={inputStyle(false)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>End (blank = present)</label>
                <input
                  type="month"
                  value={item.endDate ?? ''}
                  onChange={(e) => update({ endDate: e.target.value || null })}
                  style={inputStyle(false)}
                />
              </div>
            </div>

            <div>
              <label style={miniLabel}>Description</label>
              <textarea
                value={item.description ?? ''}
                onChange={(e) => update({ description: e.target.value || null })}
                style={textareaStyle(false)}
                rows={2}
                placeholder="What you did or achieved…"
              />
            </div>
          </>
        )}
      />

      <p style={{ color: COLORS.mutedText, fontSize: '0.68rem', marginTop: '0.75rem' }}>
        Entries need a title and a start date to be saved.
      </p>

      <StepActions onSkip={() => onContinue([])} onBack={onBack} />
    </form>
  );
}
