import { useState, useMemo } from 'react';
import type { TimelineEntryDto, TimelineCategory } from '@typings/profileApi';
import { TimelineCategory as Category } from '@typings/profileApi';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { StepActions } from '../components/StepActions';
import { StepHeader } from '../components/StepHeader';
import { COLORS, labelStyle, inputStyle, textareaStyle, selectStyle, noticeStyle } from '../styles';

interface JourneyStepProps {
  initial: TimelineEntryDto[];
  suggested: TimelineEntryDto[];
  onContinue: (timeline: TimelineEntryDto[]) => void;
  onSkip: () => void;
  onFinishNow: () => void;
  busy: boolean;
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

const miniLabel = { ...labelStyle, fontSize: '0.72rem', marginBottom: '0.3rem' };

const isBlank = (t: TimelineEntryDto) =>
  !t.label.trim() && !t.date.trim() && !t.organization?.trim() && !t.description?.trim();
const isComplete = (t: TimelineEntryDto) => !!t.label.trim() && !!t.date.trim();

export function JourneyStep({
  initial,
  suggested,
  onContinue,
  onSkip,
  onFinishNow,
  busy,
}: JourneyStepProps) {
  const [items, setItems] = useState<TimelineEntryDto[]>(() =>
    initial.length ? initial : suggested,
  );

  // A row with content but no date/title used to be dropped on Continue without
  // a word — the user's typing simply disappeared. Now it blocks and says which
  // row needs what.
  const incomplete = useMemo(
    () =>
      items
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => !isBlank(t) && !isComplete(t)),
    [items],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (incomplete.length > 0) return;
    onContinue(items.filter(isComplete));
  };

  return (
    <form onSubmit={handleSubmit}>
      <StepHeader
        title="Your journey"
        subtitle="Roles, education and milestones — the timeline your agent can walk a visitor through."
      />

      {suggested.length > 0 && initial.length === 0 && (
        <p style={{ ...noticeStyle('info'), marginBottom: '1rem' }}>
          <span>
            Drafted from your resume. Check the dates and titles — remove anything that isn't right.
          </span>
        </p>
      )}

      <RepeatableList
        items={items}
        onChange={setItems}
        makeEmpty={makeEmpty}
        addLabel="Add an entry"
        itemNoun="entry"
        emptyHint="Nothing here yet. Add a role, a degree, or a moment that mattered."
        renderItem={(item, update, index) => {
          const flawed = !isBlank(item) && !isComplete(item);
          return (
            <>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 9rem', minWidth: 0 }}>
                  <label style={miniLabel} htmlFor={`pv-tl-cat-${index}`}>
                    Type
                  </label>
                  <select
                    id={`pv-tl-cat-${index}`}
                    className="pv-field"
                    value={item.category}
                    onChange={(e) => update({ category: e.target.value as TimelineCategory })}
                    style={selectStyle()}
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '1 1 9rem', minWidth: 0 }}>
                  <label style={miniLabel} htmlFor={`pv-tl-org-${index}`}>
                    Organization
                  </label>
                  <input
                    id={`pv-tl-org-${index}`}
                    className="pv-field"
                    type="text"
                    value={item.organization ?? ''}
                    onChange={(e) => update({ organization: e.target.value || null })}
                    style={inputStyle()}
                    placeholder="Google"
                  />
                </div>
              </div>

              <div>
                <label style={miniLabel} htmlFor={`pv-tl-label-${index}`}>
                  Title
                </label>
                <input
                  id={`pv-tl-label-${index}`}
                  className="pv-field"
                  type="text"
                  value={item.label}
                  onChange={(e) => update({ label: e.target.value })}
                  style={inputStyle(flawed && !item.label.trim() ? 'error' : 'default')}
                  placeholder="Senior Engineer"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 8rem', minWidth: 0 }}>
                  <label style={miniLabel} htmlFor={`pv-tl-start-${index}`}>
                    Start
                  </label>
                  <input
                    id={`pv-tl-start-${index}`}
                    className="pv-field"
                    type="month"
                    value={item.date}
                    onChange={(e) => update({ date: e.target.value })}
                    style={inputStyle(flawed && !item.date.trim() ? 'error' : 'default')}
                  />
                </div>
                <div style={{ flex: '1 1 8rem', minWidth: 0 }}>
                  <label style={miniLabel} htmlFor={`pv-tl-end-${index}`}>
                    End
                  </label>
                  <input
                    id={`pv-tl-end-${index}`}
                    className="pv-field"
                    type="month"
                    value={item.endDate ?? ''}
                    onChange={(e) => update({ endDate: e.target.value || null })}
                    style={inputStyle()}
                  />
                  <p style={{ color: COLORS.textMuted, fontSize: '0.7rem', margin: '0.25rem 0 0' }}>
                    Leave blank if current
                  </p>
                </div>
              </div>

              <div>
                <label style={miniLabel} htmlFor={`pv-tl-desc-${index}`}>
                  Description
                </label>
                <textarea
                  id={`pv-tl-desc-${index}`}
                  className="pv-field"
                  value={item.description ?? ''}
                  onChange={(e) => update({ description: e.target.value || null })}
                  style={{ ...textareaStyle(), minHeight: '3.5rem' }}
                  rows={2}
                  placeholder="What you did or achieved…"
                />
              </div>
            </>
          );
        }}
      />

      {incomplete.length > 0 && (
        <p style={{ ...noticeStyle('error'), marginTop: '0.85rem' }}>
          <span>
            {incomplete.length === 1
              ? `Entry ${incomplete[0].i + 1} needs a title and a start date.`
              : `${incomplete.length} entries need a title and a start date.`}{' '}
            Fill them in or remove them — we won't drop them quietly.
          </span>
        </p>
      )}

      <StepActions
        continueLabel="Continue"
        onSkip={onSkip}
        onFinishNow={onFinishNow}
        busy={busy}
        disabled={incomplete.length > 0}
      />
    </form>
  );
}
