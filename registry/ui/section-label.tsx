'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SectionLabelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  // Section number or index, for example "01".
  index: React.ReactNode;
  // Short label above the title, for example "Process".
  overline?: React.ReactNode;
  // Heading text of the section.
  title?: React.ReactNode;
  titleAs?: 'h2' | 'h3' | 'h4';
  description?: React.ReactNode;
  // Index size. `lg` is a large display index for dashboard rails and long pages.
  indexSize?: 'default' | 'lg';
  // `inline` puts the index beside the text. `stacked` puts it above the title, for narrow rails where a side index leaves too little text width.
  layout?: 'inline' | 'stacked';
}

const indexStyle = {
  default: 'typography-ui-semibold min-w-icon-lg',
  lg: 'typography-display-sm w-12 shrink-0',
} as const;

// A stacked index sits on its own line, so the fixed index column width is dropped.
const stackedIndexStyle = {
  default: 'typography-ui-semibold',
  lg: 'typography-display-sm',
} as const;

// Numbered section label for landing sections and long pages. The index is decorative and hidden from assistive technology.
const SectionLabel = React.forwardRef<HTMLDivElement, SectionLabelProps>(
  ({ className, index, indexSize = 'default', layout = 'inline', overline, title, titleAs: Title = 'h2', description, ...props }, ref) => (
    <div ref={ref} data-layout={layout} className={cn('flex', layout === 'stacked' ? 'flex-col items-start gap-2' : 'items-start gap-4', className)} {...props}>
      <span aria-hidden="true" data-index-size={indexSize} className={cn(layout === 'stacked' ? stackedIndexStyle[indexSize] : indexStyle[indexSize], 'tabular-nums text-text-brand')}>
        {index}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        {overline ? <p className="typography-ui-semibold m-0 uppercase text-text-subtle">{overline}</p> : null}
        {title ? <Title className="typography-h3 m-0">{title}</Title> : null}
        {description ? <p className="typography-body m-0 max-w-reading text-text-subtle">{description}</p> : null}
      </div>
    </div>
  ),
);
SectionLabel.displayName = 'SectionLabel';

export { SectionLabel };
