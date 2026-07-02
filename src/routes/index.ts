import type { RouteObject, NavigateOptions } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';

import { authRoutes } from './auth.routes';
import { publicRoutes } from './publicRoutes';
import { onboardingRoutes } from './onboarding.routes';

// Combine route modules — more will be added as features grow
export const routes: RouteObject[] = [
  ...publicRoutes,
  ...authRoutes,
  ...onboardingRoutes,
];

// Export individual route modules for testing or specific use cases
export { authRoutes, publicRoutes, onboardingRoutes };

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
  CONTRACTS_OVERVIEW: '/dashboard/contracts/overview',
  CONTRACTS_ALL: '/dashboard/contracts/all',
  CONTRACTS_UPLOAD: '/dashboard/contracts/upload',
  INVOICES_OVERVIEW: '/dashboard/invoices/overview',
  INVOICES_ALL: '/dashboard/invoices/all',
  INVOICES_UPLOAD: '/dashboard/invoices/upload',
  ANALYTICS_CONTRACTS: '/dashboard/analytics/contracts',
  ANALYTICS_INVOICES: '/dashboard/analytics/invoices',
  ANALYTICS_SAVINGS: '/dashboard/analytics/savings',
  VENDORS_OVERVIEW: '/dashboard/vendors/overview',
  VENDORS_ALL: '/dashboard/vendors/all',
  FLEET: '/dashboard/fleet',
  CONFIGURATION: '/dashboard/configuration',
} as const;

export const ROUTE_GROUPS = {
  PUBLIC: [ROUTES.HOME, ROUTES.NOT_FOUND],
  AUTH: [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD],
  DASHBOARD: [
    ROUTES.DASHBOARD,
    ROUTES.CONTRACTS_OVERVIEW,
    ROUTES.CONTRACTS_ALL,
    ROUTES.CONTRACTS_UPLOAD,
    ROUTES.INVOICES_OVERVIEW,
    ROUTES.INVOICES_ALL,
    ROUTES.INVOICES_UPLOAD,
    ROUTES.ANALYTICS_CONTRACTS,
    ROUTES.ANALYTICS_INVOICES,
    ROUTES.ANALYTICS_SAVINGS,
    ROUTES.VENDORS_OVERVIEW,
    ROUTES.VENDORS_ALL,
    ROUTES.FLEET,
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

  const goToDashboard = () => {
    navigate(ROUTES.CONTRACTS_OVERVIEW);
  };

  const goToLogin = (redirectTo?: string) => {
    navigate(ROUTES.LOGIN, {
      state: { from: { pathname: redirectTo || ROUTES.CONTRACTS_OVERVIEW } },
    });
  };

  const goToSignup = (redirectTo?: string) => {
    navigate(ROUTES.SIGNUP, {
      state: { from: { pathname: redirectTo || ROUTES.CONTRACTS_OVERVIEW } },
    });
  };

  const isCurrentRoute = (path: string) => location.pathname === path;

  const isDashboardRoute = () => location.pathname.startsWith(ROUTES.DASHBOARD);

  const isAuthRoute = () =>
    location.pathname === ROUTES.LOGIN
    || location.pathname === ROUTES.SIGNUP
    || location.pathname === ROUTES.FORGOT_PASSWORD
    || location.pathname === ROUTES.RESET_PASSWORD;

  return {
    goTo,
    goBack,
    goHome,
    goToDashboard,
    goToLogin,
    goToSignup,
    isCurrentRoute,
    isDashboardRoute,
    isAuthRoute,
    currentPath: location.pathname,
    currentState: location.state,
  };
}

// ─── Utility helpers ─────────────────────────────────────────────────────────

export function requiresAuth(path: string): boolean {
  return path.startsWith(ROUTES.DASHBOARD);
}

export function isPublicRoute(path: string): boolean {
  return path === ROUTES.HOME || path === ROUTES.NOT_FOUND;
}

export function isAuthRoute(path: string): boolean {
  return path === ROUTES.LOGIN
    || path === ROUTES.SIGNUP
    || path === ROUTES.FORGOT_PASSWORD
    || path === ROUTES.RESET_PASSWORD;
}
