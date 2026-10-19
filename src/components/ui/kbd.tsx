'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';
import { usePreset } from './labels-context';

// Figma "_Command shortcut" (Size md | sm). md is the established 28px key, sm the 20px compact key.
const kbdVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-item border border-solid border-hairline bg-muted font-sans text-muted-foreground',
  {
    variants: {
      // Product preset (DesignSystemProvider `preset`): `zero` uses the 4px radius and the default border, and the compact key unless a size is set.
      preset: { default: '', zero: '' },
      size: {
        md: 'h-control-sm px-2 typography-ui',
        sm: 'h-kbd px-1 typography-micro',
      },
    },
    compoundVariants: [{ preset: 'zero', className: 'rounded-tight border-border-default' }],
    defaultVariants: { size: 'md', preset: 'default' },
  },
);

export interface KbdProps extends React.HTMLAttributes<HTMLElement>, Omit<VariantProps<typeof kbdVariants>, 'preset'> {}

// A single key cap. Pair with `KbdGroup` for sequences such as "Cmd K then C".
const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ className, size, ...props }, ref) => {
  const zero = usePreset() === 'zero';
  return <kbd ref={ref} className={cn(kbdVariants({ size: size ?? (zero ? 'sm' : 'md'), preset: zero ? 'zero' : 'default' }), className)} {...props} />;
});
Kbd.displayName = 'Kbd';

export interface KbdGroupProps extends React.HTMLAttributes<HTMLSpanElement> {
  // Visual size of the connecting text between keys (matches the keys it contains).
  size?: 'md' | 'sm';
}

// Inline row of keys and connecting words ("then", an arrow). Text children get the muted body role.
const KbdGroup = React.forwardRef<HTMLSpanElement, KbdGroupProps>(({ className, size = 'md', ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center gap-gap-control text-muted-foreground',
      size === 'sm' ? 'typography-micro' : 'typography-ui',
      className,
    )}
    {...props}
  />
));
KbdGroup.displayName = 'KbdGroup';

export { Kbd, KbdGroup, kbdVariants };
