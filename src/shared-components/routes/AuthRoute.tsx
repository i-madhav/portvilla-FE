import { Navigate, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppSelector } from '@stores/store';

interface AuthRouteProps {
  children?: ReactNode;
}

/**
 * Route guard — redirects authenticated users to the dashboard.
 * Used for login / signup / forgot-password etc.
 */
export function AuthRoute({ children }: AuthRouteProps) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  if (accessToken) {
    return <Navigate to="/dashboard/contracts/overview" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
