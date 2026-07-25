import type { ReactNode } from 'react';
import { COLORS, pillStyle, emptyTextStyle } from '../styles';

/** Label + value row for read-only views. Renders nothing when value is empty. */
export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div style={{ display: 'flex', gap: '0.75rem', padding: '0.2rem 0' }}>
      <span style={{ color: COLORS.textMuted, fontSize: '0.75rem', minWidth: '6.5rem', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ color: COLORS.textPrimary, fontSize: '0.8rem', wordBreak: 'break-word' }}>
        {value}
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
