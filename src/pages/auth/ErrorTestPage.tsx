import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@routes/index';
import { AuthShell, Button } from '@shared-components/ui';

export function ErrorTestPage() {
  const [throwError, setThrowError] = useState(false);
  if (throwError) throw new Error('Test error from ErrorTestPage');

  return (
    <AuthShell
      eyebrow="dev — error states"
      title="Error test page."
      description="Trigger the application error boundary or a failed network request."
      footer={<Link className="font-semibold text-violet-deep" to={ROUTES.LOGIN}>Back to sign in</Link>}
    >
      <div className="grid gap-3">
        <Button fullWidth onClick={() => setThrowError(true)}>Simulate render error</Button>
        <Button variant="secondary" fullWidth onClick={() => { void fetch('https://httpstat.us/500').catch(() => undefined); }}>Trigger 500 fetch</Button>
      </div>
    </AuthShell>
  );
}
