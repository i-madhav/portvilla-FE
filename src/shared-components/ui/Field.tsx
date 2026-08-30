import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

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

export function InputField({ id, label, hint, error, className, ...props }: InputFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const messageId = error || hint ? `${fieldId}-message` : undefined;
  return (
    <FieldChrome id={fieldId} label={label} hint={hint} error={error}>
      <input
        id={fieldId}
        className={['pv-field', className ?? ''].join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        {...props}
      />
    </FieldChrome>
  );
}
