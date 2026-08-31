import { useState, useMemo } from 'react';
import type { WorkEntryDto, WorkType } from '@typings/profileApi';
import { WorkType as WorkTypeEnum } from '@typings/profileApi';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { ChipInput } from '@shared-components/forms/ChipInput';
import { StepActions } from '../components/StepActions';
import { StepHeader } from '../components/StepHeader';
import { labelStyle, inputStyle, textareaStyle, selectStyle, noticeStyle } from '../styles';

interface WorkStepProps {
  initial: WorkEntryDto[];
  suggested: WorkEntryDto[];
  onContinue: (works: WorkEntryDto[]) => void;
  onSkip: () => void;
  onFinishNow: () => void;
  busy: boolean;
}

const makeEmpty = (): WorkEntryDto => ({
  type: WorkTypeEnum.Project,
  name: '',
  tagline: null,
  description: '',
  url: null,
  repoUrl: null,
  coverImage: null,
  screenshots: [],
  technologies: [],
  tags: [],
  status: 'completed',
  highlights: [],
  featured: false,
  codeSnippets: [],
  date: null,
  stages: [],
});

const TYPE_OPTIONS: { value: WorkType; label: string }[] = Object.values(WorkTypeEnum).map((v) => ({
  value: v,
  label: v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, ' '),
}));

const miniLabel = { ...labelStyle, fontSize: '0.72rem', marginBottom: '0.3rem' };

const isBlank = (w: WorkEntryDto) =>
  !w.name.trim() && !w.description.trim() && !w.tagline?.trim() && w.technologies.length === 0;
const isComplete = (w: WorkEntryDto) => !!w.name.trim();

export function WorkStep({
  initial,
  suggested,
  onContinue,
  onSkip,
  onFinishNow,
  busy,
}: WorkStepProps) {
  const [items, setItems] = useState<WorkEntryDto[]>(() => (initial.length ? initial : suggested));

  const incomplete = useMemo(
    () => items.map((w, i) => ({ w, i })).filter(({ w }) => !isBlank(w) && !isComplete(w)),
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
        title="What have you built?"
        subtitle="Projects, products, writing — the things you'd want someone to ask about."
      />

      {suggested.length > 0 && initial.length === 0 && (
        <p style={{ ...noticeStyle('info'), marginBottom: '1rem' }}>
          <span>Drafted from your resume. Edit the descriptions so they sound like you.</span>
        </p>
      )}

      <RepeatableList
        items={items}
        onChange={setItems}
        makeEmpty={makeEmpty}
        addLabel="Add a project"
        itemNoun="project"
        emptyHint="Nothing here yet. Even one strong project gives your agent a lot to work with."
        renderItem={(item, update, index) => {
          const flawed = !isBlank(item) && !isComplete(item);
          return (
            <>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 8rem', minWidth: 0 }}>
                  <label style={miniLabel} htmlFor={`pv-w-type-${index}`}>
                    Type
                  </label>
                  <select
                    id={`pv-w-type-${index}`}
                    className="pv-field"
                    value={item.type}
                    onChange={(e) => update({ type: e.target.value as WorkType })}
                    style={selectStyle()}
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '2 1 12rem', minWidth: 0 }}>
                  <label style={miniLabel} htmlFor={`pv-w-name-${index}`}>
                    Name
                  </label>
                  <input
                    id={`pv-w-name-${index}`}
                    className="pv-field"
                    type="text"
                    value={item.name}
                    onChange={(e) => update({ name: e.target.value })}
                    style={inputStyle(flawed ? 'error' : 'default')}
                    placeholder="Portvilla"
                  />
                </div>
              </div>

              <div>
                <label style={miniLabel} htmlFor={`pv-w-tagline-${index}`}>
                  One-liner
                </label>
                <input
                  id={`pv-w-tagline-${index}`}
                  className="pv-field"
                  type="text"
                  value={item.tagline ?? ''}
                  onChange={(e) => update({ tagline: e.target.value || null })}
                  style={inputStyle()}
                  placeholder="An AI agent for your portfolio"
                  maxLength={120}
                />
              </div>

              <div>
                <label style={miniLabel} htmlFor={`pv-w-desc-${index}`}>
                  Description
                </label>
                <textarea
                  id={`pv-w-desc-${index}`}
                  className="pv-field"
                  value={item.description}
                  onChange={(e) => update({ description: e.target.value })}
                  style={{ ...textareaStyle(), minHeight: '4rem' }}
                  rows={3}
                  placeholder="What it does, and what you did on it…"
                />
              </div>

              <div>
                <label style={miniLabel}>Built with</label>
                <ChipInput
                  ariaLabel={`Technologies for project ${index + 1}`}
                  values={item.technologies}
                  onChange={(technologies) => update({ technologies })}
                  placeholder="TypeScript, Postgres…"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 10rem', minWidth: 0 }}>
                  <label style={miniLabel} htmlFor={`pv-w-url-${index}`}>
                    Link
                  </label>
                  <input
                    id={`pv-w-url-${index}`}
                    className="pv-field"
                    type="url"
                    value={item.url ?? ''}
                    onChange={(e) => update({ url: e.target.value || null })}
                    style={inputStyle()}
                    placeholder="https://…"
                  />
                </div>
                <div style={{ flex: '1 1 10rem', minWidth: 0 }}>
                  <label style={miniLabel} htmlFor={`pv-w-repo-${index}`}>
                    Repo
                  </label>
                  <input
                    id={`pv-w-repo-${index}`}
                    className="pv-field"
                    type="url"
                    value={item.repoUrl ?? ''}
                    onChange={(e) => update({ repoUrl: e.target.value || null })}
                    style={inputStyle()}
                    placeholder="https://github.com/…"
                  />
                </div>
              </div>
            </>
          );
        }}
      />

      {incomplete.length > 0 && (
        <p style={{ ...noticeStyle('error'), marginTop: '0.85rem' }}>
          <span>
            {incomplete.length === 1
              ? `Project ${incomplete[0].i + 1} needs a name.`
              : `${incomplete.length} projects need a name.`}{' '}
            Add one or remove the entry.
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
