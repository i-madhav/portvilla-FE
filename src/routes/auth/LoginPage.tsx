import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../stores/store';
import {
  login,
  requestLoginOtp,
  loginWithOtp,
  clearError,
  clearMessage,
} from '../../stores/authSlice';

type Tab = 'password' | 'otp';
type OtpStep = 'request' | 'verify';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, lastMessage } = useAppSelector((s) => s.auth);

  const [tab, setTab] = useState<Tab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('request');

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
    setOtpStep('request');
    setOtp('');
  }, [dispatch, tab]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) navigate('/');
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(requestLoginOtp(email));
    if (requestLoginOtp.fulfilled.match(result)) setOtpStep('verify');
  }

  async function handleOtpLogin(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(loginWithOtp({ email, otp }));
    if (loginWithOtp.fulfilled.match(result)) navigate('/');
  }

  const tabStyle = (active: boolean) => ({
    color: active ? '#9CB080' : '#618764',
    borderBottom: active ? '2px solid #9CB080' : '2px solid transparent',
    background: 'transparent',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    transition: 'color 0.15s',
  });

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#273338' }}>
      <div className="w-full max-w-md px-8 py-10 rounded-2xl" style={{ background: '#2B5748' }}>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#9CB080' }}>
          Welcome back
        </h1>
        <p className="text-sm mb-6" style={{ color: '#618764' }}>
          Sign in to your Portvilla account.
        </p>

        {/* Tabs */}
        <div className="flex mb-6" style={{ borderBottom: '1px solid #618764' }}>
          <button style={tabStyle(tab === 'password')} onClick={() => setTab('password')}>
            Password
          </button>
          <button style={tabStyle(tab === 'otp')} onClick={() => setTab('otp')}>
            Email code
          </button>
        </div>

        {/* Password tab */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-5">
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
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#9CB080' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: '#273338', color: '#9CB080', border: '1px solid #618764' }}
                placeholder="Your password"
              />
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#273338', color: '#ff7b6b' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
              style={{ background: '#618764', color: '#273338' }}
            >
              {status === 'loading' ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        {/* OTP tab */}
        {tab === 'otp' && otpStep === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
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

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#273338', color: '#ff7b6b' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
              style={{ background: '#618764', color: '#273338' }}
            >
              {status === 'loading' ? 'Sending code…' : 'Send login code'}
            </button>
          </form>
        )}

        {tab === 'otp' && otpStep === 'verify' && (
          <form onSubmit={handleOtpLogin} className="space-y-5">
            <p className="text-xs" style={{ color: '#618764' }}>
              Code sent to <span style={{ color: '#9CB080' }}>{email}</span>
            </p>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#9CB080' }}>
                Login code
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
                autoFocus
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
              {status === 'loading' ? 'Signing in…' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => setOtpStep('request')}
              className="w-full py-2 text-xs"
              style={{ color: '#618764', background: 'transparent' }}
            >
              ← Use a different email
            </button>
          </form>
        )}

        <p className="text-xs mt-6 text-center" style={{ color: '#618764' }}>
          Don't have an account?{' '}
          <Link to="/auth/register" className="underline" style={{ color: '#9CB080' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
