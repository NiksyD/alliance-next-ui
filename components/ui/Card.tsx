import React from 'react';
import { cn } from '@/lib/utils/cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hoverEffect?: boolean;
};

export function Card({
  className,
  hoverEffect = false,
  children,
  ...props
}: CardProps): React.ReactElement {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xs transition-all duration-200',
        hoverEffect &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-[var(--uc-blue-light)] hover:shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-5 pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.ReactElement {
  return (
    <h3
      className={cn(
        'font-sans text-lg font-bold tracking-tight text-slate-900 sm:text-xl',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.ReactElement {
  return (
    <p className={cn('text-sm text-slate-500', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div className={cn('p-5 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-t border-slate-100 p-5 pt-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
