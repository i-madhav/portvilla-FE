import type { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '@shared-components/routes/ProtectedRoute';
import { OnboardingPage } from '@pages/onboarding/OnboardingPage';

/**
 * Onboarding routes — only accessible by authenticated users who have NOT yet
 * created a profile. The <ProtectedRoute> redirects unauthenticated users to login.
 */
export const onboardingRoutes: RouteObject[] = [
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
];
