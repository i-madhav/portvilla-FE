import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'default' | 'compact';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-ink text-paper shadow-cta hover:bg-ink-90',
  secondary: 'border-ink-12 bg-paper-raised/80 text-ink backdrop-blur-glass hover:border-violet/45',
  ghost: 'border-transparent bg-transparent text-ink-60 hover:text-ink',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'min-h-11 px-button-x py-button-y text-sm',
  compact: 'min-h-11 px-4 py-2 text-micro',
};

function classes(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className?: string,
) {
  return [
    'pv-button pv-focusable inline-flex items-center justify-center gap-2 rounded-pill border font-sans font-semibold leading-none transition disabled:pointer-events-none disabled:opacity-45',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className ?? '',
  ].join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes(variant, size, fullWidth, className)}
      {...props}
    />
  );
}

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function ButtonLink({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={classes(variant, size, fullWidth, className)} {...props} />;
}

export interface ButtonAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function ButtonAnchor({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  className,
  ...props
}: ButtonAnchorProps) {
  return <a className={classes(variant, size, fullWidth, className)} {...props} />;
}
