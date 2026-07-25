import type { ReactNode } from 'react';
import { COLORS, RADIUS, MOTION, FONT } from '../styles';

export interface NavItem {
  id: string;
  label: string;
  /** Shown as a dot when the section still needs attention. */
  needsAttention?: boolean;
}

/** The account shown in the sidebar footer. */
export interface NavAccount {
  name: string;
  handle: string;
  image?: string | null;
  url: string;
}

interface DashboardNavProps {
  items: NavItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  account: NavAccount;
}

// Line icons in the codebase's house style: 24-unit viewBox, currentColor
// stroke, round joins. Keyed by section id so the page doesn't have to carry
// icon markup around.
const ICONS: Record<string, ReactNode> = {
  identity: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-3.87 3.58-7 8-7s8 3.13 8 7" />
    </>
  ),
  capabilities: (
    <>
      <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
  timeline: (
    <>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="6" cy="18" r="2.2" />
      <path d="M6 8.2v7.6" />
      <path d="M11 6h9" />
      <path d="M11 18h9" />
    </>
  ),
  works: (
    <>
      <rect x="3" y="4" width="7" height="7" rx="1.5" />
      <rect x="14" y="4" width="7" height="7" rx="1.5" />
      <rect x="3" y="15" width="7" height="5" rx="1.5" />
      <rect x="14" y="15" width="7" height="5" rx="1.5" />
    </>
  ),
  social: (
    <>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </>
  ),
  agent: (
    <>
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M12 3v4" />
      <circle cx="9" cy="13" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
};

/**
 * The dashboard's primary navigation. Previously seven cards scrolled as one
 * undifferentiated column and the only "nav" was a wrapping strip of text
 * labels — there was no sense of place. This is a proper panel: a brand mark, a
 * column of icon rows with an active indicator, and the owner's account at the
 * foot. A sticky vertical rail on desktop; a horizontal scroll strip on mobile
 * (see `.pv-sidebar` in index.css).
 */
export function DashboardNav({ items, activeId, onSelect, account }: DashboardNavProps) {
  const initial = (account.name || account.handle || '?').charAt(0).toUpperCase();

  return (
    <aside className="pv-sidebar">
      <div
        className="pv-sidebar-brand"
        style={{
          alignItems: 'center',
          gap: '0.55rem',
          padding: '0.35rem 0.55rem 0.7rem',
          marginBottom: '0.35rem',
          borderBottom: `1px solid ${COLORS.borderSubtle}`,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: '1.6rem',
            height: '1.6rem',
            borderRadius: RADIUS.md,
            background: COLORS.accent,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.onAccent,
            fontWeight: 800,
            fontSize: '0.9rem',
            flexShrink: 0,
          }}
        >
          P
        </span>
        <span style={{ color: COLORS.textPrimary, fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
          Portvilla
        </span>
      </div>

      <nav aria-label="Profile sections" style={{ display: 'contents' }}>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              className="pv-focusable"
              aria-current={active ? 'true' : undefined}
              onClick={() => onSelect(item.id)}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                flex: '0 0 auto',
                justifyContent: 'flex-start',
                whiteSpace: 'nowrap',
                padding: '0.55rem 0.7rem',
                borderRadius: RADIUS.md,
                border: 'none',
                background: active ? COLORS.accentSubtle : 'transparent',
                color: active ? COLORS.accent : COLORS.textMuted,
                fontSize: '0.85rem',
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: `background ${MOTION.fast}, color ${MOTION.fast}`,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = COLORS.textSecondary;
                  e.currentTarget.style.background = COLORS.surfaceRaised;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = COLORS.textMuted;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* Active indicator bar — desktop only reads as a rail edge; on the
                  horizontal mobile strip it simply sits at the row's left. */}
              {active && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '1.1rem',
                    borderRadius: RADIUS.pill,
                    background: COLORS.accent,
                  }}
                />
              )}
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                {ICONS[item.id]}
              </svg>
              {item.label}
              {item.needsAttention && (
                <span
                  aria-label="needs attention"
                  style={{
                    width: '0.4rem',
                    height: '0.4rem',
                    borderRadius: '50%',
                    background: COLORS.accent,
                    flexShrink: 0,
                    marginLeft: 'auto',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <a
        href={account.url}
        target="_blank"
        rel="noopener noreferrer"
        className="pv-sidebar-foot pv-focusable"
        style={{
          alignItems: 'center',
          gap: '0.55rem',
          marginTop: '0.6rem',
          paddingTop: '0.7rem',
          borderTop: `1px solid ${COLORS.borderSubtle}`,
          textDecoration: 'none',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: '1.9rem',
            height: '1.9rem',
            flexShrink: 0,
            borderRadius: '50%',
            background: COLORS.accentSubtle,
            border: `1px solid ${COLORS.borderSubtle}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            color: COLORS.accent,
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          {account.image ? (
            <img src={account.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initial
          )}
        </span>
        <span style={{ minWidth: 0, lineHeight: 1.25 }}>
          <span
            style={{
              display: 'block',
              color: COLORS.textPrimary,
              fontSize: '0.8rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {account.name || 'Your profile'}
          </span>
          <span
            style={{
              display: 'block',
              color: COLORS.textMuted,
              fontSize: '0.7rem',
              fontFamily: FONT.mono,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {account.handle}
          </span>
        </span>
      </a>
    </aside>
  );
}
