import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@routes/index';

/**
 * Dev-only page to trigger and inspect error states in the application.
 * Will be removed before production.
 */
export function ErrorTestPage() {
  const [throwError, setThrowError] = useState(false);

  if (throwError) {
    throw new Error('Test error from ErrorTestPage');
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#273338' }}>
      <div className="w-full max-w-md px-8 py-10 rounded-2xl" style={{ background: '#2B5748' }}>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#9CB080' }}>
          Error test page
        </h1>
        <p className="text-sm mb-8" style={{ color: '#618764' }}>
          Use this page to test error boundaries and error handling.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setThrowError(true)}
            className="w-full py-2.5 rounded-lg text-sm font-medium"
            style={{ background: '#618764', color: '#273338' }}
          >
            Simulate render error
          </button>

          <button
            onClick={() => {
              fetch('https://httpstat.us/500').catch(() => {});
            }}
            className="w-full py-2.5 rounded-lg text-sm font-medium"
            style={{ background: '#273338', color: '#ff7b6b', border: '1px solid #ff7b6b' }}
          >
            Trigger 500 fetch
          </button>
        </div>

        <p className="text-xs mt-6 text-center" style={{ color: '#618764' }}>
          <Link to={ROUTES.LOGIN} className="underline" style={{ color: '#9CB080' }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
