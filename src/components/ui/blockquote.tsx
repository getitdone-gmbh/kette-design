'use client';

import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

// Quote on the token layer: surface, text and rule colours follow the theme in light and dark, spacing sits on the scale.
const blockquoteVariants = cva('m-0 flex flex-col gap-3', {
  variants: {
    // `default` is a quote with a left rule. `pull` is a larger centred pull quote with a decorative quotation mark.
    variant: {
      default: 'border-0 border-l-2 border-solid border-border-bold pl-6',
      pull: 'relative items-center px-6 py-8 text-center',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  variant?: 'default' | 'pull';
  // Attribution under the quote, for example a name and role. Renders a caption of the figure.
  cite?: React.ReactNode;
  // Address of the source, set as the `cite` attribute of the quote element.
  citeUrl?: string;
}

const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, variant = 'default', cite, citeUrl, children, ...props }, ref) => {
    const quote = (
      <blockquote
        ref={ref}
        cite={citeUrl}
        data-variant={variant}
        className={cn(
          'm-0 text-text-default',
          variant === 'pull' ? 'typography-h3' : 'typography-title-sm',
          // Without attribution the quote is its own block and carries the figure spacing.
          !cite && blockquoteVariants({ variant }),
          !cite && className,
        )}
        {...props}
      >
        {variant === 'pull' && !cite ? <PullMark /> : null}
        {children}
      </blockquote>
    );
    if (!cite) return quote;
    return (
      <figure data-variant={variant} className={cn(blockquoteVariants({ variant }), className)}>
        {variant === 'pull' ? <PullMark /> : null}
        {quote}
        <figcaption className="typography-text-small text-text-subtle">{cite}</figcaption>
      </figure>
    );
  },
);
Blockquote.displayName = 'Blockquote';

// Decorative opening mark of the pull quote. Hidden from assistive technology.
const PullMark = () => (
  <span aria-hidden="true" className="typography-display select-none text-text-subtlest">
    {'“'}
  </span>
);

export { Blockquote, blockquoteVariants };
