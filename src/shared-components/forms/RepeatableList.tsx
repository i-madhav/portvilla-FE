import type { ReactNode } from 'react';
import { COLORS, RADIUS, MOTION } from '@shared-components/theme';

interface RepeatableListProps<T> {
  items: T[];
  onChange: (next: T[]) => void;
  /** Factory for a new, empty entry (with all required DTO fields defaulted). */
  makeEmpty: () => T;
  addLabel: string;
  emptyHint?: string;
  /** Render the editable fields for one entry; call `update` with a partial patch. */
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  /** Label for each entry's remove button, e.g. "role" → "Remove role". */
  itemNoun?: string;
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
  itemNoun = 'entry',
}: RepeatableListProps<T>) {
  const updateAt = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, makeEmpty()]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.length === 0 && emptyHint && (
        <p style={{ color: COLORS.textMuted, fontSize: '0.8rem', margin: 0 }}>{emptyHint}</p>
      )}

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            position: 'relative',
            padding: '0.875rem 2.25rem 0.875rem 0.875rem',
            borderRadius: RADIUS.md,
            background: COLORS.surfaceRaised,
            border: `1px solid ${COLORS.borderSubtle}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem',
          }}
        >
          <button
            type="button"
            className="pv-focusable"
            onClick={() => removeAt(i)}
            aria-label={`Remove ${itemNoun} ${i + 1}`}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: RADIUS.sm,
              background: 'transparent',
              border: 'none',
              color: COLORS.textMuted,
              cursor: 'pointer',
              padding: 0,
              transition: `color ${MOTION.fast}, background ${MOTION.fast}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLORS.danger;
              e.currentTarget.style.background = COLORS.dangerSubtle;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLORS.textMuted;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          {renderItem(item, (patch) => updateAt(i, patch), i)}
        </div>
      ))}

      <button
        type="button"
        className="pv-focusable"
        onClick={add}
        style={{
          background: 'transparent',
          border: `1px dashed ${COLORS.border}`,
          color: COLORS.textSecondary,
          borderRadius: RADIUS.md,
          padding: '0.7rem',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
          transition: `border-color ${MOTION.fast}, color ${MOTION.fast}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = COLORS.accent;
          e.currentTarget.style.color = COLORS.accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = COLORS.border;
          e.currentTarget.style.color = COLORS.textSecondary;
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}
