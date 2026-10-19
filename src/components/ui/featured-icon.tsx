'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

// Tinted tile around an icon. DialogFeaturedIcon stays the modal header variant, this one is general (empty states, list rows, cards).
const featuredIconVariants = cva('inline-grid shrink-0 place-items-center', {
  variants: {
    tone: {
      neutral: 'bg-muted text-icon-default',
      brand: 'bg-general-brand-container text-general-brand-on-container',
      success: 'bg-general-success-container text-general-success-on-container',
      warning: 'bg-general-warning-container text-general-warning-on-container',
      destructive: 'bg-general-destructive-container text-general-destructive-on-container',
      info: 'bg-general-info-container text-general-info-on-container',
    },
    size: {
      sm: 'h-control-md w-control-md [&>svg]:h-icon-sm [&>svg]:w-icon-sm',
      md: 'h-control-xl w-control-xl [&>svg]:h-icon-md [&>svg]:w-icon-md',
      lg: 'h-control-2xl w-control-2xl [&>svg]:h-icon-lg [&>svg]:w-icon-lg',
    },
    shape: {
      circle: 'rounded-full',
      square: 'rounded-surface',
    },
  },
  defaultVariants: { tone: 'neutral', size: 'md', shape: 'circle' },
});

export interface FeaturedIconProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof featuredIconVariants> {
  // Accessible name when the icon carries meaning. Without it the icon is decorative and hidden from assistive technology.
  label?: string;
}

const FeaturedIcon = React.forwardRef<HTMLSpanElement, FeaturedIconProps>(({ className, tone, size, shape, label, ...props }, ref) => (
  <span
    ref={ref}
    {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    className={cn(featuredIconVariants({ tone, size, shape }), className)}
    {...props}
  />
));
FeaturedIcon.displayName = 'FeaturedIcon';

export { FeaturedIcon, featuredIconVariants };
