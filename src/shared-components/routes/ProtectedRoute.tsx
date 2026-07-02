import { Navigate, Outlet } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppSelector } from '@stores/store';

interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Protected route — redirects unauthenticated users to the login page.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
