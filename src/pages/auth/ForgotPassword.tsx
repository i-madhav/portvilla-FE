import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@routes/index';
import { AuthShell, Button, FormNotice, InputField } from '@shared-components/ui';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AuthShell
        eyebrow="02 — recovery requested"
        title="Check your email."
        description="If the address belongs to an account, a password reset link will arrive shortly."
        footer={<Link className="font-semibold text-violet-deep" to={ROUTES.LOGIN}>Back to sign in</Link>}
      >
        <FormNotice>delivery / {email}</FormNotice>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="02 — account recovery"
      title="Reset password."
      description="Enter the account email. We will send the next step there."
      footer={<>Remember the password? <Link className="font-semibold text-violet-deep" to={ROUTES.LOGIN}>Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="grid gap-5">
        <InputField label="Email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        <Button type="submit" fullWidth>Send reset link</Button>
      </form>
    </AuthShell>
  );
}
