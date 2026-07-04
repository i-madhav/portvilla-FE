import type { RouteObject, NavigateOptions } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';

import { authRoutes } from './auth.routes';
import { publicRoutes } from './publicRoutes';
import { onboardingRoutes } from './onboarding.routes';
import { dashboardRoutes } from './dashboard.routes';

// Combine route modules — more will be added as features grow
export const routes: RouteObject[] = [
  ...publicRoutes,
  ...authRoutes,
  ...onboardingRoutes,
  ...dashboardRoutes,
];

// Export individual route modules for testing or specific use cases
export { authRoutes, publicRoutes, onboardingRoutes, dashboardRoutes };

// Route configuration constants
export const ROUTES = {
  HOME: '/',
  NOT_FOUND: '*',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  CONFIGURATION: '/dashboard/configuration',
} as const;

export const ROUTE_GROUPS = {
  PUBLIC: [ROUTES.HOME, ROUTES.NOT_FOUND],
  AUTH: [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD],
  DASHBOARD: [ROUTES.ONBOARDING, ROUTES.VERIFY_EMAIL,
    ROUTES.CONFIGURATION,
  ],
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Custom hook for navigation utilities with common portvilla routes.
 */
export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path: string, state?: NavigateOptions['state']) => {
    navigate(path, { state });
  };

  const goBack = () => {
    navigate(-1);
  };

  const goHome = () => {
    navigate(ROUTES.HOME);
  };


  const goToLogin = (redirectTo?: string) => {
    navigate(ROUTES.LOGIN, {
      state: { from: { pathname: redirectTo || ROUTES.ONBOARDING } },
    });
  };

  const goToSignup = (redirectTo?: string) => {
    navigate(ROUTES.SIGNUP, {
      state: { from: { pathname: redirectTo || ROUTES.ONBOARDING } },
    });
  };

  const isCurrentRoute = (path: string) => location.pathname === path;


  const isAuthRoute = () =>
    location.pathname === ROUTES.LOGIN
    || location.pathname === ROUTES.SIGNUP
    || location.pathname === ROUTES.FORGOT_PASSWORD
    || location.pathname === ROUTES.RESET_PASSWORD;

  return {
    goTo,
    goBack,
    goHome,
    goToLogin,
    goToSignup,
    isCurrentRoute,
    isAuthRoute,
    currentPath: location.pathname,
    currentState: location.state,
  };
}

// ─── Utility helpers ─────────────────────────────────────────────────────────


export function isPublicRoute(path: string): boolean {
  return path === ROUTES.HOME || path === ROUTES.NOT_FOUND;
}

export function isAuthRoute(path: string): boolean {
  return path === ROUTES.LOGIN
    || path === ROUTES.SIGNUP
    || path === ROUTES.FORGOT_PASSWORD
    || path === ROUTES.RESET_PASSWORD;
}
