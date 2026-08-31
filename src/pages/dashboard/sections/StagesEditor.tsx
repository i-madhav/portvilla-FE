import { MAX_STAGES_PER_WORK, STAGE_SUMMARY_MAX_LENGTH } from '@typings/profileApi';
import type { StageEntryDto } from '@typings/profileApi';
import { COLORS, RADIUS, inputStyle, labelStyle, textareaStyle, selectStyle } from '@shared-components/theme';
import { RepeatableList } from '@shared-components/forms/RepeatableList';

const miniLabel = { ...labelStyle, fontSize: '0.68rem', marginBottom: '0.25rem' };

const STATUS_OPTIONS: { value: StageEntryDto['status']; label: string }[] = [
  { value: 'completed', label: 'Done' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const makeEmptyStage = (): StageEntryDto => ({
  label: '',
  status: 'completed',
  summary: '',
  detail: null,
  date: null,
  endDate: null,
  highlights: [],
});

/**
 * The arc of one work: how it started, what happened next, where it is now.
 *
 * **Order is the only ordering** — the agent walks stages in the order stored
 * here, one per turn, so the move controls are the feature rather than a
 * convenience. There is no rank field to disagree with the array.
 *
 * Stages are optional throughout. A work with none behaves exactly as before.
 */
export function StagesEditor({
  stages,
  onChange,
  workLabel,
}: {
  stages: StageEntryDto[];
  onChange: (next: StageEntryDto[]) => void;
  workLabel: string;
}) {
  const atLimit = stages.length >= MAX_STAGES_PER_WORK;

  return (
    <div
      style={{
        borderTop: `1px dashed ${COLORS.borderSubtle}`,
        paddingTop: '0.75rem',
        marginTop: '0.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
        <label style={miniLabel}>
          Story ({stages.length === 0 ? 'optional' : `${stages.length} part${stages.length === 1 ? '' : 's'}`})
        </label>
        {atLimit && (
          <span style={{ color: COLORS.textMuted, fontSize: '0.68rem' }}>
            Maximum {MAX_STAGES_PER_WORK} parts
          </span>
        )}
      </div>
      <p style={{ color: COLORS.textMuted, fontSize: '0.72rem', margin: '0 0 0.6rem', lineHeight: 1.5 }}>
        Your agent tells this one part per turn, pausing for the visitor between them. Leave it
        empty and it simply describes the work.
      </p>

      <RepeatableList
        items={stages}
        onChange={onChange}
        makeEmpty={makeEmptyStage}
        addLabel={stages.length === 0 ? 'Add the first part' : 'Add a part'}
        itemNoun="part"
        maxItems={MAX_STAGES_PER_WORK}
        reorderable
        renderItem={(stage, update, index) => (
          <>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1.4 }}>
                <label style={miniLabel}>Part {index + 1}</label>
                <input
                  aria-label={`${workLabel} part ${index + 1} label`}
                  value={stage.label}
                  onChange={(e) => update({ label: e.target.value })}
                  style={inputStyle()}
                  placeholder="Private beta"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Status</label>
                <select
                  aria-label={`${workLabel} part ${index + 1} status`}
                  value={stage.status}
                  onChange={(e) => update({ status: e.target.value as StageEntryDto['status'] })}
                  style={selectStyle()}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <SpokenSummary
              value={stage.summary}
              onChange={(summary) => update({ summary })}
              ariaLabel={`${workLabel} part ${index + 1} spoken line`}
            />

            <div>
              <label style={miniLabel}>If they ask for more</label>
              <textarea
                aria-label={`${workLabel} part ${index + 1} detail`}
                value={stage.detail ?? ''}
                onChange={(e) => update({ detail: e.target.value || null })}
                style={textareaStyle()}
                rows={2}
                placeholder="The fuller story — only said when a visitor asks to go deeper."
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>From</label>
                <input
                  aria-label={`${workLabel} part ${index + 1} start date`}
                  value={stage.date ?? ''}
                  onChange={(e) => update({ date: e.target.value || null })}
                  style={inputStyle()}
                  placeholder="2025-03"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>To</label>
                <input
                  aria-label={`${workLabel} part ${index + 1} end date`}
                  value={stage.endDate ?? ''}
                  onChange={(e) => update({ endDate: e.target.value || null })}
                  style={inputStyle()}
                  placeholder="2025-06 · blank for ongoing"
                />
              </div>
            </div>
          </>
        )}
      />
    </div>
  );
}

/**
 * The spoken line, with its length surfaced as breath rather than as characters.
 *
 * The API rejects anything past {@link STAGE_SUMMARY_MAX_LENGTH}, but a raw
 * "184/200" tells an author nothing about why the limit exists. This is the one
 * field in the dashboard that is *heard* rather than read, so the counter says
 * what it will sound like.
 */
function SpokenSummary({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
}) {
  const remaining = STAGE_SUMMARY_MAX_LENGTH - value.length;
  const over = remaining < 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem' }}>
        <label style={miniLabel}>Said out loud</label>
        <span
          style={{
            fontSize: '0.68rem',
            color: over ? COLORS.danger : COLORS.textMuted,
            fontWeight: over ? 700 : 400,
          }}
        >
          {over ? `${-remaining} too many to say` : `${remaining} left`}
        </span>
      </div>
      <textarea
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...textareaStyle(over ? 'error' : 'default'),
          borderRadius: RADIUS.sm,
        }}
        rows={2}
        placeholder="Fifty teams, invite only."
      />
      <p style={{ color: COLORS.textMuted, fontSize: '0.68rem', margin: '0.3rem 0 0', lineHeight: 1.45 }}>
        One breath — about {STAGE_SUMMARY_MAX_LENGTH} characters, roughly ten seconds of speech.
        Longer than that and the visitor is listening to a monologue.
      </p>
    </div>
  );
}
