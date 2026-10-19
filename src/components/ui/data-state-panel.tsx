'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../lib/utils';
import { Button } from './button';
import { useEdge } from './edge';
import { useLabels } from './labels-context';

// Skeleton bar for loading layouts of data components (semantic/overlay/skeleton/default).
const SkeletonBar = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden="true"
    className={cn('block h-3 w-full animate-pulse rounded-item bg-overlay-skeleton-default motion-reduce:animate-none', className)}
    {...props}
  />
));
SkeletonBar.displayName = 'SkeletonBar';

export interface DataStatePanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  kind: 'empty' | 'error';
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  // Primary action for the empty state (e.g. "Log time").
  action?: ReactNode;
  // Error state: renders a "Try again" button.
  onRetry?: () => void;
  // Deprecated: use retryText.
  retryLabel?: string;
  retryText?: string;
  // Dashed outline (empty) or destructive outline (error) around the panel.
  outlined?: boolean;
}

// Shared empty and error body for data components (calendar grids, boards, lists, cards).
const DataStatePanel = forwardRef<HTMLDivElement, DataStatePanelProps>(
  ({ className, kind, title, description, icon, action, onRetry, retryLabel: retryLabelProp, retryText, outlined = false, ...props }, ref) => {
    const l = useLabels();
    const retryLabel = retryText ?? retryLabelProp ?? l.tryAgain;
    const isError = kind === 'error';
    const edge = useEdge();
    return (
      <div
        ref={ref}
        role={isError ? 'alert' : 'status'}
        data-state={kind}
        className={cn(
          'flex flex-col items-center justify-center gap-2 px-6 py-8 text-center',
          outlined && 'rounded-card border border-solid',
          outlined && (isError ? 'border-border-destructive' : cn('border-dashed', edge)),
          className,
        )}
        {...props}
      >
        <span aria-hidden="true" className={cn('flex h-icon-md w-icon-md items-center justify-center', isError ? 'text-icon-destructive' : 'text-icon-subtle')}>
          {icon ?? (isError ? <AlertCircle className="h-icon-md w-icon-md" /> : null)}
        </span>
        <p className={cn('typography-ui-medium', isError ? 'text-text-destructive' : 'text-foreground')}>{title}</p>
        {description ? <p className="typography-text-extra-small max-w-reading text-muted-foreground">{description}</p> : null}
        {isError && onRetry ? (
          <Button type="button" variant="outline" size="control-sm" onClick={onRetry}>
            <RefreshCw aria-hidden="true" className="h-icon-sm w-icon-sm" />
            {retryLabel}
          </Button>
        ) : null}
        {!isError ? action : null}
      </div>
    );
  },
);
DataStatePanel.displayName = 'DataStatePanel';

export { DataStatePanel, SkeletonBar };
