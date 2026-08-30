import { useCallback, useState, type ReactNode } from 'react';
import { Button } from '@shared-components/ui';
import { useDirtyReporter } from '../useDirtyReporter';
import {
  cardStyle,
  sectionTitleStyle,
  sectionDescStyle,
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
 *
 * Because the form owns its state, this card cannot inspect it to know whether
 * anything changed. Instead it watches for input events bubbling out of the
 * form — an open-but-untouched editor is not treated as unsaved work, so the
 * navigation guard only fires when the user would actually lose something.
 */
export function EditableSection({
  title,
  description,
  view,
  edit,
  readOnly = false,
}: EditableSectionProps) {
  const [editing, setEditing] = useState(false);
  const [touched, setTouched] = useState(false);

  useDirtyReporter(title, editing && touched);

  const done = useCallback(() => {
    setEditing(false);
    setTouched(false);
  }, []);

  return (
    <section className="pv-card" style={cardStyle}>
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
          <Button type="button" variant="secondary" size="compact" onClick={() => setEditing(true)}>Edit</Button>
        )}
      </header>

      {editing ? (
        <div onInput={() => setTouched(true)} onChange={() => setTouched(true)}>
          {edit({ done })}
        </div>
      ) : (
        view
      )}
    </section>
  );
}
