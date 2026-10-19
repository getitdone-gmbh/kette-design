'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';

import { focusRing } from '@/lib/recipes';
import { cn } from '@/lib/utils';
import { useLabels, usePreset } from '@/components/ui/labels-context';

// Figma ButtonClose (2763:420129): Size sm|md|lg, Color Neutral|Brand, State Default|Hover|Focused. Theme=Light only (role bound).
const buttonCloseVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center rounded-control transition-colors',
    'disabled:pointer-events-none disabled:opacity-disabled',
    ...focusRing,
  ],
  {
    variants: {
      size: {
        sm: 'h-control-sm w-control-sm',
        md: 'h-control-md w-control-md',
        lg: 'h-control-lg w-control-lg',
      },
      color: {
        neutral: 'text-icon-subtle hover:bg-muted hover:text-icon-default',
        brand: 'text-icon-brand hover:bg-background-brand-subtle',
      },
    },
    defaultVariants: { size: 'sm', color: 'neutral' },
  },
);

export interface ButtonCloseProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonCloseVariants> {}

const ButtonClose = React.forwardRef<HTMLButtonElement, ButtonCloseProps>(
  ({ className, size, color, type = 'button', 'aria-label': ariaLabelProp, ...props }, ref) => {
    const l = useLabels();
    const zero = usePreset() === 'zero';
    const ariaLabel = ariaLabelProp ?? l.close;
    return (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel}
      className={cn(buttonCloseVariants({ size, color }), className)}
      {...props}
    >
      <X aria-hidden="true" className={size === 'lg' && !zero ? 'h-icon-lg w-icon-lg' : 'h-icon-md w-icon-md'} />
    </button>
  );
  },
);
ButtonClose.displayName = 'ButtonClose';

export { ButtonClose, buttonCloseVariants };
