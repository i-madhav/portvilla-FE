import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@stores/store';
import { clearTokensAndState } from '@stores/authSlice';
import { isTokenExpired } from '@app/lib/api';

interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Protected route — redirects unauthenticated users to the login page.
 *
 * A token that is missing *or expired* counts as unauthenticated: this stops an
 * expired token in localStorage from letting the user into a protected page
 * (which would then fire authenticated requests that the server rejects with
 * 401 in a loop).
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const isAuthenticated = !isTokenExpired(accessToken);

  // Proactively clear a stale/expired token so it isn't reused on the next load.
  useEffect(() => {
    if (accessToken && !isAuthenticated) {
      dispatch(clearTokensAndState());
    }
  }, [accessToken, isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
