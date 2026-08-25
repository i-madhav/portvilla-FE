import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@stores/store';
import { logout } from '@stores/authSlice';
import { ROUTES } from '@routes/index';
import { useOwnProfileQuery, useUpdateProfile } from '@api-hooks/profile/useProfileHooks';
import type { EntityType, ProfileDataResponseDto, UpdateProfilePayload } from '@typings/profileApi';
import { publicProfileLabel, publicProfileUrl } from '@app/lib/api';

import { pageStyle, shellStyle, containerStyle } from './styles';
import { ProfileHero } from './components/ProfileHero';
import { OverviewHero } from './components/OverviewHero';
import { CompletenessCard } from './components/CompletenessCard';
import { ActivityCard } from './components/ActivityCard';
import {
  DashboardNav,
  type DashboardView,
  type NavItem,
  type NavAccount,
} from './components/DashboardNav';
import { DisplayPreviews } from './components/DisplayPreviews';
import { useProfileCompleteness } from './hooks/useProfileCompleteness';
import { IdentitySection } from './sections/IdentitySection';
import { CapabilitiesSection } from './sections/CapabilitiesSection';
import { TimelineSection } from './sections/TimelineSection';
import { WorksSection } from './sections/WorksSection';
import { SocialSection } from './sections/SocialSection';
import { AgentConfigSection } from './sections/AgentConfigSection';
import { ExtraSections, type ExtraSectionId } from './sections/ExtraSections';

