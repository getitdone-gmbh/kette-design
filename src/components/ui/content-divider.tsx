'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

// Figma "Content divider" Style: Single line (rule, content, rule), Dual line (a rule above and below the content),
// Background fill (filled band). Type Heading / Text / Button / Button group is whatever the children are.
const contentDividerVariants = cva('flex w-full', {
  variants: {
    variant: {
      single: 'items-center gap-2',
      dual: 'flex-col items-center border-y border-solid border-border-default py-3',
      filled: 'flex-col items-center rounded-control bg-muted py-2',
    },
    // `heading` uses the default text colour, `text` the subtle one (Figma Type Heading / Text).
    emphasis: {
      text: 'typography-text-small text-text-subtle',
      heading: 'typography-text-small text-foreground',
    },
  },
  defaultVariants: { variant: 'single', emphasis: 'heading' },
});

export interface ContentDividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof contentDividerVariants> {}

const Rule = () => <span aria-hidden="true" data-divider-rule="" className="h-px min-w-0 flex-1 bg-border-default" />;

// Divider with content in it: a label, a heading, a Button or a button group. Without children it is a plain rule.
const ContentDivider = React.forwardRef<HTMLDivElement, ContentDividerProps>(
  ({ className, variant, emphasis, children, ...props }, ref) => {
    const resolved = variant ?? 'single';
    if (children == null || children === false) {
      return (
        <div ref={ref} data-variant={resolved} className={cn('flex w-full items-center', className)} {...props}>
          <Rule />
        </div>
      );
    }
    return (
      <div
        ref={ref}
        data-variant={resolved}
        className={cn(contentDividerVariants({ variant, emphasis }), className)}
        {...props}
      >
        {resolved === 'single' ? <Rule /> : null}
        <div className="flex shrink-0 items-center gap-2">{children}</div>
        {resolved === 'single' ? <Rule /> : null}
      </div>
    );
  },
);
ContentDivider.displayName = 'ContentDivider';

export { ContentDivider, contentDividerVariants };
