import { useMemo } from 'react';
import { useSessionActivity } from '@api-hooks/session/useSessionActivity';
import type { SessionActivityDto } from '@typings/profileApi';
import { COLORS } from '../styles';

interface ActivityCardProps {
  enabled: boolean;
}

/** Honest analytics only: the API excludes token mints and counts sessions that
 * reached ACTIVE/ENDED. Response latency is intentionally absent until the
 * product records timing telemetry. */
export function ActivityCard({ enabled }: ActivityCardProps) {
  const { data, isLoading, isError, refetch } = useSessionActivity(enabled);
  const maxDaily = useMemo(
    () => (data ? Math.max(1, ...data.daily.map((d) => d.count)) : 1),
    [data],
  );

  if (isLoading) {
    return <ActivityShell><AnalyticsLoading /></ActivityShell>;
  }

  if (isError || !data) {
    return (
      <ActivityShell>
        <div className="pv-analytics-empty" role="status">
          <span className="pv-analytics-empty-icon" aria-hidden="true">↻</span>
          <h3>Activity is unavailable</h3>
          <p>Your profile is safe. We just could not load conversation analytics right now.</p>
          <button type="button" className="pv-inline-action pv-focusable" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      </ActivityShell>
    );
  }

  const hasActivity = data.totals.conversations > 0;

  return (
    <ActivityShell>
      <div className="pv-analytics-heading">
        <div>
          <p className="meta">Agent performance</p>
          <h2>Conversation analytics</h2>
          <p>Verified conversations that reached your live agent.</p>
        </div>
        <span className="pv-date-range">Last 14 days</span>
      </div>

      <div className="pv-metric-grid" aria-label="Conversation summary">
        <Metric
          label="Total conversations"
          value={String(data.totals.conversations)}
          help="All verified sessions"
        />
        <Metric
          label="Last 7 days"
          value={String(data.last7d.conversations)}
          help={formatDelta(data.last7d.deltaVsPrior7d)}
          tone={data.last7d.deltaVsPrior7d > 0 ? 'positive' : 'neutral'}
        />
        <Metric
          label="Avg. conversation"
          value={data.totals.avgDurationSec === null ? '—' : formatDuration(data.totals.avgDurationSec)}
          help={data.totals.avgDurationSec === null ? 'After a session ends' : 'Completed sessions'}
        />
        <Metric
          label="Time with visitors"
          value={formatDuration(data.totals.totalDurationSec)}
          help="Total completed time"
        />
      </div>

      {!hasActivity ? (
        <div className="pv-analytics-zero">
          <div>
            <h3>No conversations yet</h3>
            <p>Share your visitor link. Real conversations will appear here after a visitor joins.</p>
          </div>
          <span aria-hidden="true">01</span>
        </div>
      ) : (
        <div className="pv-analytics-detail-grid">
          <ConversationChart daily={data.daily} max={maxDaily} />
          <RecentConversations recent={data.recent} />
        </div>
      )}
    </ActivityShell>
  );
}

function ActivityShell({ children }: { children: React.ReactNode }) {
  return <section className="pv-analytics-card">{children}</section>;
}

function Metric({
  label,
  value,
  help,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  help: string;
  tone?: 'positive' | 'neutral';
}) {
  return (
    <div className="pv-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small style={{ color: tone === 'positive' ? COLORS.accent : COLORS.textMuted }}>{help}</small>
    </div>
  );
}

function ConversationChart({ daily, max }: { daily: { date: string; count: number }[]; max: number }) {
  const total = daily.reduce((sum, day) => sum + day.count, 0);
  return (
    <section className="pv-conversation-chart" aria-labelledby="conversation-trend-title">
      <div className="pv-detail-heading">
        <div>
          <h3 id="conversation-trend-title">Conversation trend</h3>
          <p>{total} in this 14-day window</p>
        </div>
        <span className="pv-chart-legend"><i /> Conversations</span>
      </div>
      <div
        className="pv-chart-bars"
        role="img"
        aria-label={`Daily conversations: ${daily.map((d) => `${formatLongDay(d.date)} ${d.count}`).join(', ')}`}
      >
        {daily.map((day) => {
          const height = day.count === 0 ? 3 : Math.max(12, Math.round((day.count / max) * 100));
          return (
            <div className="pv-chart-column" key={day.date} title={`${formatLongDay(day.date)}: ${day.count}`}>
              <span className="pv-chart-value">{day.count || ''}</span>
              <span
                className={day.count === 0 ? 'pv-chart-bar pv-chart-bar-empty' : 'pv-chart-bar'}
                style={{ height: `${height}%` }}
              />
              <small>{formatDay(day.date)}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecentConversations({ recent }: { recent: SessionActivityDto['recent'] }) {
  return (
    <section className="pv-recent-conversations" aria-labelledby="recent-conversations-title">
      <div className="pv-detail-heading">
        <div>
          <h3 id="recent-conversations-title">Recent conversations</h3>
          <p>Latest verified sessions</p>
        </div>
      </div>
      {recent.length === 0 ? (
        <p className="pv-recent-empty">No recent sessions in this window.</p>
      ) : (
        <ol>
          {recent.slice(0, 5).map((session) => (
            <li key={session.id}>
              <span className={session.status === 'active' ? 'pv-session-icon pv-session-icon-active' : 'pv-session-icon'} aria-hidden="true">
                {session.status === 'active' ? '•' : '✓'}
              </span>
              <span className="pv-session-copy">
                <strong>{session.status === 'active' ? 'Live conversation' : 'Conversation completed'}</strong>
                <small>{formatSessionDate(session.startedAt)} · {session.type === 'guest' ? 'Visitor' : 'Signed-in user'}</small>
              </span>
              <span className="pv-session-duration">
                {session.durationSec === null ? 'Live' : formatDuration(session.durationSec)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function AnalyticsLoading() {
  return (
    <div className="pv-analytics-loading" aria-label="Loading conversation analytics" role="status">
      <span />
      <span />
      <span />
    </div>
  );
}

function formatDelta(delta: number): string {
  if (delta === 0) return 'Same as prior 7 days';
  return `${delta > 0 ? '+' : ''}${delta} vs. prior 7 days`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatDay(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(new Date(`${iso}T00:00:00Z`));
}

function formatLongDay(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
}

function formatSessionDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}
