import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { store } from '@stores/store';
import { clearTokensAndState } from '@stores/authSlice';
import { setUnauthorizedHandler } from '@app/lib/apiClient';
import { routes } from '@routes/index';
import { ToastProvider } from '@app/providers/ToastContext';
import { ToastContainer } from '@app/providers/ToastContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

const router = createBrowserRouter(routes);

// When any authenticated request is rejected with 401 (expired/revoked token),
// clear the session and send the user to the login page. Guarded against a
// redirect loop when the user is already on /login.
setUnauthorizedHandler(() => {
  store.dispatch(clearTokensAndState());
  queryClient.clear();
  if (window.location.pathname !== '/login') {
    void router.navigate('/login', { replace: true });
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
