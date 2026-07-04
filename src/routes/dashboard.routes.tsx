import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@shared-components/routes/ProtectedRoute';
import { DashboardPage } from '@pages/dashboard/DashboardPage';

/**
 * Dashboard routes — the authenticated home. Shows the full profile across every
 * section plus the AI/voice-agent configuration, all editable in place. Users
 * without a profile are bounced to onboarding by DashboardPage itself.
 */
export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
];
