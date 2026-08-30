import { useState } from 'react';
import { Button } from '@shared-components/ui';
import type { Completeness } from '../hooks/useProfileCompleteness';
import { COLORS, RADIUS, MOTION, FONT } from '../styles';

interface CompletenessCardProps {
  completeness: Completeness;
  onJump: (target: string) => void;
}

/**
 * Progress plus one concrete next action.
 *
 * The old dashboard never told the owner what was missing — seven identical
 * cards, no hierarchy, nothing to come back for. A meter alone would just be
 * decoration, so the card leads with the single highest-value gap and makes it
 * one click away.
 */
export function CompletenessCard({ completeness, onJump }: CompletenessCardProps) {
  const [open, setOpen] = useState(false);
  const { percent, items, done, total, next } = completeness;
  const complete = next === null;

  return (
    <section
      className="pv-card"
      style={{
        background: COLORS.surface,
        border: `1px solid ${complete ? COLORS.borderSubtle : COLORS.accent}`,
        borderRadius: RADIUS.card,
        padding: '1.35rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Ring percent={percent} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ color: COLORS.textPrimary, fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>
            {complete ? 'Your agent has the essentials' : 'Agent readiness'}
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: '0.78rem', margin: '0.2rem 0 0' }}>
            {done} of {total} done
          </p>
        </div>
      </div>

      {next && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.85rem',
            background: COLORS.accentSubtle,
            borderRadius: RADIUS.md,
          }}
        >
          <p style={{ color: COLORS.textPrimary, fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>
            {next.label}
          </p>
          <p style={{ color: COLORS.textSecondary, fontSize: '0.78rem', margin: '0.25rem 0 0.75rem', lineHeight: 1.45 }}>
            {next.rationale}
          </p>
          <Button type="button" size="compact" onClick={() => onJump(next.target)}>Open this section</Button>
        </div>
      )}

      <Button type="button" variant="ghost" size="compact" className="mt-2" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {open ? 'Hide checklist' : 'Show checklist'}
      </Button>

      {open && (
        <ul style={{ listStyle: 'none', margin: '0.75rem 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="pv-focusable"
                onClick={() => onJump(item.target)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: item.done ? COLORS.textMuted : COLORS.textSecondary,
                  fontSize: '0.8rem',
                }}
              >
                <span aria-hidden="true" style={{ color: item.done ? COLORS.success : COLORS.textMuted, fontFamily: FONT.mono, fontSize: '0.65rem', width: '2.4rem', flexShrink: 0 }}>
                  {item.done ? 'done' : 'todo'}
                </span>
                <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Ring({ percent }: { percent: number }) {
  const size = 52;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.surfaceRaised} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={percent === 100 ? COLORS.success : COLORS.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: `stroke-dashoffset ${MOTION.slow} ${MOTION.ease}` }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.textPrimary,
          fontSize: '0.78rem',
          fontWeight: 700,
        }}
      >
        {percent}%
      </span>
    </div>
  );
}
