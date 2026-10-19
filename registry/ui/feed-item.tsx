'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { BellOff } from 'lucide-react';
import * as React from 'react';

import { focusRing, transitionBase } from '@/lib/recipes';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { useLabels, usePreset } from '@/components/ui/labels-context';

// Figma: _Feed item base (Size sm|md, Supporting item, New dot) and Activity feed Type=Messages|Versions, Divider=Divider|Connector|Line|False.
// Timeline and notification lists live in activity-feed.tsx; this is the generic selectable row list (versions, messages, inbox).
export type FeedListState = 'ready' | 'loading' | 'empty' | 'error';

// Resets the browser list padding and margin so the rows align with the surrounding content.
const feedListVariants = cva('m-0 flex w-full list-none flex-col p-0', {
  variants: {
    divider: {
      none: '',
      // Hairline between items.
      line: '[&>li+li]:border-t [&>li+li]:border-solid [&>li+li]:border-border',
    },
  },
  defaultVariants: { divider: 'none' },
});

export interface FeedListProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'>, VariantProps<typeof feedListVariants> {
  // Accessible name of the list, e.g. "Versions".
  'aria-label': string;
  state?: FeedListState;
  // Replaces the default empty panel.
  emptyState?: React.ReactNode;
  // Replaces the default error panel.
  errorState?: React.ReactNode;
  loadingRows?: number;
  children?: React.ReactNode;
}

const FeedList = React.forwardRef<HTMLElement, FeedListProps>(
  ({ className, divider, state = 'ready', emptyState, errorState, loadingRows = 3, children, ...props }, ref) => {
    const l = useLabels();
    if (state === 'loading') {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          role="status"
          aria-busy="true"
          aria-label={l.loadingItem(props['aria-label'])}
          className={cn('flex w-full flex-col gap-4', className)}
        >
          {Array.from({ length: loadingRows }, (_, i) => (
            <div key={i} className="flex items-center gap-3" aria-hidden="true">
              <span className="block h-avatar-sm w-avatar-sm shrink-0 rounded-full bg-overlay-skeleton-default motion-reduce:animate-none" />
              <span className="flex flex-1 flex-col gap-2">
                <span className="block h-3 w-1/2 rounded-item bg-overlay-skeleton-subtle motion-reduce:animate-none" />
                <span className="block h-3 w-3/4 rounded-item bg-overlay-skeleton-default motion-reduce:animate-none" />
              </span>
            </div>
          ))}
        </div>
      );
    }
    if (state === 'empty') {
      return <>{emptyState ?? <EmptyState variant="first-use" title={l.nothingHereYet} />}</>;
    }
    if (state === 'error') {
      return <>{errorState ?? <EmptyState variant="error" title={l.couldNotLoad} description={l.tryAgainInAMoment} />}</>;
    }
    return (
      <ul
        ref={ref as React.Ref<HTMLUListElement>}
        className={cn(feedListVariants({ divider }), className)}
        {...(props as React.HTMLAttributes<HTMLUListElement>)}
      >
        {children}
      </ul>
    );
  },
);
FeedList.displayName = 'FeedList';

export interface FeedItemProps extends Omit<React.HTMLAttributes<HTMLLIElement>, 'title' | 'onSelect'> {
  // Avatar or small status dot.
  avatar?: React.ReactNode;
  // Who did what. Rich text is allowed (names, links).
  title: React.ReactNode;
  // Relative or absolute time.
  time?: React.ReactNode;
  // File row, quoted text, labels, reply button.
  supporting?: React.ReactNode;
  size?: 'sm' | 'md';
  // `compact` is the dense list row: 8px padding and gap, control radius, selected as a plain fill (no ring) and a small count pill. Defaults to `compact` in the zero preset, otherwise `default`.
  density?: 'default' | 'compact';
  // Unread marker (notifications).
  unread?: boolean;
  // Number of unread entries. Shows a count badge (capped at 99+) instead of the dot.
  unreadCount?: number;
  // Keeps the preview on a single line with an ellipsis. The full text stays in the DOM for screen readers.
  truncateSupporting?: boolean;
  // Muted conversation: shows a bell-off icon and a screen reader text.
  muted?: boolean;
  // Current row (versions).
  selected?: boolean;
  // Makes the whole row a button.
  onSelect?: () => void;
}

