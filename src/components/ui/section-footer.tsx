'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

// Figma: Section footer 3275:372571 (Type=Section|Card, Breakpoint=Desktop|Mobile, Divider, Button group, Secondary button, Actions).
// Layout: optional hairline on top, then one row: button group, "Learn more" link, actions pushed to the end.
const sectionFooterVariants = cva('flex w-full flex-col items-center', {
  variants: {
    type: {
      section: 'gap-5 max-sm:gap-4',
      card: 'gap-4 pb-4 max-sm:gap-3 max-sm:pb-3',
    },
  },
  defaultVariants: { type: 'section' },
});

const contentVariants = cva('flex w-full items-center justify-end', {
  variants: {
    type: {
      section: 'gap-5',
      card: 'gap-4 px-6 max-sm:px-4',
    },
  },
  defaultVariants: { type: 'section' },
});

export interface SectionFooterProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sectionFooterVariants> {
  // Button group or segmented control at the start of the row (for example a range switcher).
  start?: React.ReactNode;
  // Link next to the start slot ("Learn more"), shown in the subtle link style.
  supporting?: React.ReactNode;
  // Hairline above the row.
  divider?: boolean;
}

// Children are the actions (tertiary, secondary, primary), right aligned.
const SectionFooter = React.forwardRef<HTMLDivElement, SectionFooterProps>(
  ({ className, type, start, supporting, divider = true, children, ...props }, ref) => (
    <div ref={ref} className={cn(sectionFooterVariants({ type }), className)} {...props}>
      {divider ? <div aria-hidden="true" data-slot="divider" className="h-px w-full shrink-0 bg-border" /> : null}
      <div className={contentVariants({ type })}>
        {start}
        {supporting ? <div className="typography-link-sm shrink-0 text-text-subtle">{supporting}</div> : null}
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">{children}</div>
      </div>
    </div>
  ),
);
SectionFooter.displayName = 'SectionFooter';

export { SectionFooter, sectionFooterVariants };
