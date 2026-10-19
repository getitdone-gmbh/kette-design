'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Figma: Layout 10196:370718 (Grid, Span, Stack block|section|card, Cluster, Tile) and SplitView (rail or filter column + content).
// Grid and GridItem already exist (components/ui/grid); these are the missing layout primitives.
const stackVariants = cva('flex flex-col', {
  variants: {
    gap: {
      card: 'gap-3',
      block: 'gap-5',
      section: 'gap-8',
    },
  },
  defaultVariants: { gap: 'block' },
});

export interface StackProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof stackVariants> {
  as?: React.ElementType;
}

const Stack = React.forwardRef<HTMLElement, StackProps>(({ className, gap, as: Comp = 'div', ...props }, ref) => (
  <Comp ref={ref} className={cn(stackVariants({ gap }), className)} {...props} />
));
Stack.displayName = 'Stack';

const clusterVariants = cva('flex flex-wrap items-center', {
  variants: {
    gap: { 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4' },
  },
  defaultVariants: { gap: 2 },
});

export interface ClusterProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof clusterVariants> {
  as?: React.ElementType;
}

// Horizontal wrapping row (buttons, chips, filters).
const Cluster = React.forwardRef<HTMLElement, ClusterProps>(({ className, gap, as: Comp = 'div', ...props }, ref) => (
  <Comp ref={ref} className={cn(clusterVariants({ gap }), className)} {...props} />
));
Cluster.displayName = 'Cluster';

export interface TileGridProps extends React.HTMLAttributes<HTMLDivElement> {
  // Minimum tile width in px (Figma: 220, 260, 280, 296, 360). Tiles wrap and share the remaining space.
  min?: number;
}

const TileGrid = React.forwardRef<HTMLDivElement, TileGridProps>(({ className, min = 260, style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('grid gap-4', className)}
    style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))`, ...style }}
    {...props}
  />
));
TileGrid.displayName = 'TileGrid';

const splitViewAsideVariants = cva('shrink-0 max-lg:w-full', {
  variants: {
    asideWidth: {
      inner: 'lg:w-inner-column',
      filter: 'lg:w-filter-column',
      aside: 'lg:w-aside',
    },
    side: {
      start: 'border-b border-solid border-border lg:border-b-0 lg:border-r',
      end: 'order-last border-t border-solid border-border lg:border-l lg:border-t-0',
    },
  },
  defaultVariants: { asideWidth: 'filter', side: 'start' },
});

export interface SplitViewProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof splitViewAsideVariants> {
  // Filters, section navigation or a record list.
  aside: React.ReactNode;
  asideLabel?: string;
  // Draws the outer card border and radius.
  bordered?: boolean;
}

// Two panes. On narrow screens the aside stacks above (start) or below (end) the content.
const SplitView = React.forwardRef<HTMLDivElement, SplitViewProps>(
  ({ className, aside, asideLabel, asideWidth, side, bordered = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex w-full flex-col overflow-hidden bg-card lg:flex-row',
        bordered && 'rounded-surface border border-solid border-border',
        className,
      )}
      {...props}
    >
      <aside aria-label={asideLabel} className={cn(splitViewAsideVariants({ asideWidth, side }), 'p-4')}>
        {aside}
      </aside>
      <div className="min-w-0 flex-1 p-4">{children}</div>
    </div>
  ),
);
SplitView.displayName = 'SplitView';

export { Cluster, SplitView, Stack, TileGrid, clusterVariants, stackVariants };
