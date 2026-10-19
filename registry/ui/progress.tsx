'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { usePreset } from '@/components/ui/labels-context';

const progressVariants = cva('relative w-full overflow-hidden rounded-full bg-background-neutral-default', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-progress-md',
    },
  },
  defaultVariants: { size: 'md' },
});

const progressIndicatorVariants = cva('h-full rounded-full transition-[width] duration-150 motion-reduce:transition-none', {
  variants: {
    variant: {
      // Ring token: bg-primary has no dark value, so it vanished on dark surfaces. Contrast 3:1 or more against track and surface in every theme, light and dark.
      default: 'bg-general-ring-default',
      destructive: 'bg-text-destructive',
      success: 'bg-text-success',
      warning: 'bg-text-warning',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface ProgressSegment {
  value: number;
  // Segment colour, same set as the Progress variants. Every tone keeps 3:1 against the track in all themes.
  tone?: 'default' | 'success' | 'warning' | 'destructive';
  // Names the segment for assistive tech, e.g. "Done".
  label?: string;
  // Custom colour that wins over `tone`: a CSS colour (e.g. a project colour from data) or a bg- token utility such as "bg-data-project-1". Utilities must appear literally in your source so Tailwind generates them. Keep 3:1 against the track and name the segment with `label`, colour alone carries no meaning.
  color?: string;
}

const isUtilityColor = (color: string) => /^bg-[a-z0-9/-]+$/.test(color);

const segmentTone = {
  default: 'bg-general-ring-default',
  success: 'bg-text-success',
  warning: 'bg-text-warning',
  destructive: 'bg-text-destructive',
} as const;

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  /** Current value. `null`/`undefined` renders the indeterminate state (no `aria-valuenow`). */
  value?: number | null;
  // Stacked multi-segment mode: segments fill the bar left to right and replace `value`. The bar reports their sum.
  segments?: ProgressSegment[];
  /** Upper bound, default 100. */
  max?: number;
  // Shows the percentage next to the bar (Figma Label): right of it, under it, or in a bubble above/below the indicator end.
  label?: 'right' | 'bottom' | 'top-floating' | 'bottom-floating';
}

/**
 * Linear progress bar (`role="progressbar"`). Provide an accessible name via `aria-label` or
 * `aria-labelledby`. Values are clamped to `[0, max]`.
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, size, variant, value: valueProp, segments, max = 100, label, ...props }, ref) => {
    const zero = usePreset() === 'zero';
    const stacked = segments != null && segments.length > 0;
    const value = stacked ? segments.reduce((sum, seg) => sum + Math.max(seg.value, 0), 0) : valueProp;
    const determinate = value != null;
    const clamped = determinate ? Math.min(Math.max(value, 0), max) : 0;
    const percent = determinate && max > 0 ? (clamped / max) * 100 : 0;
    const bar = (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={determinate ? clamped : undefined}
        aria-valuetext={stacked && segments.some((seg) => seg.label) ? segments.map((seg) => `${seg.label ?? ''} ${seg.value}`.trim()).join(', ') : undefined}
        data-state={determinate ? (clamped >= max ? 'complete' : 'loading') : 'indeterminate'}
        className={cn(progressVariants({ size }), zero && 'rounded-tight', zero && size === 'sm' && 'h-progress-md', !label && className)}
        {...props}
      >
        {stacked ? (
          <div className="flex h-full w-full">
            {segments.map((seg, i) => (
              <div
                key={i}
                data-progress-segment=""
                className={cn(
                  'h-full shrink-0 transition-[width] duration-150 motion-reduce:transition-none',
                  seg.color ? (isUtilityColor(seg.color) ? seg.color : undefined) : segmentTone[seg.tone ?? 'default'],
                  i < segments.length - 1 && 'border-r border-solid border-background',
                )}
                style={{
                  width: `${max > 0 ? Math.min(Math.max(seg.value, 0) / max, 1) * 100 : 0}%`,
                  ...(seg.color && !isUtilityColor(seg.color) ? { backgroundColor: seg.color } : null),
                }}
              />
            ))}
          </div>
        ) : (
          <div
            data-progress-indicator=""
            className={cn(progressIndicatorVariants({ variant }), zero && 'rounded-tight', !determinate && 'w-2/5 animate-pulse motion-reduce:animate-none')}
            style={determinate ? { width: `${percent}%` } : undefined}
          />
        )}
      </div>
    );
    if (!label) return bar;
    const text = (
      <span aria-hidden="true" data-progress-label="" className="typography-ui tabular-nums text-foreground">
        {Math.round(percent)}%
      </span>
    );
    if (label === 'right') {
      return (
        <div className={cn('flex w-full items-center gap-3', className)}>
          <div className="min-w-0 flex-1">{bar}</div>
          {text}
        </div>
      );
    }
    if (label === 'bottom') {
      return (
        <div className={cn('flex w-full flex-col gap-2', className)}>
          {bar}
          <span className="self-end">{text}</span>
        </div>
      );
    }
    const floating = (
      <span
        aria-hidden="true"
        data-progress-label=""
        style={{ left: `${percent}%` }}
        className={cn(
          'absolute -translate-x-1/2 whitespace-nowrap rounded-item border border-solid border-border-default bg-background px-2 py-1 typography-caption tabular-nums text-foreground shadow-xs',
          label === 'top-floating' ? 'top-0' : 'top-4',
        )}
      >
        {Math.round(percent)}%
      </span>
    );
    return (
      <div className={cn('relative w-full', label === 'top-floating' ? 'pt-9' : 'pb-9', className)}>
        {bar}
        {floating}
      </div>
    );
  },
);
Progress.displayName = 'Progress';

export { Progress, progressIndicatorVariants, progressVariants };
