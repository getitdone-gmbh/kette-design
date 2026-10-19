import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface DocumentSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  // Drops the fixed document width so the paper fills its container.
  fluid?: boolean;
}

// Paper-like page for document previews such as offers and invoices. Stays light in dark mode and prints without shadow.
// Children get a light token context via styles/document-surface.css (generated from styles/theme.css, part of dist/styles.css).
const DocumentSurface = forwardRef<HTMLDivElement, DocumentSurfaceProps>(({ className, fluid, ...props }, ref) => (
  <div
    ref={ref}
    data-document-surface=""
    className={cn(
      'w-full rounded-surface border border-solid border-border-default bg-surface-paper p-8 text-text-on-paper shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none',
      !fluid && 'mx-auto max-w-document',
      className,
    )}
    {...props}
  />
));
DocumentSurface.displayName = 'DocumentSurface';

export { DocumentSurface };
