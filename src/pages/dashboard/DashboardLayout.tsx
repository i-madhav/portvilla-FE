import { useCallback, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@stores/store';
import { logout } from '@stores/authSlice';
import { ROUTES } from '@routes/index';
import { useOwnProfileQuery, useUpdateProfile } from '@api-hooks/profile/useProfileHooks';
import type { UpdateProfilePayload } from '@typings/profileApi';
import { publicProfileLabel, publicProfileUrl } from '@app/lib/api';

import { pageStyle } from './styles';
import { DashboardNav, type NavItem, type NavAccount } from './components/DashboardNav';
import { DirtyGuard } from './DirtyGuard';
import { knowledgeSections } from './knowledgeSections';
import type { DashboardContext } from './context';
import { useProfileCompleteness } from './hooks/useProfileCompleteness';


/**
 * The dashboard shell: profile loading, the persistent rail, and the
 * unsaved-changes guard. Each view is a nested route, so views are
 * linkable, bookmarkable, and reachable with the Back button.
 */
export function DashboardLayout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state) => state.auth);
  const query = useOwnProfileQuery(Boolean(accessToken));
  const profile = useAppSelector((state) => state.profile.data);
  const updateMutation = useUpdateProfile();
  const completeness = useProfileCompleteness(profile);

  const save = useCallback(
    async (payload: UpdateProfilePayload) => {
      await updateMutation.mutateAsync(payload);
    },
    [updateMutation],
  );

  useEffect(() => {
    if (!query.isLoading && !profile) navigate(ROUTES.ONBOARDING, { replace: true });
  }, [query.isLoading, profile, navigate]);

  const jumpToKnowledge = useCallback(
    (section: string) => {
      navigate(`${ROUTES.KNOWLEDGE}/${section}`);
    },
    [navigate],
  );

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
    { to: ROUTES.OVERVIEW, label: 'Overview', description: 'Performance & activity', icon: 'analytics' },
    {
      to: ROUTES.KNOWLEDGE, label: 'Agent knowledge', description: 'Information & displays', icon: 'knowledge',
      needsAttention: completeness.percent < 100,
      // The sections live in the rail rather than in a second navigation
      // inside the page, so there is one place that answers "where am I".
      children: knowledgeSections(profile, completeness).map((section) => ({
        to: `${ROUTES.KNOWLEDGE}/${section.id}`,
        label: section.label,
        needsAttention: section.needsAttention,
      })),
    },
    { to: ROUTES.CONFIGURATION, label: 'Configuration', description: 'Voice, model & access', icon: 'settings' },
  ];

  const account: NavAccount = {
    name: profile.identity.name || '',
    handle: publicProfileLabel(profile.username),
    image: profile.identity.primaryImage,
    url: publicProfileUrl(profile.username),
    isLive: profile.visibility !== 'private',
  };

  const context: DashboardContext = {
    profile,
    completeness,
    enabled: Boolean(accessToken),
    save,
    jumpToKnowledge,
  };

  return (
    <DirtyGuard>
      <div style={pageStyle}>
        <div className="pv-dashboard-shell">
          <DashboardNav items={navItems} onLogout={handleLogout} account={account} />

          <main className="pv-dashboard-main" id="dashboard-main" tabIndex={-1}>
            <Outlet context={context} />
          </main>
        </div>
      </div>
    </DirtyGuard>
  );
}
