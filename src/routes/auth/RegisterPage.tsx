import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../stores/store';
import { register, clearError, clearMessage } from '../../stores/authSlice';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, lastMessage } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearMessage());
  }, [dispatch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await dispatch(register({ email, password }));
    if (register.fulfilled.match(result)) {
      navigate('/auth/verify-email', { state: { email } });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#273338' }}>
      <div className="w-full max-w-md px-8 py-10 rounded-2xl" style={{ background: '#2B5748' }}>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#9CB080' }}>
          Create account
        </h1>
        <p className="text-sm mb-8" style={{ color: '#618764' }}>
          Join Portvilla today.
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
              style={{
                background: '#273338',
                color: '#9CB080',
                border: '1px solid #618764',
              }}
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
              style={{
                background: '#273338',
                color: '#9CB080',
                border: '1px solid #618764',
              }}
              placeholder="Min 8 chars, upper, lower, digit, symbol"
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
            {status === 'loading' ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-xs mt-6 text-center" style={{ color: '#618764' }}>
          Already have an account?{' '}
          <Link to="/auth/login" className="underline" style={{ color: '#9CB080' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
