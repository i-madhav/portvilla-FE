import { useState } from 'react';
import type { EntityType, WorkEntryDto, WorkType } from '@typings/profileApi';
import { WorkType as Work } from '@typings/profileApi';
import { labelStyle, inputStyle, textareaStyle, selectStyle } from '@shared-components/theme';
import { RepeatableList } from '@shared-components/forms/RepeatableList';
import { csvToArray, arrayToCsv } from '@app/lib/ui/formHelpers';
import { EditableSection } from '../components/EditableSection';
import { EditActions } from '../components/EditActions';
import { EmptyText, Chips } from '../components/display';
import { COLORS } from '../styles';
import type { SectionProps } from './types';

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

export function WorksSection({ profile, save }: SectionProps) {
  const works = profile.works;
  const entityType = profile.identity.entityType;
  const title = entityType === 'company' ? 'Products & case studies' : entityType === 'product' ? 'Stories & use cases' : entityType === 'organization' ? 'Work & initiatives' : 'Work & projects';

  return (
    <EditableSection
      title={title}
      description="Concrete examples your agent can use to support the story."
      view={
        works.length === 0 ? (
          <EmptyText>No work added yet.</EmptyText>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {works.map((w, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ color: COLORS.textPrimary, fontSize: '0.88rem', fontWeight: 600 }}>{w.name}</span>
                  {w.url && (
                    <a href={w.url} target="_blank" rel="noreferrer" style={{ color: COLORS.textSecondary, fontSize: '0.72rem' }}>
                      ↗ link
                    </a>
                  )}
                </div>
                {w.tagline && <div style={{ color: COLORS.textMuted, fontSize: '0.75rem' }}>{w.tagline}</div>}
                {w.description && (
                  <div style={{ color: COLORS.textSecondary, fontSize: '0.75rem', marginTop: '0.2rem' }}>{w.description}</div>
                )}
                {w.technologies.length > 0 && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <Chips items={w.technologies} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
      edit={({ done }) => <WorksEdit initial={works} entityType={entityType} save={save} done={done} />}
    />
  );
}

function WorksEdit({
  initial,
  entityType,
  save,
  done,
}: {
  initial: WorkEntryDto[];
  entityType: EntityType;
  save: SectionProps['save'];
  done: () => void;
}) {
  const [items, setItems] = useState<WorkEntryDto[]>(initial);
  const [saving, setSaving] = useState(false);
  const typeOptions = entityType === 'individual'
    ? TYPE_OPTIONS
    : TYPE_OPTIONS.filter((option) => {
        if (entityType === 'product') {
          return option.value === Work.Product
            || option.value === Work.CaseStudy
            || option.value === Work.Research
            || option.value === Work.Other;
        }
        if (entityType === 'company') return option.value !== Work.Artwork;
        return option.value !== Work.Product;
      });
  const defaultType = entityType === 'company' || entityType === 'product' ? Work.Product : Work.Project;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await save({ works: items.filter((w) => w.name.trim().length > 0) });
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
        makeEmpty={() => ({ ...makeEmpty(), type: defaultType })}
        addLabel={entityType === 'company' ? 'Add product or case study' : entityType === 'product' ? 'Add a use case' : 'Add work'}
        emptyHint="No work added yet."
        renderItem={(item, update, index) => (
          <>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Type</label>
                <select aria-label={`Work ${index + 1} type`} value={item.type} onChange={(e) => update({ type: e.target.value as WorkType })} style={selectStyle()}>
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1.4 }}>
                <label style={miniLabel}>Name</label>
                <input aria-label={`Work ${index + 1} name`} value={item.name} onChange={(e) => update({ name: e.target.value })} style={inputStyle()} />
              </div>
            </div>
            <div>
              <label style={miniLabel}>Tagline</label>
              <input
                aria-label={`Work ${index + 1} tagline`}
                value={item.tagline ?? ''}
                onChange={(e) => update({ tagline: e.target.value || null })}
                style={inputStyle()}
              />
            </div>
            <div>
              <label style={miniLabel}>Description</label>
              <textarea aria-label={`Work ${index + 1} description`} value={item.description} onChange={(e) => update({ description: e.target.value })} style={textareaStyle()} rows={2} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Link</label>
                <input aria-label={`Work ${index + 1} link`} value={item.url ?? ''} onChange={(e) => update({ url: e.target.value || null })} style={inputStyle()} placeholder="https://…" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={miniLabel}>Tech (comma-separated)</label>
                <input
                  aria-label={`Work ${index + 1} technologies`}
                  value={arrayToCsv(item.technologies)}
                  onChange={(e) => update({ technologies: csvToArray(e.target.value) })}
                  style={inputStyle()}
                />
              </div>
            </div>
          </>
        )}
      />
      <EditActions onCancel={done} saving={saving} />
    </form>
  );
}
