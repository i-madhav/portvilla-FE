import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@routes/index';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up to forgot-password API when ready
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#273338' }}>
        <div className="w-full max-w-md px-8 py-10 rounded-2xl text-center" style={{ background: '#2B5748' }}>
          <h1 className="text-2xl font-semibold mb-3" style={{ color: '#9CB080' }}>
            Check your email
          </h1>
          <p className="text-sm mb-6" style={{ color: '#618764' }}>
            If an account exists for <span style={{ color: '#9CB080' }}>{email}</span>,
            you'll receive a password reset link shortly.
          </p>
          <Link
            to={ROUTES.LOGIN}
            className="inline-block text-xs underline"
            style={{ color: '#9CB080' }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#273338' }}>
      <div className="w-full max-w-md px-8 py-10 rounded-2xl" style={{ background: '#2B5748' }}>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#9CB080' }}>
          Reset password
        </h1>
        <p className="text-sm mb-8" style={{ color: '#618764' }}>
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-sm font-medium"
            style={{ background: '#618764', color: '#273338' }}
          >
            Send reset link
          </button>
        </form>

        <p className="text-xs mt-6 text-center" style={{ color: '#618764' }}>
          Remember your password?{' '}
          <Link to={ROUTES.LOGIN} className="underline" style={{ color: '#9CB080' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
