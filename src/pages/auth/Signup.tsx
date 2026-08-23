import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '@api-hooks/auth/useAuthHooks';
import { ROUTES } from '@routes/index';
import { useAppSelector } from '@stores/store';
import { AuthShell, Button, FormNotice, InputField } from '@shared-components/ui';

export function Signup() {
  const navigate = useNavigate();
  const { accessToken } = useAppSelector((state) => state.auth);
  const registerMutation = useRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (accessToken) navigate(ROUTES.ONBOARDING, { replace: true });
  }, [accessToken, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = await registerMutation.mutateAsync({ email, password });
    if (result.message) navigate(ROUTES.VERIFY_EMAIL, { state: { email } });
  }

  return (
    <AuthShell
      eyebrow="01 — create account"
      title="Start with the facts."
      description="Create an account, then shape the schema that powers your page and agent."
      footer={<>Already have an account? <Link className="font-semibold text-violet-deep" to={ROUTES.LOGIN}>Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="grid gap-5">
        <InputField label="Email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        <InputField label="Password" type="password" required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a strong password" hint="Eight or more characters with upper, lower, number, and symbol." />
        {registerMutation.error ? <FormNotice>error / {registerMutation.error.message}</FormNotice> : null}
        <Button type="submit" fullWidth disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}
