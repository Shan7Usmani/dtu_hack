import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive/10 text-destructive',
        success: 'border-transparent bg-success/10 text-success',
        warning: 'border-transparent bg-warning/10 text-warning',
        outline: 'border-border text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const TONE_VARIANT = {
  neutral: 'outline',
  info: 'default',
  success: 'success',
  warning: 'warning',
  danger: 'destructive',
};

function Badge({ className, variant = 'default', ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Badge with a leading state dot. `tone` is semantic: success | warning | danger | neutral. */
function StatusBadge({ tone = 'neutral', dot = true, className, children, ...props }) {
  const dotTone = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive',
    neutral: 'bg-muted-foreground',
  }[tone] || 'bg-muted-foreground';

  return (
    <Badge variant={TONE_VARIANT[tone] || 'outline'} className={className} {...props}>
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', dotTone)} aria-hidden="true" />}
      {children}
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants };
