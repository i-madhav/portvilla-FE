import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { store } from '@stores/store';
import { clearTokensAndState, refreshTokens } from '@stores/authSlice';
import {
  setUnauthorizedHandler,
  setTokenRefresher,
  onSessionEndedElsewhere,
} from '@app/lib/api';
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

// ─── API layer wiring ────────────────────────────────────────────────────────
// The client cannot import the store (the store imports the client), so the
// handlers are injected here — the one module that already knows about both.

/** Tear down the session and get the user to /login, without a redirect loop. */
function endSession() {
  store.dispatch(clearTokensAndState());
  queryClient.clear();
  if (window.location.pathname !== '/login') {
    void router.navigate('/login', { replace: true });
  }
}

// Given a valid refresh token, an expired access token is recoverable — the
// user should never be bounced to /login for it. The client calls this at most
// once per 401 and collapses concurrent attempts into a single exchange.
setTokenRefresher(async () => {
  const result = await store.dispatch(refreshTokens());
  return refreshTokens.fulfilled.match(result) ? result.payload.accessToken : null;
});

// Reached only once the session is genuinely unrecoverable: no refresh token,
// or the refresh itself was rejected.
setUnauthorizedHandler(endSession);

// A logout in another tab leaves this one holding a revoked token. Without
// this it would keep making doomed requests until its next 401.
onSessionEndedElsewhere(endSession);

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
