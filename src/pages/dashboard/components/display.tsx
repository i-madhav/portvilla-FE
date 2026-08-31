import type { ReactNode } from 'react';
import { COLORS, FONT, pillStyle, emptyTextStyle } from '../styles';

/**
 * Label + value row for read-only views.
 *
 * An unset value renders an explicit placeholder rather than disappearing.
 * Hiding empty rows made a section look like it held fewer fields than it
 * does — an owner cannot fill in a field they have never been shown, and the
 * agent is only as complete as the roster the owner can see.
 */
export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  const empty = value === null || value === undefined || value === '';
  return (
    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.2rem 0' }}>
      <span style={{ color: COLORS.textMuted, fontSize: '0.75rem', minWidth: '6.5rem', flexShrink: 0 }}>
        {label}
      </span>
      <span
        style={{
          color: empty ? COLORS.textMuted : COLORS.textPrimary,
          fontSize: '0.8rem',
          // Word, not just colour: the empty state must survive a greyscale
          // screen and a screen reader alike.
          fontFamily: empty ? FONT.mono : undefined,
          wordBreak: 'break-word',
        }}
      >
        {empty ? 'Not set' : value}
      </span>
    </div>
  );
}

/** Row of pill chips. */
export function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
      {items.map((item, i) => (
        <span key={`${item}-${i}`} style={pillStyle}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function EmptyText({ children }: { children: ReactNode }) {
  return <p style={emptyTextStyle}>{children}</p>;
}
