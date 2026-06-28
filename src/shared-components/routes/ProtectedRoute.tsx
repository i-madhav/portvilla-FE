import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@stores/store';

/**
 * Protected route — redirects unauthenticated users to the login page.
 */
export function ProtectedRoute() {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
