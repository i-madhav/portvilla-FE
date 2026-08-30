import type { HTMLAttributes, ReactNode } from 'react';

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  kind?: 'card' | 'stage';
}

export function Surface({ children, kind = 'card', className, ...props }: SurfaceProps) {
  const surfaceClass = kind === 'stage' ? 'surface-stage' : 'surface-glass';
  return (
    <section className={[surfaceClass, className ?? ''].join(' ')} {...props}>
      {children}
    </section>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return <p className="meta text-violet">{children}</p>;
}

export function FormNotice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-tile border border-ink-12 bg-ink-8 px-4 py-3 font-mono text-micro text-ink">
      {children}
    </p>
  );
}
