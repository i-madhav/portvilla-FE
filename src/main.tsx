import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { store } from './stores/store.ts';
import RegisterPage from './routes/auth/RegisterPage.tsx';
import VerifyEmailPage from './routes/auth/VerifyEmailPage.tsx';
import LoginPage from './routes/auth/LoginPage.tsx';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/auth/register', element: <RegisterPage /> },
  { path: '/auth/verify-email', element: <VerifyEmailPage /> },
  { path: '/auth/login', element: <LoginPage /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
