import { useToast, type Toast } from './ToastContext';

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const colors: Record<Toast['type'], { bg: string; border: string; title: string; msg: string }> = {
    success: { bg: '#2B5748', border: '#618764', title: '#9CB080', msg: '#618764' },
    error:   { bg: '#3a2828', border: '#8b3a3a', title: '#ff9e9e', msg: '#c07070' },
    info:    { bg: '#273338', border: '#618764', title: '#9CB080', msg: '#618764' },
  };
  const c = colors[toast.type];

  return (
    <div
      role="alert"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '0.75rem',
        minWidth: '280px',
        maxWidth: '380px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <div>
        <p style={{ color: c.title, fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>
          {toast.title}
        </p>
        {toast.message && (
          <p style={{ color: c.msg, fontSize: '0.75rem', margin: '2px 0 0' }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: c.msg,
          cursor: 'pointer',
          fontSize: '1rem',
          lineHeight: 1,
          padding: '0 2px',
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 9999,
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
      ))}
    </div>
  );
}
