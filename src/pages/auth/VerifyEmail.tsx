import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@stores/store';
import { useVerifyEmail, useResendOtp } from '@api-hooks/auth/useAuthHooks';
import { ROUTES } from '@routes/index';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAppSelector((s) => s.auth);

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOtp();

  const emailFromState = (location.state as { email?: string })?.email ?? '';
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (accessToken) navigate(ROUTES.CONTRACTS_OVERVIEW, { replace: true });
  }, [accessToken, navigate]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const result = await verifyMutation.mutateAsync({ email, otp });
    if (result.message) {
      setTimeout(() => navigate(ROUTES.LOGIN), 1500);
    }
  }

  async function handleResend() {
    if (!email) return;
    resendMutation.mutate(email);
  }

  const error = verifyMutation.error?.message || resendMutation.error?.message || null;
  const isLoading = verifyMutation.isPending || resendMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#273338' }}>
      <div className="w-full max-w-md px-8 py-10 rounded-2xl" style={{ background: '#2B5748' }}>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#9CB080' }}>
          Verify your email
        </h1>
        <p className="text-sm mb-8" style={{ color: '#618764' }}>
          Enter the 6-digit code we sent to your inbox.
        </p>

        <form onSubmit={handleVerify} className="space-y-5">
          {!emailFromState && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#9CB080' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: '#273338', color: '#9CB080', border: '1px solid #618764' }}
                placeholder="you@example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#9CB080' }}>
              Verification code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none tracking-widest"
              style={{ background: '#273338', color: '#9CB080', border: '1px solid #618764' }}
              placeholder="123456"
            />
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#273338', color: '#ff7b6b' }}>
              {error}
            </p>
          )}
          {verifyMutation.isSuccess && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#273338', color: '#9CB080' }}>
              Email verified! Redirecting to login…
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
            style={{ background: '#618764', color: '#273338' }}
          >
            {isLoading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={isLoading || !email}
          className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ background: 'transparent', color: '#618764', border: '1px solid #618764' }}
        >
          Resend code
        </button>
      </div>
    </div>
  );
}
