import { useState } from 'react';
import type { TimelineEntryDto, TimelineCategory } from '@typings/profileApi';
import { TimelineCategory as Category } from '@typings/profileApi';
import { labelStyle, inputStyle, textareaStyle, selectStyle } from '@pages/onboarding/styles';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { EditableSection } from '../components/EditableSection';
import { EditActions } from '../components/EditActions';
import { EmptyText } from '../components/display';
import { COLORS } from '../styles';
import type { SectionProps } from './types';

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
const range = (t: TimelineEntryDto) => `${t.date}${t.endDate ? ` – ${t.endDate}` : ' – present'}`;

export function TimelineSection({ profile, save }: SectionProps) {
  const timeline = profile.timeline;

  return (
    <EditableSection
      title="Experience & Education"
      description="Roles, schooling, and milestones."
      view={
        timeline.length === 0 ? (
          <EmptyText>No timeline entries yet.</EmptyText>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {timeline.map((t, i) => (
              <div key={i} style={{ borderLeft: `2px solid ${COLORS.inputBorder}`, paddingLeft: '0.75rem' }}>
                <div style={{ color: COLORS.primaryText, fontSize: '0.85rem', fontWeight: 600 }}>{t.label}</div>
                <div style={{ color: COLORS.mutedText, fontSize: '0.72rem' }}>
                  {[t.organization, range(t)].filter(Boolean).join(' · ')}
                </div>
                {t.description && (
                  <div style={{ color: COLORS.secondaryText, fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    {t.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
      edit={({ done }) => <TimelineEdit initial={timeline} save={save} done={done} />}
    />
  );
}

function TimelineEdit({
  initial,
  save,
  done,
}: {
  initial: TimelineEntryDto[];
  save: SectionProps['save'];
  done: () => void;
}) {
  const [items, setItems] = useState<TimelineEntryDto[]>(initial);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await save({ timeline: items.filter((t) => t.label.trim() && t.date.trim()) });
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
        addLabel="Add an entry"
        emptyHint="No entries yet."
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
                  value={item.organization ?? ''}
                  onChange={(e) => update({ organization: e.target.value || null })}
                  style={inputStyle(false)}
                />
              </div>
            </div>
            <div>
              <label style={miniLabel}>Title / Label</label>
              <input value={item.label} onChange={(e) => update({ label: e.target.value })} style={inputStyle(false)} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Start</label>
                <input type="month" value={item.date} onChange={(e) => update({ date: e.target.value })} style={inputStyle(false)} />
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
              />
            </div>
          </>
        )}
      />
      <EditActions onCancel={done} saving={saving} />
    </form>
  );
}
