import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@routes/index';
import type { ProfileDataResponseDto } from '@typings/profileApi';

import { useDashboard } from '../context';
import { OverviewHero } from '../components/OverviewHero';
import { ActivityCard } from '../components/ActivityCard';
import { CompletenessCard } from '../components/CompletenessCard';
import { PageHeader } from './PageHeader';

export function OverviewView() {
  const { profile, completeness, enabled, jumpToKnowledge } = useDashboard();
  const navigate = useNavigate();

  return (
    <div className="pv-dashboard-workspace">
      <PageHeader eyebrow="Workspace" title="Overview" description="A clear read on how your agent is performing and what needs attention." />
      <OverviewHero
        profile={profile}
        onEditKnowledge={() => jumpToKnowledge('identity')}
        onConfigure={() => navigate(ROUTES.CONFIGURATION)}
      />
      <ActivityCard enabled={enabled} />
      <div className="pv-overview-bottom-grid">
        <CompletenessCard completeness={completeness} onJump={jumpToKnowledge} />
        <KnowledgeSnapshot profile={profile} onOpen={() => jumpToKnowledge('identity')} />
      </div>
    </div>
  );
}

function KnowledgeSnapshot({ profile, onOpen }: {
  profile: ProfileDataResponseDto;
  onOpen: () => void;
}) {
  const sources = [
    ['Capabilities', profile.capabilities.length],
    ['Timeline', profile.timeline.length],
    ['Work', profile.works.length],
    ['Proof points', profile.metrics.length + profile.testimonials.length],
  ] as const;
  return (
    <section className="pv-knowledge-snapshot">
      <div className="pv-detail-heading">
        <div><p className="meta">Grounding</p><h2>Knowledge coverage</h2><p>Saved facts available to the agent.</p></div>
        <button type="button" className="pv-inline-action pv-focusable" onClick={onOpen}>Manage</button>
      </div>
      <div className="pv-knowledge-source-grid">
        {sources.map(([label, count]) => <div key={label}><strong>{count}</strong><span>{label}</span></div>)}
      </div>
      <p className="pv-knowledge-freshness">Last edited {new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(new Date(profile.updatedAt))}</p>
    </section>
  );
}
