import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResendOtp, useVerifyEmail } from '@api-hooks/auth/useAuthHooks';
import { ROUTES } from '@routes/index';
import { useAppSelector } from '@stores/store';
import { AuthShell, Button, FormNotice, InputField } from '@shared-components/ui';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAppSelector((state) => state.auth);
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOtp();
  const emailFromState = (location.state as { email?: string })?.email ?? '';
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (accessToken) navigate(ROUTES.ONBOARDING, { replace: true });
  }, [accessToken, navigate]);

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    const result = await verifyMutation.mutateAsync({ email, otp });
    if (result.message) window.setTimeout(() => navigate(ROUTES.LOGIN), 1500);
  }

  function handleResend() {
    if (email) resendMutation.mutate(email);
  }

  const error = verifyMutation.error?.message || resendMutation.error?.message || null;
  const isLoading = verifyMutation.isPending || resendMutation.isPending;

  return (
    <AuthShell
      eyebrow="02 — verify identity"
      title="Check your inbox."
      description="Enter the six-digit code sent to the account email."
    >
      <form onSubmit={handleVerify} className="grid gap-5">
        {!emailFromState ? <InputField label="Email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /> : <p className="font-mono text-micro text-ink-45">delivery / {email}</p>}
        <InputField label="Verification code" type="text" required inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="123456" />
        {error ? <FormNotice>error / {error}</FormNotice> : null}
        {verifyMutation.isSuccess ? <FormNotice>account.state / verified — redirecting</FormNotice> : null}
        <Button type="submit" fullWidth disabled={isLoading}>{isLoading ? 'Verifying…' : 'Verify email'}</Button>
        <Button variant="secondary" fullWidth onClick={handleResend} disabled={isLoading || !email}>Resend code</Button>
      </form>
    </AuthShell>
  );
}
