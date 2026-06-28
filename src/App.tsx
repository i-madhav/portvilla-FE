import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import { ToastProvider } from '@app/providers/ToastContext';

const queryClient = new QueryClient();

/**
 * Root layout — wraps the entire app with providers.
 *
 * Routes nested inside this layout (defined in main.tsx / routes/)
 * render via <Outlet />.
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </QueryClientProvider>
  );
}