const FeedItem = React.forwardRef<HTMLLIElement, FeedItemProps>(
  ({ className, avatar, title, time, supporting, size = 'md', density: densityProp, unread = false, unreadCount, truncateSupporting = false, muted = false, selected = false, onSelect, ...props }, ref) => {
    const l = useLabels();
    const zero = usePreset() === 'zero';
    const density = densityProp ?? (zero ? 'compact' : 'default');
    const compact = density === 'compact';
    // Selected rows and button rows sit on the muted fill (selected, hover), where the plain subtle role drops under 4.5:1.
    const subtle = selected || onSelect ? 'text-text-subtle-on-muted' : 'text-text-subtle';
    const content = (
      <>
        {avatar ? <span className="shrink-0">{avatar}</span> : null}
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className={cn('min-w-0 text-text-default', size === 'sm' ? 'typography-ui' : 'typography-ui-medium')}>{title}</span>
            {time || muted ? (
              <span className={cn('typography-ui flex shrink-0 items-center gap-1', subtle)}>
                {muted ? (
                  <>
                    <BellOff className="h-icon-xs w-icon-xs" aria-hidden="true" />
                    <span className="sr-only">{l.muted}</span>
                  </>
                ) : null}
                {time}
              </span>
            ) : null}
          </span>
          {supporting ? (
            <span
              className={cn('typography-ui block', subtle, truncateSupporting && 'truncate')}
              title={truncateSupporting && typeof supporting === 'string' ? supporting : undefined}
            >
              {supporting}
            </span>
          ) : null}
        </span>
        {unreadCount !== undefined && unreadCount > 0 ? (
          <span
            role="img"
            aria-label={l.unreadCount(unreadCount)}
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full bg-background-brand-bold-default text-text-on-brand',
              compact ? 'typography-micro h-4 [min-width:theme(spacing.4)] px-label font-semibold' : 'typography-ui-sm-semibold h-5 [min-width:theme(spacing.5)] px-1',
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : unread ? (
          <span role="img" aria-label={l.unread} className="mt-2 h-2 w-2 shrink-0 rounded-full bg-background-brand-bold-default" />
        ) : null}
      </>
    );
    // Selected is a tinted fill plus an inset ring: the ring keeps 3:1 contrast on grey sidebar and muted surfaces where the fill alone vanishes. border-focus is used because it holds 3:1 in every theme, which the brand coloured icon-selected does not (yellow, lime, amber).
    // Hover uses muted-strong because muted equals the grey sidebar surface in light mode (1.0 contrast, invisible); muted-strong keeps >= 1.3 luminance step against sidebar, muted and background in light and dark.
    const rowClass = cn(
      'flex w-full items-start text-left',
      compact ? 'gap-2 rounded-control p-2' : 'gap-3 rounded-item px-3 py-2',
      selected && (compact ? 'bg-muted' : 'bg-background-selected-default ring-2 ring-inset ring-border-focus'),
    );
    return (
      <li ref={ref} className={cn('list-none', className)} aria-current={selected ? 'true' : undefined} {...props}>
        {onSelect ? (
          <button type="button" onClick={onSelect} className={cn(rowClass, 'cursor-pointer hover:bg-muted-strong active:bg-muted-strong', ...transitionBase, ...focusRing)}>
            {content}
          </button>
        ) : (
          <div className={rowClass}>{content}</div>
        )}
      </li>
    );
  },
);
FeedItem.displayName = 'FeedItem';

export { FeedItem, FeedList, feedListVariants };
