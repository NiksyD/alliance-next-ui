import React from 'react';
import { cn } from '@/lib/utils/cn';

export type BadgeVariant =
  'verified' | 'live' | 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  pulse?: boolean;
};

export function Badge({
  className,
  variant = 'neutral',
  pulse = false,
  children,
  ...props
}: BadgeProps): React.ReactElement {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide select-none';

  const variants: Record<BadgeVariant, string> = {
    verified:
      'bg-[var(--uc-gold-container)] text-[var(--uc-gold-deep)] border border-[var(--uc-gold)]/40',
    live: 'bg-red-50 text-red-700 border border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary:
      'bg-[var(--uc-blue-container)] text-[var(--uc-blue-deep)] border border-[var(--uc-blue)]/30',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
}
