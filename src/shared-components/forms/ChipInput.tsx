import { useState, useRef, useCallback } from 'react';
import { COLORS, RADIUS, MOTION, inputStyle } from '@shared-components/theme';

interface ChipInputProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  /** Offered as one-tap additions; already-chosen values are filtered out. */
  suggestions?: string[];
  maxLength?: number;
  ariaLabel: string;
}

/**
 * Tag-style entry: type, press Enter (or comma), get a chip.
 *
 * Skills used to be a repeating form of name + category + level, so eight skills
 * cost twenty-four fields — the single most tedious stretch of onboarding, for
 * data that is mostly one word per row.
 */
export function ChipInput({
  values,
  onChange,
  placeholder,
  suggestions = [],
  maxLength = 40,
  ariaLabel,
}: ChipInputProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const add = useCallback(
    (raw: string) => {
      const value = raw.trim().replace(/,$/, '').trim();
      if (!value) return;
      // Case-insensitive dedupe: "React" and "react" are the same skill, and a
      // profile listing both looks careless.
      const exists = values.some((v) => v.toLowerCase() === value.toLowerCase());
      if (exists) {
        setDraft('');
        return;
      }
      onChange([...values, value.slice(0, maxLength)]);
      setDraft('');
    },
    [values, onChange, maxLength],
  );

  const removeAt = useCallback(
    (i: number) => onChange(values.filter((_, idx) => idx !== i)),
    [values, onChange],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        // Enter would otherwise submit the step form with an unadded chip still
        // sitting in the field — the user's last entry would vanish.
        e.preventDefault();
        add(draft);
        return;
      }
      if (e.key === 'Backspace' && draft === '' && values.length > 0) {
        removeAt(values.length - 1);
      }
    },
    [draft, add, values.length, removeAt],
  );

  const open = suggestions.filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          ...inputStyle('default'),
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          alignItems: 'center',
          minHeight: '2.75rem',
          height: 'auto',
          cursor: 'text',
          padding: '0.45rem 0.5rem',
        }}
      >
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.25rem 0.3rem 0.25rem 0.55rem',
              borderRadius: RADIUS.sm,
              background: COLORS.accentSubtle,
              color: COLORS.accent,
              fontSize: '0.82rem',
              fontWeight: 500,
              lineHeight: 1.3,
            }}
          >
            {v}
            <button
              type="button"
              className="pv-focusable"
              aria-label={`Remove ${v}`}
              onClick={(e) => {
                e.stopPropagation();
                removeAt(i);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.75rem',
                height: '2.75rem',
                margin: '-0.75rem -0.7rem -0.75rem 0',
                borderRadius: RADIUS.sm,
                border: 'none',
                background: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
                opacity: 0.75,
                padding: 0,
              }}
            >
              <span aria-hidden="true">×</span>
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          className="pv-field"
          aria-label={ariaLabel}
          value={draft}
          maxLength={maxLength}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          // Without this, clicking Continue with text still in the field would
          // discard it — the classic "my last tag disappeared" bug.
          onBlur={() => add(draft)}
          placeholder={values.length === 0 ? placeholder : ''}
          style={{
            flex: '1 1 8rem',
            minWidth: '8rem',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            color: COLORS.textPrimary,
            fontSize: '1rem',
            padding: '0.25rem',
          }}
        />
      </div>

      {open.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.6rem' }}>
          {open.slice(0, 10).map((s) => (
            <button
              key={s}
              type="button"
              className="pv-focusable"
              onClick={() => add(s)}
              style={{
                padding: '0.28rem 0.6rem',
                borderRadius: RADIUS.pill,
                background: 'transparent',
                border: `1px dashed ${COLORS.border}`,
                color: COLORS.textMuted,
                fontSize: '0.78rem',
                minHeight: '2.75rem',
                cursor: 'pointer',
                transition: `color ${MOTION.fast}, border-color ${MOTION.fast}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.accent;
                e.currentTarget.style.borderColor = COLORS.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = COLORS.textMuted;
                e.currentTarget.style.borderColor = COLORS.border;
              }}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
