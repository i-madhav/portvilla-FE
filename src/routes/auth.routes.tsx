import type { RouteObject } from 'react-router-dom';
import { AuthRoute } from '@shared-components/routes/AuthRoute';
import {
  Login,
  Signup,
  ForgotPassword,
  ResetPassword,
  VerifyEmailPage,
  ErrorTestPage,
} from '@pages/auth';

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <AuthRoute>
        <Login />
      </AuthRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <AuthRoute>
        <Signup />
      </AuthRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <AuthRoute>
        <ForgotPassword />
      </AuthRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <AuthRoute>
        <ResetPassword />
      </AuthRoute>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <AuthRoute>
        <VerifyEmailPage />
      </AuthRoute>
    ),
  },
  {
    path: '/error-test',
    element: (
      <AuthRoute>
        <ErrorTestPage />
      </AuthRoute>
    ),
  },
];
