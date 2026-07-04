import { useState } from 'react';
import type { WorkEntryDto, WorkType } from '@typings/profileApi';
import { WorkType as Work } from '@typings/profileApi';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { StepActions } from '../components/StepActions';
import { csvToArray, arrayToCsv } from '@app/lib/formHelpers';
import {
  titleStyle,
  subtitleStyle,
  labelStyle,
  inputStyle,
  textareaStyle,
  selectStyle,
  COLORS,
} from '../styles';

interface ProjectsStepProps {
  initial: WorkEntryDto[];
  onContinue: (works: WorkEntryDto[]) => void;
  onBack: () => void;
}

const makeEmpty = (): WorkEntryDto => ({
  type: Work.Project,
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
});

const TYPE_OPTIONS: { value: WorkType; label: string }[] = [
  { value: Work.Project, label: 'Project' },
  { value: Work.Product, label: 'Product' },
  { value: Work.CaseStudy, label: 'Case study' },
  { value: Work.Artwork, label: 'Artwork' },
  { value: Work.Research, label: 'Research' },
  { value: Work.Other, label: 'Other' },
];

const miniLabel = { ...labelStyle, fontSize: '0.68rem', marginBottom: '0.25rem' };

export function ProjectsStep({ initial, onContinue, onBack }: ProjectsStepProps) {
  const [items, setItems] = useState<WorkEntryDto[]>(initial);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onContinue(items.filter((w) => w.name.trim().length > 0));
      }}
    >
      <h1 style={titleStyle}>Show your work</h1>
      <p style={subtitleStyle}>
        Projects, products, and case studies your agent can walk visitors
        through.
      </p>

      <RepeatableList
        items={items}
        onChange={setItems}
        makeEmpty={makeEmpty}
        addLabel="Add a project"
        emptyHint="No projects yet."
        renderItem={(item, update) => (
          <>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Type</label>
                <select
                  value={item.type}
                  onChange={(e) => update({ type: e.target.value as WorkType })}
                  style={selectStyle()}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1.4 }}>
                <label style={miniLabel}>Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => update({ name: e.target.value })}
                  style={inputStyle(false)}
                  placeholder="e.g. Portvilla"
                />
              </div>
            </div>

            <div>
              <label style={miniLabel}>Tagline</label>
              <input
                type="text"
                value={item.tagline ?? ''}
                onChange={(e) => update({ tagline: e.target.value || null })}
                style={inputStyle(false)}
                placeholder="One line about it"
              />
            </div>

            <div>
              <label style={miniLabel}>Description</label>
              <textarea
                value={item.description}
                onChange={(e) => update({ description: e.target.value })}
                style={textareaStyle(false)}
                rows={2}
                placeholder="What it does and your role…"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Link</label>
                <input
                  type="url"
                  value={item.url ?? ''}
                  onChange={(e) => update({ url: e.target.value || null })}
                  style={inputStyle(false)}
                  placeholder="https://…"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Tech (comma-separated)</label>
                <input
                  type="text"
                  value={arrayToCsv(item.technologies)}
                  onChange={(e) => update({ technologies: csvToArray(e.target.value) })}
                  style={inputStyle(false)}
                  placeholder="React, Node, Mongo"
                />
              </div>
            </div>
          </>
        )}
      />

      <p style={{ color: COLORS.mutedText, fontSize: '0.68rem', marginTop: '0.75rem' }}>
        Projects without a name are ignored on save.
      </p>

      <StepActions onSkip={() => onContinue([])} onBack={onBack} />
    </form>
  );
}
