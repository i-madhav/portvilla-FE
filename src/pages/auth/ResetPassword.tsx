import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@routes/index';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return;
    // TODO: wire up to reset-password API when ready
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#273338' }}>
        <div className="w-full max-w-md px-8 py-10 rounded-2xl text-center" style={{ background: '#2B5748' }}>
          <h1 className="text-2xl font-semibold mb-3" style={{ color: '#9CB080' }}>
            Password reset
          </h1>
          <p className="text-sm mb-6" style={{ color: '#618764' }}>
            Your password has been successfully reset.
          </p>
          <Link
            to={ROUTES.LOGIN}
            className="inline-block text-xs underline"
            style={{ color: '#9CB080' }}
          >
            Sign in with your new password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#273338' }}>
      <div className="w-full max-w-md px-8 py-10 rounded-2xl" style={{ background: '#2B5748' }}>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#9CB080' }}>
          Set new password
        </h1>
        <p className="text-sm mb-8" style={{ color: '#618764' }}>
          Choose a strong password for your account.
        </p>

        {!token && (
          <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: '#273338', color: '#ff7b6b' }}>
            Invalid or missing reset token. Please request a new reset link.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#9CB080' }}>
              New password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#273338', color: '#9CB080', border: '1px solid #618764' }}
              placeholder="Min 8 chars, upper, lower, digit, symbol"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#9CB080' }}>
              Confirm password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#273338', color: '#9CB080', border: '1px solid #618764' }}
              placeholder="Repeat your password"
            />
          </div>

          {confirm && password !== confirm && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#273338', color: '#ff7b6b' }}>
              Passwords do not match.
            </p>
          )}

          <button
            type="submit"
            disabled={!token || !password || !confirm || password !== confirm}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
            style={{ background: '#618764', color: '#273338' }}
          >
            Reset password
          </button>
        </form>

        <p className="text-xs mt-6 text-center" style={{ color: '#618764' }}>
          <Link to={ROUTES.LOGIN} className="underline" style={{ color: '#9CB080' }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
