import { Button } from '@shared-components/ui';
import { useToast, type Toast } from './toast';

const labels: Record<Toast['type'], string> = {
  success: 'complete',
  error: 'error',
  info: 'notice',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div role="alert" className="surface-glass flex min-w-72 max-w-sm items-start justify-between gap-4 p-4">
      <div className="grid gap-1">
        <p className="font-mono text-label uppercase text-violet">{labels[toast.type]} / {toast.title}</p>
        {toast.message ? <p className="text-micro text-ink-60">{toast.message}</p> : null}
      </div>
      <Button variant="ghost" size="compact" className="min-h-0 shrink-0 px-2 py-1" onClick={onDismiss} aria-label="Dismiss notification">×</Button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}
