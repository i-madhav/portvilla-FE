import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@stores/store';
import { logout } from '@stores/authSlice';
import { ROUTES } from '@routes/index';
import { useOwnProfileQuery, useUpdateProfile } from '@api-hooks/profile/useProfileHooks';
import type { UpdateProfilePayload } from '@typings/profileApi';

import { pageStyle, containerStyle, cardStyle, COLORS, smallButtonStyle } from './styles';
import { IdentitySection } from './sections/IdentitySection';
import { CapabilitiesSection } from './sections/CapabilitiesSection';
import { TimelineSection } from './sections/TimelineSection';
import { WorksSection } from './sections/WorksSection';
import { SocialSection } from './sections/SocialSection';
import { AgentConfigSection } from './sections/AgentConfigSection';
import { ExtraSections } from './sections/ExtraSections';

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

  // No profile (e.g. 404) → send the user through onboarding.
  useEffect(() => {
    if (!query.isLoading && !profile) {
      navigate(ROUTES.ONBOARDING, { replace: true });
    }
  }, [query.isLoading, profile, navigate]);

  const handleLogout = useCallback(() => {
    void dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  }, [dispatch, navigate]);

  if (query.isLoading || !profile) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: '50%',
            border: `2px solid ${COLORS.inputBorder}`,
            borderTopColor: COLORS.primaryText,
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  const id = profile.identity;
  const initial = (id.name || profile.username || '?').charAt(0).toUpperCase();

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '0.75rem',
              flexShrink: 0,
              background: COLORS.inputBg,
              border: `1px solid ${COLORS.inputBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              color: COLORS.primaryText,
              fontSize: '1.4rem',
              fontWeight: 700,
            }}
          >
            {id.primaryImage ? (
              <img src={id.primaryImage} alt={id.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initial
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ color: COLORS.primaryText, fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              {id.name || 'Unnamed profile'}
            </h1>
            <div style={{ color: COLORS.mutedText, fontSize: '0.78rem' }}>
              portvilla.in/{profile.username}
              {id.availability && (
                <span style={{ color: COLORS.secondaryText }}> · {id.availability}</span>
              )}
            </div>
            {id.tagline && (
              <div style={{ color: COLORS.secondaryText, fontSize: '0.8rem', marginTop: '0.15rem' }}>{id.tagline}</div>
            )}
          </div>

          <button type="button" style={smallButtonStyle('ghost')} onClick={handleLogout}>
            Log out
          </button>
        </div>

        {/* Editable sections */}
        <IdentitySection profile={profile} save={save} />
        <CapabilitiesSection profile={profile} save={save} />
        <TimelineSection profile={profile} save={save} />
        <WorksSection profile={profile} save={save} />
        <SocialSection profile={profile} save={save} />

        {/* Agent configuration */}
        <AgentConfigSection profile={profile} save={save} />

        {/* Read-only sections (editing is a follow-up) */}
        <ExtraSections profile={profile} />
      </div>
    </div>
  );
}
