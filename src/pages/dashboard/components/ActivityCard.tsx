import { useMemo } from 'react';
import { useSessionActivity } from '@api-hooks/session/useSessionActivity';
import { COLORS, RADIUS, FONT } from '../styles';

interface ActivityCardProps {
  enabled: boolean;
}

/**
 * Agent-conversation activity. The backend counts only real conversations
 * (ACTIVE/ENDED), so these figures never inflate from bots or double-clicks.
 *
 * Non-blocking: any failure or empty history renders an honest "no data yet"
 * state rather than taking over the dashboard — activity only exists from the
 * webhook's deploy date onward, and a bare 0 would read as "nobody used it".
 */
export function ActivityCard({ enabled }: ActivityCardProps) {
  const { data, isLoading, isError } = useSessionActivity(enabled);

  const maxDaily = useMemo(
    () => (data ? Math.max(1, ...data.daily.map((d) => d.count)) : 1),
    [data],
  );

  const hasActivity = !!data && data.totals.conversations > 0;

  return (
    <section
      className="pv-card"
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.borderSubtle}`,
        borderRadius: RADIUS.lg,
        padding: '1.35rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
        <h2 style={{ color: COLORS.textPrimary, fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>
          Agent activity
        </h2>
        {data && (
          <span style={{ color: COLORS.textMuted, fontSize: '0.72rem' }}>last 14 days</span>
        )}
      </div>

      {isLoading ? (
        <p style={{ color: COLORS.textMuted, fontSize: '0.82rem', margin: '1rem 0 0' }}>Loading…</p>
      ) : isError || !data ? (
        <EmptyState
          text="We couldn't load activity right now. It'll appear here once your agent starts talking to visitors."
        />
      ) : !hasActivity ? (
        <EmptyState
          text="No conversations yet. When someone talks to your agent, you'll see it here — share your link to get started."
        />
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', margin: '1.1rem 0 1.25rem' }}>
            <Stat label="Conversations" value={String(data.totals.conversations)} />
            <Stat
              label="Last 7 days"
              value={String(data.last7d.conversations)}
              delta={data.last7d.deltaVsPrior7d}
            />
            <Stat
              label="Avg length"
              value={data.totals.avgDurationSec !== null ? formatDuration(data.totals.avgDurationSec) : '—'}
            />
          </div>

          <Sparkline daily={data.daily} max={maxDaily} />
        </>
      )}
    </section>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta?: number }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
        <span style={{ color: COLORS.textPrimary, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {delta !== undefined && delta !== 0 && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: delta > 0 ? COLORS.success : COLORS.textMuted,
            }}
          >
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
      <div style={{ color: COLORS.textMuted, fontSize: '0.73rem', marginTop: '0.1rem' }}>{label}</div>
    </div>
  );
}

/** Single-series magnitude-over-time. One hue, baseline-anchored, per-bar hover. */
function Sparkline({ daily, max }: { daily: { date: string; count: number }[]; max: number }) {
  return (
    <div>
      <div
        role="img"
        aria-label={`Daily conversations over ${daily.length} days`}
        style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '3rem' }}
      >
        {daily.map((d) => {
          const h = d.count === 0 ? 2 : Math.max(3, Math.round((d.count / max) * 44));
          return (
            <div
              key={d.date}
              title={`${formatDay(d.date)}: ${d.count} conversation${d.count === 1 ? '' : 's'}`}
              style={{
                flex: 1,
                height: `${h}px`,
                minWidth: '4px',
                background: d.count === 0 ? COLORS.surfaceRaised : COLORS.accent,
                borderRadius: '2px',
                transition: 'height 200ms cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
        <span style={{ color: COLORS.textMuted, fontSize: '0.68rem', fontFamily: FONT.mono }}>
          {formatDay(daily[0]?.date)}
        </span>
        <span style={{ color: COLORS.textMuted, fontSize: '0.68rem', fontFamily: FONT.mono }}>today</span>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p style={{ color: COLORS.textMuted, fontSize: '0.83rem', lineHeight: 1.55, margin: '0.9rem 0 0' }}>
      {text}
    </p>
  );
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.round(sec / 60);
  return `${m}m`;
}

function formatDay(iso: string | undefined): string {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${m}/${d}`;
}
