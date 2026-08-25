import { Brand } from '@shared-components/ui';
import { COLORS, MOTION } from '../styles';

export type DashboardView = 'overview' | 'knowledge' | 'configuration';

export interface NavItem {
  id: DashboardView;
  label: string;
  description: string;
  icon: 'analytics' | 'knowledge' | 'settings';
  needsAttention?: boolean;
}

export interface NavAccount {
  name: string;
  handle: string;
  image?: string | null;
  url: string;
  isLive: boolean;
}

interface DashboardNavProps {
  items: NavItem[];
  activeId: DashboardView;
  onSelect: (id: DashboardView) => void;
  onLogout: () => void;
  account: NavAccount;
}

/** Persistent workspace navigation. On small screens CSS turns this into a
 * horizontally scrollable tab bar while preserving 44px touch targets. */
export function DashboardNav({ items, activeId, onSelect, onLogout, account }: DashboardNavProps) {
  const initial = (account.name || account.handle || '?').charAt(0).toUpperCase();

  return (
    <aside className="pv-sidebar" aria-label="Dashboard">
      <div className="pv-sidebar-brand">
        <Brand />
        <span className="pv-sidebar-product-label">Studio</span>
      </div>

      <nav aria-label="Dashboard sections" className="pv-sidebar-nav">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              className="pv-dashboard-nav-item pv-focusable"
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect(item.id)}
              style={{
                borderColor: active ? COLORS.border : 'transparent',
                background: active ? COLORS.surfaceRaised : 'transparent',
                color: active ? COLORS.textPrimary : COLORS.textSecondary,
                boxShadow: active ? '0 8px 22px rgba(20,19,26,.055)' : 'none',
                transition: `background ${MOTION.fast}, color ${MOTION.fast}, border-color ${MOTION.fast}`,
              }}
            >
              <span
                aria-hidden="true"
                className="pv-dashboard-nav-icon"
                style={{
                  background: active ? COLORS.textPrimary : COLORS.surfaceRaised,
                  color: active ? COLORS.canvas : COLORS.textMuted,
                  borderColor: active ? COLORS.textPrimary : COLORS.borderSubtle,
                }}
              >
                <NavIcon name={item.icon} />
              </span>
              <span className="pv-dashboard-nav-copy">
                <span className="pv-dashboard-nav-label">{item.label}</span>
                <span className="pv-dashboard-nav-description">{item.description}</span>
              </span>
              {item.needsAttention ? (
                <span className="pv-nav-attention" aria-label="Needs attention" title="Needs attention" />
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="pv-sidebar-spacer" />

      <div className="pv-sidebar-status" aria-label={account.isLive ? 'Agent is live' : 'Agent is private'}>
        <span className={account.isLive ? 'pv-status-dot pv-status-dot-live' : 'pv-status-dot'} />
        <span>{account.isLive ? 'Agent is live' : 'Agent is private'}</span>
      </div>

      <div className="pv-sidebar-account">
        <a
          href={account.url}
          target="_blank"
          rel="noopener noreferrer"
          className="pv-sidebar-profile pv-focusable"
          title="Open visitor view"
        >
          <span className="pv-sidebar-avatar" aria-hidden="true">
            {account.image ? <img src={account.image} alt="" /> : initial}
          </span>
          <span className="pv-sidebar-account-copy">
            <span className="pv-sidebar-account-name">{account.name || 'Your profile'}</span>
            <span className="pv-sidebar-account-handle">{account.handle}</span>
          </span>
          <span aria-hidden="true" className="pv-sidebar-open-icon">↗</span>
        </a>
        <button type="button" className="pv-sidebar-logout pv-focusable" onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}

function NavIcon({ name }: { name: NavItem['icon'] }) {
  if (name === 'analytics') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V10M10 19V5M16 19v-7M22 19V8" />
      </svg>
    );
  }
  if (name === 'knowledge') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.1.37.3.72.6 1 .29.25.68.4 1.1.4h.09v4h-.09A1.7 1.7 0 0 0 19.4 15z" />
    </svg>
  );
}
