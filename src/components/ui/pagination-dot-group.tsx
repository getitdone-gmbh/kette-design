'use client';

import { cva } from 'class-variance-authority';
import * as React from 'react';

import { focusRing } from '../../lib/recipes';
import { cn } from '../../lib/utils';
import { useLabels } from './labels-context';
import type { LabelProp } from './labels';

// Figma Pagination dot group (1111:38): Size md|lg, Style Dot|Line, Framed True|False, Color Primary|Gray x light|dark bg.
// md: dot 8, gap 12, frame padding 8. lg: dot 10, gap 16, frame padding 12. Line: 40px wide, 6px (md) or 8px (lg) high.
// 6px and 10px have no utility in the preset, so they are derived from the space-micro token (2px x 3 and x 5).
export type PaginationDotTone = 'primary-light-bg' | 'primary-dark-bg' | 'gray-light-bg' | 'gray-dark-bg';

const toneFrame: Record<PaginationDotTone, string> = {
  'primary-light-bg': 'bg-primary-700',
  'primary-dark-bg': 'bg-background-brand-subtle',
  'gray-light-bg': 'bg-background backdrop-blur-sm',
  'gray-dark-bg': 'bg-static-black/90 backdrop-blur-sm',
};

// Current and idle indicator colours per tone. The two "dark frame" tones use static white for the current dot: Figma binds
// semantic/background/default there, which turns dark in dark mode and would vanish on the dark frame.
const toneCurrent: Record<PaginationDotTone, string> = {
  'primary-light-bg': 'bg-static-white',
  'primary-dark-bg': 'bg-background-brand-bold-default',
  'gray-light-bg': 'bg-background-inverse',
  'gray-dark-bg': 'bg-static-white',
};

const toneIdle: Record<PaginationDotTone, string> = {
  'primary-light-bg': 'bg-general-brand-default',
  'primary-dark-bg': 'bg-background-neutral-default',
  'gray-light-bg': 'bg-muted-strong',
  'gray-dark-bg': 'bg-icon-subtle',
};

const groupVariants = cva('inline-flex items-center justify-center', {
  variants: {
    size: { md: 'gap-3', lg: 'gap-4' },
    framed: { true: 'rounded-full', false: '' },
  },
  compoundVariants: [
    { size: 'md', framed: true, className: 'p-2' },
    { size: 'lg', framed: true, className: 'p-3' },
  ],
  defaultVariants: { size: 'md', framed: false },
});

const indicatorVariants = cva('block shrink-0 rounded-full transition-colors motion-reduce:transition-none', {
  variants: {
    size: { md: '', lg: '' },
    style: { dot: '', line: '' },
  },
  compoundVariants: [
    { size: 'md', style: 'dot', className: 'h-2 w-2' },
    { size: 'lg', style: 'dot', className: 'h-[calc(var(--space-micro)*5)] w-[calc(var(--space-micro)*5)]' },
    { size: 'md', style: 'line', className: 'h-[calc(var(--space-micro)*3)] w-10' },
    { size: 'lg', style: 'line', className: 'h-2 w-10' },
  ],
  defaultVariants: { size: 'md', style: 'dot' },
});

export interface PaginationDotGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  // Number of pages or slides.
  count: number;
  // Zero based index of the current page.
  current: number;
  size?: 'md' | 'lg';
  // Figma Style: round dots or lines of equal width. Only the colour marks the current one.
  indicator?: 'dot' | 'line';
  // Figma Framed: pill background around the indicators.
  framed?: boolean;
  // Figma Color. Default `gray-light-bg`.
  tone?: PaginationDotTone;
  // Makes the indicators buttons. Without it the group is a single read-only image.
  onSelect?: (index: number) => void;
  // Builds the accessible name of an indicator button.
  getItemLabel?: (index: number, count: number) => string;
  // Accessible name of the read-only group, from the 1 based page and the count. Wins over the provider text.
  pageOfLabel?: LabelProp<[number, number]>;
}

const PaginationDotGroup = React.forwardRef<HTMLDivElement, PaginationDotGroupProps>(
  (
    {
      className,
      count,
      current,
      size = 'md',
      indicator = 'dot',
      framed = false,
      tone = 'gray-light-bg',
      onSelect,
      getItemLabel: getItemLabelProp,
      pageOfLabel,
      ...props
    },
    ref,
  ) => {
    const l = useLabels({ pageOf: pageOfLabel });
    const getItemLabel = getItemLabelProp ?? ((i: number, n: number) => l.goToPage(i + 1, n));
    const items = Array.from({ length: Math.max(0, count) });
    const readOnly = !onSelect;
    return (
      <div
        ref={ref}
        role={readOnly ? 'img' : 'group'}
        aria-label={readOnly ? l.pageOf(current + 1, count) : undefined}
        data-tone={tone}
        className={cn(groupVariants({ size, framed }), readOnly ? undefined : 'gap-0', framed && toneFrame[tone], className)}
        {...props}
      >
        {items.map((_, i) => {
          const isCurrent = i === current;
          const mark = <span className={cn(indicatorVariants({ size, style: indicator }), isCurrent ? toneCurrent[tone] : toneIdle[tone])} />;
          if (readOnly) {
            return (
              <span key={i} aria-hidden="true" className="inline-flex">
                {mark}
              </span>
            );
          }
          return (
            <button
              key={i}
              type="button"
              aria-label={getItemLabel(i, count)}
              aria-current={isCurrent ? 'true' : undefined}
              onClick={() => onSelect?.(i)}
              // The visible indicator keeps its Figma size inside a 24px target (WCAG 2.5.8). The group gap is dropped, the target boxes carry the spacing.
              className={cn('inline-flex h-6 min-w-target items-center justify-center rounded-full', ...focusRing)}
            >
              {mark}
            </button>
          );
        })}
      </div>
    );
  },
);
PaginationDotGroup.displayName = 'PaginationDotGroup';

export { PaginationDotGroup };
