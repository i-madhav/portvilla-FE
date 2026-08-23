import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@stores/store';
import { logout } from '@stores/authSlice';
import { ROUTES } from '@routes/index';
import { useOwnProfileQuery, useUpdateProfile } from '@api-hooks/profile/useProfileHooks';
import type { UpdateProfilePayload } from '@typings/profileApi';
import { publicProfileLabel, publicProfileUrl } from '@app/lib/publicProfile';

import { pageStyle, shellStyle, containerStyle, COLORS } from './styles';
import { ProfileHero } from './components/ProfileHero';
import { CompletenessCard } from './components/CompletenessCard';
import { ActivityCard } from './components/ActivityCard';
import { DashboardNav, type NavItem, type NavAccount } from './components/DashboardNav';
import { useProfileCompleteness } from './useProfileCompleteness';
import { IdentitySection } from './sections/IdentitySection';
import { CapabilitiesSection } from './sections/CapabilitiesSection';
import { TimelineSection } from './sections/TimelineSection';
import { WorksSection } from './sections/WorksSection';
import { SocialSection } from './sections/SocialSection';
import { AgentConfigSection } from './sections/AgentConfigSection';
import { ExtraSections } from './sections/ExtraSections';

const SECTION_IDS = ['agent', 'identity', 'capabilities', 'timeline', 'works', 'social', 'more'];

export function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((s) => s.auth);

  const query = useOwnProfileQuery(!!accessToken);
  const profile = useAppSelector((s) => s.profile.data);

  const updateMutation = useUpdateProfile();
  const save = useCallback(
    async (payload: UpdateProfilePayload) => {
      await updateMutation.mutateAsync(payload);
    },
    [updateMutation],
  );

  const completeness = useProfileCompleteness(profile);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!query.isLoading && !profile) navigate(ROUTES.ONBOARDING, { replace: true });
  }, [query.isLoading, profile, navigate]);

  // Highlights whichever section the reader is actually looking at. rootMargin
  // biases toward the upper third so the active item changes when a section
  // reaches reading position, not when it first peeks into view.
  useEffect(() => {
    if (!profile) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    );

    SECTION_IDS.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [profile]);

  const jumpTo = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  }, []);

  const handleLogout = useCallback(() => {
    void dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  }, [dispatch, navigate]);

  if (query.isLoading || !profile) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          aria-label="Loading"
          style={{
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: '50%',
            border: `2px solid ${COLORS.borderSubtle}`,
            borderTopColor: COLORS.accent,
            animation: 'spin 0.7s linear infinite',
          }}
        />
      </div>
    );
  }

  const incompleteTargets = new Set(completeness.items.filter((i) => !i.done).map((i) => i.target));

  const navItems: NavItem[] = [
    { id: 'agent', label: 'Voice settings' },
    { id: 'identity', label: 'About you' },
    { id: 'capabilities', label: 'Expertise' },
    { id: 'timeline', label: 'Experience' },
    { id: 'works', label: 'Work' },
    { id: 'social', label: 'Contact' },
    { id: 'more', label: 'More context' },
  ].map((i) => ({ ...i, needsAttention: incompleteTargets.has(i.id) }));

  const account: NavAccount = {
    name: profile.identity.name || '',
    handle: publicProfileLabel(profile.username),
    image: profile.identity.primaryImage,
    url: publicProfileUrl(profile.username),
  };

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div style={pageStyle}>
      <div className="pv-dashboard-shell" style={shellStyle}>
        <DashboardNav items={navItems} activeId={activeId} onSelect={jumpTo} account={account} />

        <div style={containerStyle}>
          <ProfileHero profile={profile} onLogout={handleLogout} save={save} />

          <div className="pv-overview-grid">
            <CompletenessCard completeness={completeness} onJump={jumpTo} />
            <ActivityCard enabled={!!accessToken} />
          </div>

          <div className="pv-section-grid">
            <div className="pv-span-2" style={{ padding: '1.25rem 0 0.25rem' }}>
              <p className="meta">01 / tune the conversation</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">How your agent speaks</h2>
              <p className="mt-2 max-w-reading text-base text-ink-60">Set its name and conversation style. Content-provider settings are optional and separate from the live voice model.</p>
            </div>
            <div id="agent" ref={setRef('agent')} className="pv-span-2" style={{ scrollMarginTop: '1.5rem' }}>
              <AgentConfigSection profile={profile} save={save} />
            </div>

            <div className="pv-span-2" style={{ padding: '2rem 0 0.25rem' }}>
              <p className="meta">02 / ground the answers</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">What your agent knows</h2>
              <p className="mt-2 max-w-reading text-base text-ink-60">Keep these facts specific and current. They are the source material your representative uses when visitors ask about you.</p>
            </div>
            <div id="identity" ref={setRef('identity')} className="pv-span-2" style={{ scrollMarginTop: '1.5rem' }}>
              <IdentitySection profile={profile} save={save} />
            </div>
            <div id="capabilities" ref={setRef('capabilities')} style={{ scrollMarginTop: '1.5rem' }}>
              <CapabilitiesSection profile={profile} save={save} />
            </div>
            <div id="timeline" ref={setRef('timeline')} style={{ scrollMarginTop: '1.5rem' }}>
              <TimelineSection profile={profile} save={save} />
            </div>
            <div id="works" ref={setRef('works')} className="pv-span-2" style={{ scrollMarginTop: '1.5rem' }}>
              <WorksSection profile={profile} save={save} />
            </div>
            <div id="social" ref={setRef('social')} style={{ scrollMarginTop: '1.5rem' }}>
              <SocialSection profile={profile} save={save} />
            </div>
            <div id="more" ref={setRef('more')} className="pv-span-2" style={{ scrollMarginTop: '1.5rem' }}>
              <ExtraSections profile={profile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
