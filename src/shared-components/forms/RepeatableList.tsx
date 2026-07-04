import type { ReactNode } from 'react';
import { COLORS } from '@pages/onboarding/styles';

interface RepeatableListProps<T> {
  items: T[];
  onChange: (next: T[]) => void;
  /** Factory for a new, empty entry (with all required DTO fields defaulted). */
  makeEmpty: () => T;
  addLabel: string;
  emptyHint?: string;
  /** Render the editable fields for one entry; call `update` with a partial patch. */
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
}

/**
 * Generic add / remove list editor used across onboarding array-steps and the
 * dashboard. Each entry is a card with a remove button; an "add" button appends
 * a fresh entry from `makeEmpty`.
 */
export function RepeatableList<T>({
  items,
  onChange,
  makeEmpty,
  addLabel,
  emptyHint,
  renderItem,
}: RepeatableListProps<T>) {
  const updateAt = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, makeEmpty()]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.length === 0 && emptyHint && (
        <p style={{ color: COLORS.mutedText, fontSize: '0.75rem', margin: 0 }}>{emptyHint}</p>
      )}

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            position: 'relative',
            padding: '0.875rem 2rem 0.875rem 0.875rem',
            borderRadius: '0.5rem',
            background: COLORS.inputBg,
            border: `1px solid ${COLORS.inputBorder}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
          }}
        >
          <button
            type="button"
            onClick={() => removeAt(i)}
            aria-label="Remove entry"
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: COLORS.mutedText,
              cursor: 'pointer',
              fontSize: '1.1rem',
              lineHeight: 1,
              padding: '0 0.25rem',
            }}
          >
            ×
          </button>
          {renderItem(item, (patch) => updateAt(i, patch), i)}
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        style={{
          background: 'transparent',
          border: `1px dashed ${COLORS.inputBorder}`,
          color: COLORS.primaryText,
          borderRadius: '0.5rem',
          padding: '0.625rem',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 600,
          transition: 'border-color 0.15s',
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}
