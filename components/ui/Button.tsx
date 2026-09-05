import React from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  ...props
}: ButtonProps): React.ReactElement {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none cursor-pointer';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-[var(--uc-blue)] text-white hover:bg-[var(--uc-blue-deep)] shadow-sm hover:shadow focus-visible:ring-[var(--uc-blue)]',
    accent:
      'bg-[var(--uc-gold)] text-slate-900 hover:bg-[var(--uc-gold-deep)] hover:text-white shadow-sm hover:shadow focus-visible:ring-[var(--uc-gold)]',
    outline:
      'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300',
    danger:
      'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow focus-visible:ring-red-500',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'text-xs h-8 px-3 rounded-md gap-1.5',
    md: 'text-sm h-10 px-4 rounded-lg gap-2',
    lg: 'text-base h-12 px-6 rounded-xl gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
        {children}
      </span>
      {!isLoading && rightIcon}
    </button>
  );
}
