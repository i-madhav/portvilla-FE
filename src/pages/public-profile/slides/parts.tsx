import type { ReactNode } from 'react';
import { COLORS, FONT, RADIUS, pillStyle } from '@shared-components/theme';
import { eyebrowStyle, stackStyle } from './styles';

/**
 * Shared furniture for the slide renderers.
 *
 * Every slide is a card on the same grid with the same type scale, so the
 * agent can move between them without the page appearing to jump. Anything a
 * single template needs alone stays in that template's file.
 */

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p style={eyebrowStyle}>{children}</p>;
}

export function Pills({ items, tone = 'neutral' }: { items: string[]; tone?: 'neutral' | 'accent' }) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {items.map((item, i) => (
        <span key={`${item}-${i}`} style={pillStyle(tone)}>
          {item}
        </span>
      ))}
    </div>
  );
}

/** Bulleted highlights, rendered as a plain list so screen readers announce it as one. */
export function Highlights({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul style={{ ...stackStyle('0.4rem'), margin: 0, padding: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li
          key={`${item}-${i}`}
          style={{
            color: COLORS.textSecondary,
            fontSize: '0.86rem',
            lineHeight: 1.5,
            paddingLeft: '0.9rem',
            position: 'relative',
          }}
        >
          <span aria-hidden="true" style={{ position: 'absolute', left: 0, color: COLORS.accent }}>
            ·
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function DateRange({ date, endDate }: { date: string | null; endDate: string | null }) {
  if (!date && !endDate) return null;
  return (
    <span style={{ fontFamily: FONT.mono, fontSize: '0.72rem', color: COLORS.textMuted }}>
      {date ?? '—'}
      {endDate ? ` – ${endDate}` : date ? ' – now' : ''}
    </span>
  );
}

/** A framed image that degrades to nothing rather than to a broken-image icon. */
export function SlideImage({ src, alt, height }: { src: string; alt: string; height: string }) {
  return (
    <div
      style={{
        height,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        background: COLORS.accentSubtle,
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
