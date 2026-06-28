import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../stores/store';
import { verifyEmail, resendOtp, clearError, clearMessage } from '../../stores/authSlice';

export default function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error, lastMessage } = useAppSelector((s) => s.auth);

  const emailFromState = (location.state as { email?: string })?.email ?? '';
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(verifyEmail({ email, otp }));
    if (verifyEmail.fulfilled.match(result)) {
      setTimeout(() => navigate('/auth/login'), 1500);
    }
  }

  async function handleResend() {
    if (!email) return;
    dispatch(resendOtp(email));
  }

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
          {lastMessage && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#273338', color: '#9CB080' }}>
              {lastMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
            style={{ background: '#618764', color: '#273338' }}
          >
            {status === 'loading' ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={status === 'loading' || !email}
          className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ background: 'transparent', color: '#618764', border: '1px solid #618764' }}
        >
          Resend code
        </button>
      </div>
    </div>
  );
}
