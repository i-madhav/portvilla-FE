import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';

interface FieldChromeProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}

function FieldChrome({ id, label, hint, error, children }: FieldChromeProps) {
  const messageId = `${id}-message`;
  return (
    <div className="grid gap-2">
      <label className="font-mono text-label uppercase text-ink-45" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={messageId} className="font-mono text-micro text-ink">
          error / {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-micro text-ink-45">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
}

export function InputField({ id, label, hint, error, className, type, ...props }: InputFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = error || hint ? `${fieldId}-message` : undefined;
  const isPassword = type === 'password';
  const [revealed, setRevealed] = useState(false);

  const input = (
    <input
      id={fieldId}
      type={isPassword ? (revealed ? 'text' : 'password') : type}
      className={['pv-field', isPassword ? 'pr-20' : '', className ?? ''].join(' ')}
      aria-invalid={error ? true : undefined}
      aria-describedby={messageId}
      {...props}
    />
  );

  return (
    <FieldChrome id={fieldId} label={label} hint={hint} error={error}>
      {isPassword ? (
        <div className="relative">
          {input}
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="pv-focusable absolute inset-y-0 right-0 flex items-center rounded-r-tile px-4 font-mono text-micro uppercase tracking-wide text-ink-45 transition hover:text-ink"
          >
            {revealed ? 'Hide' : 'Show'}
          </button>
        </div>
      ) : (
        input
      )}
    </FieldChrome>
  );
}