const ENTITY_COPY: Record<EntityType, {
  noun: string;
  identity: string;
  capabilities: string;
  timeline: string;
  works: string;
}> = {
  individual: { noun: 'individual', identity: 'About you', capabilities: 'Expertise', timeline: 'Experience', works: 'Work' },
  company: { noun: 'company', identity: 'Company profile', capabilities: 'Capabilities', timeline: 'Milestones', works: 'Products & work' },
  product: { noun: 'product', identity: 'Product profile', capabilities: 'Features', timeline: 'Releases', works: 'Stories & use cases' },
  organization: { noun: 'organization', identity: 'Organization', capabilities: 'Capabilities', timeline: 'Milestones', works: 'Work & initiatives' },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state) => state.auth);
  const query = useOwnProfileQuery(Boolean(accessToken));
  const profile = useAppSelector((state) => state.profile.data);
  const updateMutation = useUpdateProfile();
  const completeness = useProfileCompleteness(profile);
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [pendingSection, setPendingSection] = useState<string | null>(null);

  const save = useCallback(
    async (payload: UpdateProfilePayload) => {
      await updateMutation.mutateAsync(payload);
    },
    [updateMutation],
  );

  useEffect(() => {
    if (!query.isLoading && !profile) navigate(ROUTES.ONBOARDING, { replace: true });
  }, [query.isLoading, profile, navigate]);

  useEffect(() => {
    if (activeView !== 'knowledge' || !pendingSection) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(pendingSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingSection(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeView, pendingSection]);

  const jumpToKnowledge = useCallback((section: string) => {
    setPendingSection(section);
    setActiveView('knowledge');
  }, []);

  const handleLogout = useCallback(() => {
    void dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  }, [dispatch, navigate]);

  if (query.isLoading || !profile) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pv-dashboard-loader" aria-label="Loading dashboard" role="status" />
      </div>
    );
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', description: 'Performance & activity', icon: 'analytics' },
    {
      id: 'knowledge', label: 'Agent knowledge', description: 'Information & displays', icon: 'knowledge',
      needsAttention: completeness.percent < 100,
    },
    { id: 'configuration', label: 'Configuration', description: 'Voice, model & access', icon: 'settings' },
  ];

  const account: NavAccount = {
    name: profile.identity.name || '',
    handle: publicProfileLabel(profile.username),
    image: profile.identity.primaryImage,
    url: publicProfileUrl(profile.username),
    isLive: profile.visibility !== 'private',
  };

  return (
    <div style={pageStyle}>
      <div className="pv-dashboard-shell" style={shellStyle}>
        <DashboardNav
          items={navItems}
          activeId={activeView}
          onSelect={setActiveView}
          onLogout={handleLogout}
          account={account}
        />

        <main style={containerStyle} id="dashboard-main" tabIndex={-1}>
          {activeView === 'overview' ? (
            <OverviewWorkspace
              profile={profile}
              completeness={completeness}
              enabled={Boolean(accessToken)}
              onJump={jumpToKnowledge}
              onConfigure={() => setActiveView('configuration')}
            />
          ) : null}

          {activeView === 'knowledge' ? (
            <KnowledgeWorkspace profile={profile} save={save} onJump={jumpToKnowledge} />
          ) : null}

          {activeView === 'configuration' ? (
            <ConfigurationWorkspace profile={profile} save={save} />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function OverviewWorkspace({ profile, completeness, enabled, onJump, onConfigure }: {
  profile: ProfileDataResponseDto;
  completeness: ReturnType<typeof useProfileCompleteness>;
  enabled: boolean;
  onJump: (section: string) => void;
  onConfigure: () => void;
}) {
  return (
    <div className="pv-dashboard-workspace">
      <PageHeader eyebrow="Workspace" title="Overview" description="A clear read on how your agent is performing and what needs attention." />
      <OverviewHero profile={profile} onEditKnowledge={() => onJump('identity')} onConfigure={onConfigure} />
      <ActivityCard enabled={enabled} />
      <div className="pv-overview-bottom-grid">
        <CompletenessCard completeness={completeness} onJump={onJump} />
        <KnowledgeSnapshot profile={profile} onOpen={() => onJump('identity')} />
      </div>
    </div>
  );
}

function KnowledgeWorkspace({ profile, save, onJump }: {
  profile: ProfileDataResponseDto;
  save: (payload: UpdateProfilePayload) => Promise<void>;
  onJump: (section: string) => void;
}) {
  const entity = ENTITY_COPY[profile.identity.entityType];
  const visibleExtra: ExtraSectionId[] =
    profile.identity.entityType === 'company' || profile.identity.entityType === 'organization'
      ? ['offerings', 'metrics', 'testimonials', 'team', 'content', 'media']
      : ['offerings', 'metrics', 'testimonials', 'content', 'media'];
  const sections = [
    { id: 'identity', label: entity.identity },
    { id: 'capabilities', label: entity.capabilities },
    { id: 'timeline', label: entity.timeline },
    { id: 'works', label: entity.works },
    { id: 'more', label: 'Proof & media' },
    { id: 'social', label: 'Contact' },
  ];

  return (
    <div className="pv-dashboard-workspace">
      <PageHeader
        eyebrow="Grounding source"
        title="Agent knowledge"
        description={`Edit the approved information your agent uses to speak about this ${entity.noun}.`}
      />

      <div className="pv-entity-notice">
        <span aria-hidden="true">◎</span>
        <p><strong>Showing fields for a {entity.noun}.</strong> Irrelevant fields stay out of the way. Change the type inside {entity.identity.toLowerCase()} if this is wrong.</p>
      </div>

      <nav className="pv-knowledge-nav" aria-label="Knowledge sections">
        {sections.map((section) => (
          <button key={section.id} type="button" className="pv-knowledge-nav-item pv-focusable" onClick={() => onJump(section.id)}>
            {section.label}
          </button>
        ))}
      </nav>

      <div className="pv-section-grid pv-knowledge-sections">
        <div id="identity" className="pv-span-2 pv-scroll-target"><IdentitySection profile={profile} save={save} /></div>
        <div id="capabilities" className="pv-scroll-target"><CapabilitiesSection profile={profile} save={save} /></div>
        <div id="timeline" className="pv-scroll-target"><TimelineSection profile={profile} save={save} /></div>
        <div id="works" className="pv-span-2 pv-scroll-target"><WorksSection profile={profile} save={save} /></div>
        <div id="more" className="pv-span-2 pv-scroll-target"><ExtraSections profile={profile} save={save} visible={visibleExtra} /></div>
        <div id="social" className="pv-span-2 pv-scroll-target"><SocialSection profile={profile} save={save} /></div>
      </div>

      <DisplayPreviews profile={profile} onEditSource={onJump} />
    </div>
  );
}

function ConfigurationWorkspace({ profile, save }: {
  profile: ProfileDataResponseDto;
  save: (payload: UpdateProfilePayload) => Promise<void>;
}) {
  return (
    <div className="pv-dashboard-workspace">
      <PageHeader eyebrow="Agent setup" title="Configuration" description="Control who can visit, how your agent speaks, and which content model supports background tasks." />
      <ProfileHero profile={profile} save={save} />
      <div className="pv-workspace-section-heading">
        <p className="meta">Conversation behavior</p>
        <h2>Voice and model settings</h2>
        <p>Changes affect future sessions. Current live conversations continue with their existing configuration.</p>
      </div>
      <AgentConfigSection profile={profile} save={save} />
    </div>
  );
}

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="pv-workspace-header">
      <p className="meta">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
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
