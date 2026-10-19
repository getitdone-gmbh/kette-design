'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { usePreset } from '@/components/ui/labels-context';

// Figma "Progress circle" Type=Progress: Size xxs|xs|sm|md|lg, Shape Circle|Half circle, Label False|True.
// Diameters land on the spacing scale (64, 160, 192, 240, 288); the stroke scales with the size.
const progressCircleVariants = cva('relative inline-flex shrink-0 items-center justify-center', {
  variants: {
    size: {
      xxs: 'h-16 w-16',
      xs: 'h-40 w-40',
      sm: 'h-48 w-48',
      md: 'h-60 w-60',
      lg: 'h-72 w-72',
    },
    shape: {
      circle: '',
      half: '',
    },
  },
  compoundVariants: [
    { shape: 'half', size: 'xxs', className: 'h-8' },
    { shape: 'half', size: 'xs', className: 'h-20' },
    { shape: 'half', size: 'sm', className: 'h-24' },
    { shape: 'half', size: 'md', className: 'h-32' },
    { shape: 'half', size: 'lg', className: 'h-36' },
  ],
  defaultVariants: { size: 'md', shape: 'circle' },
});

const strokeBySize = { xxs: 12, xs: 10, sm: 8, md: 8, lg: 8 } as const;

const labelBySize = {
  xxs: 'typography-ui',
  xs: 'typography-ui-lg-semibold',
  sm: 'typography-ui-lg-semibold',
  md: 'typography-subheading',
  lg: 'typography-subheading',
} as const;

export interface ProgressArcProps extends React.SVGAttributes<SVGSVGElement> {
  // Percentage 0..100 of the arc that is filled.
  percent: number;
  shape?: 'circle' | 'half';
  strokeWidth?: number;
  trackClassName?: string;
  indicatorClassName?: string;
  // Arc ends. `round` by default, `butt` (flat) in the zero preset. Set it to override.
  linecap?: 'round' | 'butt';
}

// Decorative arc shared by ProgressCircle and ScoreRing. pathLength=100 lets the dash array use percent directly.
export const ProgressArc = ({
  percent,
  shape = 'circle',
  strokeWidth = 10,
  trackClassName,
  indicatorClassName,
  linecap,
  className,
  ...props
}: ProgressArcProps) => {
  const zero = usePreset() === 'zero';
  const strokeLinecap = linecap ?? (zero ? 'butt' : 'round');
  const clamped = Math.min(Math.max(percent, 0), 100);
  const half = shape === 'half';
  const radius = 50 - strokeWidth / 2;
  const path = half
    ? `M ${strokeWidth / 2} 50 A ${radius} ${radius} 0 0 1 ${100 - strokeWidth / 2} 50`
    : `M 50 ${strokeWidth / 2} A ${radius} ${radius} 0 1 1 49.99 ${strokeWidth / 2}`;
  return (
    <svg
      viewBox={half ? '0 0 100 50' : '0 0 100 100'}
      aria-hidden="true"
      focusable="false"
      className={cn('h-full w-full', className)}
      {...props}
    >
      <path d={path} pathLength={100} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} className={cn('text-background-neutral-default', trackClassName)} />
      {clamped > 0 && (
        <path
          d={path}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          strokeDasharray={`${clamped} 100`}
          data-progress-indicator=""
          className={cn('text-primary transition-[stroke-dasharray] duration-150 motion-reduce:transition-none', indicatorClassName)}
        />
      )}
    </svg>
  );
};

export interface ProgressCircleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof progressCircleVariants> {
  // Current value, clamped to [0, max]. null/undefined renders without aria-valuenow.
  value?: number | null;
  max?: number;
  variant?: 'default' | 'destructive';
  // Shows the percentage in the middle (circle) or below the arc (half circle).
  showLabel?: boolean;
  // Replaces the default "{percent}%" text when showLabel is set.
  label?: React.ReactNode;
}

const ProgressCircle = React.forwardRef<HTMLDivElement, ProgressCircleProps>(
  ({ className, size, shape, variant = 'default', value, max = 100, showLabel = false, label, ...props }, ref) => {
    const resolvedSize = size ?? 'md';
    const determinate = value != null;
    const clamped = determinate ? Math.min(Math.max(value, 0), max) : 0;
    const percent = determinate && max > 0 ? (clamped / max) * 100 : 0;
    const half = shape === 'half';
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={determinate ? clamped : undefined}
        data-state={determinate ? (clamped >= max ? 'complete' : 'loading') : 'indeterminate'}
        className={cn(progressCircleVariants({ size, shape }), className)}
        {...props}
      >
        <ProgressArc
          percent={percent}
          shape={half ? 'half' : 'circle'}
          strokeWidth={strokeBySize[resolvedSize]}
          indicatorClassName={variant === 'destructive' ? 'text-text-destructive' : undefined}
        />
        {showLabel && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute flex items-center justify-center text-foreground tabular-nums',
              half ? 'inset-x-0 bottom-0' : 'inset-0',
              labelBySize[resolvedSize],
            )}
          >
            {label ?? `${Math.round(percent)}%`}
          </span>
        )}
      </div>
    );
  },
);
ProgressCircle.displayName = 'ProgressCircle';

export { ProgressCircle, progressCircleVariants };
