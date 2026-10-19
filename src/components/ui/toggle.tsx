'use client';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';
import { usePreset } from './labels-context';

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-control transition-[color,background-color,border-color,box-shadow] duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-focus focus-visible:ring-offset-focus focus-visible:ring-offset-background focus-visible:ring-ring-default disabled:pointer-events-none disabled:opacity-disabled data-[state=on]:bg-muted data-[state=on]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-solid border-input bg-background shadow-xs hover:border-border-bold hover:bg-background data-[state=on]:bg-muted',
      },
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-2',
        lg: 'h-10 px-3',
      },
      // Product preset (DesignSystemProvider `preset`): `zero` binds the heights to the control tokens and the label to the button roles.
      preset: { default: 'text-sm font-medium', zero: '' },
    },
    compoundVariants: [
      { preset: 'zero', size: 'default', className: 'h-control-md typography-button-md' },
      { preset: 'zero', size: 'sm', className: 'h-control-sm typography-button-sm' },
      { preset: 'zero', size: 'lg', className: 'h-control-lg typography-button-md' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      preset: 'default',
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & Omit<VariantProps<typeof toggleVariants>, 'preset'>
>(({ className, variant, size, ...props }, ref) => {
  const zero = usePreset() === 'zero';
  return <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, preset: zero ? 'zero' : 'default', className }))} {...props} />;
});

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
