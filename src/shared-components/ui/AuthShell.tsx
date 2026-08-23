import type { ReactNode } from 'react';
import { Brand } from './Brand';
import { Surface, Badge } from './Surface';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <main className="pv-auth-ground relative grid min-h-screen place-items-center overflow-hidden px-5 py-16">
      <div className="absolute left-6 top-6 z-10 sm:left-gutter sm:top-gutter">
        <Brand />
      </div>
      <Surface className="relative z-10 grid w-full max-w-auth gap-7 p-7 sm:p-9">
        <div className="grid gap-5">
          <Badge>{eyebrow}</Badge>
          <div className="grid gap-3">
            <h1 className="text-balance text-4xl font-bold leading-none tracking-tight text-ink">{title}</h1>
            <p className="text-pretty text-body text-ink-60">{description}</p>
          </div>
        </div>
        {children}
        {footer ? <div className="border-t border-ink-8 pt-5 text-center text-micro text-ink-45">{footer}</div> : null}
      </Surface>
    </main>
  );
}
