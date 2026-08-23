import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@routes/index';
import { AuthShell, Button, FormNotice, InputField } from '@shared-components/ui';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const mismatch = Boolean(confirm && password !== confirm);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthShell
        eyebrow="03 — recovery complete"
        title="Password reset."
        description="The new password is active. Use it the next time you open Portvilla."
        footer={<Link className="font-semibold text-violet-deep" to={ROUTES.LOGIN}>Sign in with the new password</Link>}
      >
        <FormNotice>account.state / ready</FormNotice>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="03 — new credential"
      title="Set a new password."
      description="Choose the credential that will protect this account."
      footer={<Link className="font-semibold text-violet-deep" to={ROUTES.LOGIN}>Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="grid gap-5">
        {!token ? <FormNotice>error / invalid or missing reset token. Request a new link.</FormNotice> : null}
        <InputField label="New password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a strong password" />
        <InputField label="Confirm password" type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Repeat the password" error={mismatch ? 'Passwords do not match.' : null} />
        <Button type="submit" fullWidth disabled={!token || !password || !confirm || mismatch}>Reset password</Button>
      </form>
    </AuthShell>
  );
}
