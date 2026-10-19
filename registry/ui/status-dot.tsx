import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Full class strings so Tailwind's content scan finds every status token.
const statusDotVariants = cva('inline-block shrink-0 rounded-full', {
  variants: {
    tone: {
      success: 'bg-status-success-dot',
      warning: 'bg-status-warning-dot',
      destructive: 'bg-status-destructive-dot',
      info: 'bg-status-info-dot',
      // Credit and billing status (data/status-credit).
      credit: 'bg-data-status-credit-dot',
      neutral: 'bg-text-subtlest',
    },
    // sm is the 6px status-dot token, md 8px.
    size: {
      sm: 'h-status-dot w-status-dot',
      md: 'h-2 w-2',
    },
  },
  defaultVariants: { tone: 'neutral', size: 'sm' },
});

export interface StatusDotProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>, VariantProps<typeof statusDotVariants> {
  // Text for screen readers. The colour alone must never carry the meaning, so without a label the dot is decorative (aria-hidden) and a visible text must sit next to it.
  label?: string;
}

// Small standalone status indicator. Use it beside a visible status text, or pass `label` when it stands alone.
const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(({ className, tone, size, label, ...props }, ref) => (
  <span
    ref={ref}
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    data-tone={tone ?? 'neutral'}
    className={cn(statusDotVariants({ tone, size }), className)}
    {...props}
  />
));
StatusDot.displayName = 'StatusDot';

export type StatusDotTone = NonNullable<VariantProps<typeof statusDotVariants>['tone']>;

export { StatusDot, statusDotVariants };
