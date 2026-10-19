'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Check, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { useLabels, usePreset } from '@/components/ui/labels-context';

const stepMarkerVariants = cva('inline-flex shrink-0 select-none items-center justify-center rounded-full border border-solid tabular-nums', {
  variants: {
    state: {
      upcoming: 'border-input bg-background text-text-subtle',
      current: 'border-background-brand-bold-default bg-background-brand-bold-default text-text-on-brand',
      complete: 'border-general-success-container bg-general-success-container text-general-success-on-container',
      error: 'border-general-error-default bg-general-error-default text-general-error-on',
    },
    // Product preset (DesignSystemProvider `preset`).
    preset: { default: '', zero: '' },
    size: {
      sm: 'h-icon-md w-icon-md typography-micro-medium [&>svg]:h-icon-2xs [&>svg]:w-icon-2xs',
      md: 'h-stepper-marker w-stepper-marker typography-ui-semibold [&>svg]:h-icon-sm [&>svg]:w-icon-sm',
      lg: 'h-avatar-sm w-avatar-sm typography-ui-semibold [&>svg]:h-icon-md [&>svg]:w-icon-md',
    },
  },
  compoundVariants: [
    // Zero: 1px border, done is the brand fill, current is a brand outline with a 3px soft halo.
    { preset: 'zero', state: 'current', className: 'bg-background text-text-brand ring-[3px] ring-background-brand-subtle' },
    { preset: 'zero', state: 'complete', className: 'border-background-brand-bold-default bg-background-brand-bold-default text-text-on-brand' },
  ],
  defaultVariants: { state: 'upcoming', size: 'md', preset: 'default' },
});

export interface StepMarkerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>, Omit<VariantProps<typeof stepMarkerVariants>, 'preset'> {
  // The step number or short text shown in `upcoming` and `current`. `complete` shows a check, `error` a cross.
  step: number | string;
  // Screen reader texts for the check and cross. Win over the provider text.
  completedLabel?: string;
  failedLabel?: string;
}

// Numbered step marker for lists and flows outside Stepper (onboarding checklists, process lists). The number stays visible text.
const StepMarker = React.forwardRef<HTMLSpanElement, StepMarkerProps>(({ className, state, size, step, completedLabel, failedLabel, ...props }, ref) => {
  const l = useLabels({ stepCompleted: completedLabel, stepFailed: failedLabel });
  const resolved = state ?? 'upcoming';
  const zero = usePreset() === 'zero';
  return (
    <span
      ref={ref}
      data-state={resolved}
      aria-current={resolved === 'current' ? 'step' : undefined}
      className={cn(stepMarkerVariants({ state: resolved, size, preset: zero ? 'zero' : 'default' }), className)}
      {...props}
    >
      {resolved === 'complete' ? (
        <>
          <Check aria-hidden="true" />
          <span className="sr-only">{`${step}, ${l.stepCompleted}`}</span>
        </>
      ) : resolved === 'error' ? (
        <>
          <X aria-hidden="true" />
          <span className="sr-only">{`${step}, ${l.stepFailed}`}</span>
        </>
      ) : (
        step
      )}
    </span>
  );
});
StepMarker.displayName = 'StepMarker';

export { StepMarker, stepMarkerVariants };
