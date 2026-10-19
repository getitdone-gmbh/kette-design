'use client';

import * as React from 'react';

import { cn } from '../../lib/utils';
import { usePreset } from './labels-context';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Direction of the rule. Vertical separators need a parent with a defined height (e.g. `flex` + `h-*`). */
  orientation?: 'horizontal' | 'vertical';
  /**
   * `true` (default): purely visual, exposed with `role="none"` so assistive tech skips it.
   * `false`: a semantic divider (`role="separator"` + `aria-orientation`) between distinct content groups.
   */
  decorative?: boolean;
}

/** 1px rule in the `border-subtle` role. Same API shape as the Radix separator (orientation + decorative). */
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => {
    const zero = usePreset() === 'zero';
    return (
    <div
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative || orientation === 'horizontal' ? undefined : 'vertical'}
      data-orientation={orientation}
      className={cn('shrink-0', zero ? 'bg-border-default' : 'bg-border-subtle', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
      {...props}
    />
    );
  },
);
Separator.displayName = 'Separator';

export { Separator };
