import { Brand } from '@shared-components/ui';
import { COLORS, FONT, MOTION, RADIUS } from '../styles';

export interface NavItem {
  id: string;
  label: string;
  needsAttention?: boolean;
}

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

/** Typography, state, and order do the navigation work without asking every
 * future schema section to invent and maintain a pictogram. */
export function DashboardNav({ items, activeId, onSelect, account }: DashboardNavProps) {
  const initial = (account.name || account.handle || '?').charAt(0).toUpperCase();

  return (
    <aside className="pv-sidebar">
      <div
        className="pv-sidebar-brand"
        style={{ alignItems: 'center', padding: '0.35rem 0.55rem 0.8rem', marginBottom: '0.35rem', borderBottom: `1px solid ${COLORS.borderSubtle}` }}
      >
        <Brand />
      </div>

      <nav aria-label="Profile sections" style={{ display: 'contents' }}>
        {items.map((item, index) => {
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
                minHeight: '2.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: RADIUS.pill,
                border: `1px solid ${active ? COLORS.accent : 'transparent'}`,
                background: active ? COLORS.accent : 'transparent',
                color: active ? COLORS.onAccent : COLORS.textMuted,
                fontSize: '0.85rem',
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: `background ${MOTION.fast}, color ${MOTION.fast}, border-color ${MOTION.fast}`,
              }}
            >
              <span aria-hidden="true" style={{ color: active ? COLORS.onAccent : COLORS.textMuted, fontFamily: FONT.mono, fontSize: '0.65rem', letterSpacing: '0.08em' }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              {item.label}
              {item.needsAttention ? (
                <span
                  aria-label="needs attention"
                  style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: active ? COLORS.onAccent : COLORS.accent, flexShrink: 0, marginLeft: 'auto' }}
                />
              ) : null}
            </button>
          );
        })}
      </nav>

      <a
        href={account.url}
        target="_blank"
        rel="noopener noreferrer"
        className="pv-sidebar-foot pv-focusable"
        style={{ alignItems: 'center', gap: '0.55rem', marginTop: '0.6rem', paddingTop: '0.7rem', borderTop: `1px solid ${COLORS.borderSubtle}`, textDecoration: 'none' }}
      >
        <span
          aria-hidden="true"
          style={{ width: '1.9rem', height: '1.9rem', flexShrink: 0, borderRadius: '50%', background: COLORS.accentSubtle, border: `1px solid ${COLORS.borderSubtle}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: COLORS.accent, fontWeight: 700, fontSize: '0.85rem' }}
        >
          {account.image ? <img src={account.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
        </span>
        <span style={{ minWidth: 0, lineHeight: 1.25 }}>
          <span style={{ display: 'block', color: COLORS.textPrimary, fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{account.name || 'Your profile'}</span>
          <span style={{ display: 'block', color: COLORS.textMuted, fontSize: '0.7rem', fontFamily: FONT.mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{account.handle}</span>
        </span>
      </a>
    </aside>
  );
}
