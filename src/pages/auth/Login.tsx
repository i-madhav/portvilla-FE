import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@stores/store';
import { useLogin, useLoginWithOtp, useRequestLoginOtp } from '@api-hooks/auth/useAuthHooks';
import { ROUTES } from '@routes/index';
import { AuthShell, Button, FormNotice, InputField } from '@shared-components/ui';

type Tab = 'password' | 'otp';
type OtpStep = 'request' | 'verify';

export function Login() {
  const navigate = useNavigate();
  const { accessToken } = useAppSelector((state) => state.auth);
  const loginMutation = useLogin();
  const requestOtpMutation = useRequestLoginOtp();
  const loginWithOtpMutation = useLoginWithOtp();

  const [tab, setTab] = useState<Tab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('request');

  useEffect(() => {
    if (accessToken) navigate(ROUTES.ONBOARDING, { replace: true });
  }, [accessToken, navigate]);

  useEffect(() => {
    setOtpStep('request');
    setOtp('');
  }, [tab]);

  async function handlePasswordLogin(event: React.FormEvent) {
    event.preventDefault();
    const result = await loginMutation.mutateAsync({ email, password });
    if (result.accessToken) navigate(ROUTES.ONBOARDING, { replace: true });
  }

  async function handleRequestOtp(event: React.FormEvent) {
    event.preventDefault();
    await requestOtpMutation.mutateAsync(email);
    setOtpStep('verify');
  }

  async function handleOtpLogin(event: React.FormEvent) {
    event.preventDefault();
    const result = await loginWithOtpMutation.mutateAsync({ email, otp });
    if (result.accessToken) navigate(ROUTES.ONBOARDING, { replace: true });
  }

  const isLoading = loginMutation.isPending || requestOtpMutation.isPending || loginWithOtpMutation.isPending;
  const error = loginMutation.error?.message
    || requestOtpMutation.error?.message
    || loginWithOtpMutation.error?.message
    || null;

  return (
    <AuthShell
      eyebrow="01 — account access"
      title="Welcome back."
      description="Open the profile and agent configuration attached to your account."
      footer={<>No account yet? <Link className="font-semibold text-violet-deep" to={ROUTES.SIGNUP}>Create one</Link></>}
    >
      <div className="grid grid-cols-2 gap-2 rounded-pill border border-ink-8 bg-paper-raised/60 p-1">
        <Button size="compact" variant={tab === 'password' ? 'primary' : 'ghost'} aria-pressed={tab === 'password'} onClick={() => setTab('password')}>
          Password
        </Button>
        <Button size="compact" variant={tab === 'otp' ? 'primary' : 'ghost'} aria-pressed={tab === 'otp'} onClick={() => setTab('otp')}>
          Email code
        </Button>
      </div>

      {tab === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="grid gap-5">
          <InputField label="Email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          <InputField label="Password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" />
          {error ? <FormNotice>error / {error}</FormNotice> : null}
          <Button type="submit" fullWidth disabled={isLoading}>{isLoading ? 'Signing in…' : 'Sign in'}</Button>
          <Link className="pv-focusable justify-self-center rounded-pill font-mono text-micro text-violet-deep" to={ROUTES.FORGOT_PASSWORD}>Forgot password?</Link>
        </form>
      ) : otpStep === 'request' ? (
        <form onSubmit={handleRequestOtp} className="grid gap-5">
          <InputField label="Email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          {error ? <FormNotice>error / {error}</FormNotice> : null}
          <Button type="submit" fullWidth disabled={isLoading}>{isLoading ? 'Sending code…' : 'Send login code'}</Button>
        </form>
      ) : (
        <form onSubmit={handleOtpLogin} className="grid gap-5">
          <p className="font-mono text-micro text-ink-45">delivery / {email}</p>
          <InputField label="Login code" type="text" required inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="123456" autoFocus />
          {error ? <FormNotice>error / {error}</FormNotice> : null}
          <Button type="submit" fullWidth disabled={isLoading}>{isLoading ? 'Signing in…' : 'Sign in'}</Button>
          <Button variant="ghost" fullWidth onClick={() => setOtpStep('request')}>Use a different email</Button>
        </form>
      )}
    </AuthShell>
  );
}
