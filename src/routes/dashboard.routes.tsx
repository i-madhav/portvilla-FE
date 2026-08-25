import { Navigate, type RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@shared-components/routes/ProtectedRoute';
import { DashboardLayout } from '@pages/dashboard/DashboardLayout';
import { OverviewView } from '@pages/dashboard/views/OverviewView';
import { KnowledgeView } from '@pages/dashboard/views/KnowledgeView';
import { ConfigurationView } from '@pages/dashboard/views/ConfigurationView';
import { DEFAULT_KNOWLEDGE_SECTION } from '@pages/dashboard/knowledgeSections';

/**
 * Dashboard routes — the authenticated home. Each workspace is its own path so
 * it can be linked, bookmarked and reached with the Back button; the shared
 * shell (profile fetch, rail, unsaved-changes guard) lives in DashboardLayout.
 * Users without a profile are bounced to onboarding by the layout itself.
 */
export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: 'overview', element: <OverviewView /> },
      {
        path: 'knowledge',
        children: [
          { index: true, element: <Navigate to={DEFAULT_KNOWLEDGE_SECTION} replace /> },
          { path: ':section', element: <KnowledgeView /> },
        ],
      },
      { path: 'configuration', element: <ConfigurationView /> },
    ],
  },
];
