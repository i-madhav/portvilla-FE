import { useState, useRef, useEffect } from 'react';
import { submitWaitlist } from '../lib/waitlistApi';
import { FONT } from '../lib/constants';

interface WaitlistPanelProps {
  visible   : boolean;
  onDismiss?: () => void;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function WaitlistPanel({ visible, onDismiss }: WaitlistPanelProps) {
  const [email,     setEmail    ] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [mounted,   setMounted  ] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 700);
      return () => clearTimeout(t);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && formState === 'idle') {
      const t = setTimeout(() => inputRef.current?.focus(), 720);
      return () => clearTimeout(t);
    }
  }, [visible, formState]);

  /* Close on Escape */
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onDismiss]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || formState === 'submitting') return;
    setFormState('submitting');
    try {
      await submitWaitlist(email.trim());
      setFormState('success');
    } catch {
      setFormState('error');
    }
  };

  if (!mounted) return null;

  const entered = visible;

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Backdrop */}
      <div
        onClick={onDismiss}
        style={{
          position     : 'fixed',
          inset        : 0,
          zIndex       : 48,
          background   : 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity      : entered ? 1 : 0,
          transition   : 'opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: entered ? 'auto' : 'none',
        }}
      />

      {/* Card wrapper — centered */}
      <div
        style={{
          position     : 'fixed',
          inset        : 0,
          zIndex       : 49,
          display      : 'flex',
          alignItems   : 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width        : 'clamp(300px, 34vw, 400px)',
            pointerEvents: entered ? 'auto' : 'none',
            opacity      : entered ? 1 : 0,
            transform    : entered
              ? 'translateY(0) scale(1)'
              : 'translateY(28px) scale(0.93)',
            transition   : [
              'opacity 0.60s cubic-bezier(0.16, 1, 0.3, 1)',
              'transform 0.60s cubic-bezier(0.16, 1, 0.3, 1)',
            ].join(', '),
          }}
        >
          {/* Glass card */}
          <div style={{
            padding        : '24px 24px 22px',
            borderRadius   : 18,
            background     : 'rgba(10, 14, 20, 0.72)',
            backdropFilter : 'blur(20px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
            border         : '1px solid rgba(255,255,255,0.10)',
            boxShadow      : [
              '0 8px 48px rgba(0,0,0,0.55)',
              '0 0 0 1px rgba(255,255,255,0.04) inset',
              '0 1px 0 rgba(255,255,255,0.08) inset',
            ].join(', '),
          }}>

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <Label text="EARLY ACCESS" />
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  style={{
                    flexShrink   : 0,
                    marginLeft   : 12,
                    marginTop    : -2,
                    width        : 24,
                    height       : 24,
                    borderRadius : '50%',
                    border       : '1px solid rgba(255,255,255,0.10)',
                    background   : 'rgba(255,255,255,0.06)',
                    color        : 'rgba(255,255,255,0.35)',
                    display      : 'flex',
                    alignItems   : 'center',
                    justifyContent: 'center',
                    cursor       : 'pointer',
                    fontSize     : '0.65rem',
                    lineHeight   : 1,
                    padding      : 0,
                    transition   : 'background 0.18s ease, color 0.18s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color      = 'rgba(255,255,255,0.65)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color      = 'rgba(255,255,255,0.35)';
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <p style={{
              margin       : '4px 0 18px',
              color        : 'rgba(255,255,255,0.55)',
              fontSize     : '0.72rem',
              fontFamily   : FONT,
              letterSpacing: '0.04em',
              lineHeight   : 1.5,
            }}>
              Join the waitlist — be the first to experience Portvilla.
            </p>

            {formState !== 'success' ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  ref={inputRef}
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={formState === 'submitting'}
                  style={{
                    width          : '100%',
                    boxSizing      : 'border-box',
                    padding        : '10px 14px',
                    borderRadius   : 10,
                    border         : '1px solid rgba(255,255,255,0.14)',
                    background     : 'rgba(255,255,255,0.06)',
                    color          : '#fff',
                    fontSize       : '0.82rem',
                    fontFamily     : FONT,
                    letterSpacing  : '0.03em',
                    outline        : 'none',
                    transition     : 'border-color 0.2s ease, background 0.2s ease',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.32)';
                    e.currentTarget.style.background  = 'rgba(255,255,255,0.10)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
                    e.currentTarget.style.background  = 'rgba(255,255,255,0.06)';
                  }}
                />

                {formState === 'error' && (
                  <p style={{
                    margin    : 0,
                    color     : 'rgba(255,100,100,0.85)',
                    fontSize  : '0.68rem',
                    fontFamily: FONT,
                  }}>
                    Something went wrong. Please try again.
                  </p>
                )}

                <SubmitButton loading={formState === 'submitting'} />
              </form>
            ) : (
              <SuccessState />
            )}

          </div>
        </div>
      </div>
    </>
  );
}

function Label({ text }: { text: string }) {
  return (
    <p style={{
      margin       : '0 0 2px',
      color        : 'rgba(255,255,255,0.35)',
      fontSize     : '0.62rem',
      fontFamily   : FONT,
      fontWeight   : 700,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
    }}>
      {text}
    </p>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        padding       : '10px 0',
        borderRadius  : 10,
        border        : 'none',
        background    : loading
          ? 'rgba(255,255,255,0.10)'
          : 'rgba(255,255,255,0.92)',
        color         : loading ? 'rgba(255,255,255,0.5)' : '#0a0e14',
        fontSize      : '0.78rem',
        fontFamily    : FONT,
        fontWeight    : 700,
        letterSpacing : '0.14em',
        textTransform : 'uppercase',
        cursor        : loading ? 'not-allowed' : 'pointer',
        transition    : 'background 0.2s ease, color 0.2s ease, transform 0.15s ease',
        width         : '100%',
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {loading ? 'Joining…' : 'Join Waiting List'}
    </button>
  );
}

function SuccessState() {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
      <div style={{
        width         : 40,
        height        : 40,
        borderRadius  : '50%',
        border        : '1.5px solid rgba(255,255,255,0.3)',
        display       : 'flex',
        alignItems    : 'center',
        justifyContent: 'center',
        margin        : '0 auto 14px',
        animation     : 'successPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 9l4 4 6-7" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p style={{
        margin       : '0 0 4px',
        color        : '#fff',
        fontSize     : '0.85rem',
        fontFamily   : FONT,
        fontWeight   : 700,
        letterSpacing: '0.06em',
      }}>
        You're on the list.
      </p>
      <p style={{
        margin       : 0,
        color        : 'rgba(255,255,255,0.45)',
        fontSize     : '0.70rem',
        fontFamily   : FONT,
        letterSpacing: '0.03em',
        lineHeight   : 1.5,
      }}>
        We'll reach out when Portvilla opens.
      </p>
    </div>
  );
}

const KEYFRAMES = `
  @keyframes successPop {
    from { opacity: 0; transform: scale(0.6); }
    to   { opacity: 1; transform: scale(1); }
  }
`;
