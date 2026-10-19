'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, CircleDot, CloudOff, Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { useLabels, usePreset } from '@/components/ui/labels-context';

const autosaveStatusVariants = cva('inline-flex items-center gap-1 typography-ui-sm', {
  variants: {
    state: {
      saved: 'text-text-subtle-on-muted',
      saving: 'text-text-subtle-on-muted',
      dirty: 'text-text-subtle-on-muted',
      error: 'text-text-destructive',
      offline: 'text-text-subtle-on-muted',
    },
  },
  defaultVariants: { state: 'saved' },
});

export type AutosaveState = NonNullable<VariantProps<typeof autosaveStatusVariants>['state']>;

const iconClass: Record<AutosaveState, string> = {
  saved: 'text-icon-success',
  saving: 'text-icon-subtle motion-safe:animate-spin',
  dirty: 'text-icon-warning',
  error: 'text-icon-destructive',
  offline: 'text-icon-subtle',
};

const icons: Record<AutosaveState, typeof CheckCircle2> = {
  saved: CheckCircle2,
  saving: Loader2,
  dirty: CircleDot,
  error: AlertCircle,
  offline: CloudOff,
};

export interface AutosaveStatusProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof autosaveStatusVariants> {
  /** Replaces the default English label of the current state. */
  label?: React.ReactNode;
}

// Polite live region so assistive tech announces state changes without stealing focus.
const AutosaveStatus = React.forwardRef<HTMLSpanElement, AutosaveStatusProps>(
  ({ className, state = 'saved', label, ...props }, ref) => {
    const l = useLabels();
    const current: AutosaveState = state ?? 'saved';
    const Icon = icons[current];
    // Zero: 16px icon and the control gap.
    const zero = usePreset() === 'zero';
    return (
      <span
        ref={ref}
        role="status"
        aria-live="polite"
        data-state={current}
        className={cn(autosaveStatusVariants({ state: current }), zero && 'gap-gap-control', className)}
        {...props}
      >
        <Icon className={cn('shrink-0', zero ? 'h-icon-md w-icon-md' : 'h-icon-xs w-icon-xs', iconClass[current])} aria-hidden />
        <span>{label ?? l.autosaveStates[current]}</span>
      </span>
    );
  },
);
AutosaveStatus.displayName = 'AutosaveStatus';

export { AutosaveStatus, autosaveStatusVariants };
