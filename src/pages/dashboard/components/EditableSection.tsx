import { useState, type ReactNode } from 'react';
import {
  cardStyle,
  sectionTitleStyle,
  sectionDescStyle,
  smallButtonStyle,
} from '../styles';

interface EditableSectionProps {
  title: string;
  description?: string;
  /** Read-only content. */
  view: ReactNode;
  /** Edit form; must call `done()` when finished (save or cancel). */
  edit: (ctx: { done: () => void }) => ReactNode;
  /** Hide the Edit button (e.g. read-only sections). */
  readOnly?: boolean;
}

/**
 * A dashboard section card that toggles between a read-only view and an inline
 * edit form. The edit form owns its own Save/Cancel (it holds the field state)
 * and closes the card via the injected `done` callback.
 */
export function EditableSection({
  title,
  description,
  view,
  edit,
  readOnly = false,
}: EditableSectionProps) {
  const [editing, setEditing] = useState(false);

  return (
    <section style={cardStyle}>
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h2 style={sectionTitleStyle}>{title}</h2>
          {description && <p style={sectionDescStyle}>{description}</p>}
        </div>
        {!editing && !readOnly && (
          <button type="button" style={smallButtonStyle('ghost')} onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
      </header>

      {editing ? edit({ done: () => setEditing(false) }) : view}
    </section>
  );
}
