'use client';

import * as React from 'react';

import { focusRing } from '../../lib/recipes';
import { cn } from '../../lib/utils';
import { useLabels } from './labels-context';

export interface TableOfContentsItem {
  // Id of the heading element in the page.
  id: string;
  label: React.ReactNode;
  // Heading depth for the indent. Default 1.
  level?: 1 | 2 | 3;
}

export interface TableOfContentsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  items: TableOfContentsItem[];
  // Controlled active id. Without it the active heading is tracked while scrolling.
  activeId?: string;
  onActiveChange?: (id: string) => void;
  // Accessible name of the navigation landmark. Defaults to the provider text.
  label?: string;
  // Root margin of the observer. The default activates a heading once it reaches the upper third of the viewport.
  rootMargin?: string;
  // Scroll container when the page does not scroll the window.
  scrollRoot?: Element | null;
  // Space kept above a heading after a jump, so a sticky header does not cover it. `topbar` and `topbar-lg` follow the
  // topbar size tokens (default `topbar`), a number is a pixel offset for custom headers, `none` disables it.
  scrollOffset?: 'topbar' | 'topbar-lg' | 'none' | number;
  // `brand` also colours the active entry with the brand text role. The marker and weight stay, so colour is never the only cue.
  activeTone?: 'default' | 'brand';
}

const offsetValue = (offset: NonNullable<TableOfContentsProps['scrollOffset']>) => {
  if (offset === 'none') return '';
  if (offset === 'topbar') return 'var(--size-topbar)';
  if (offset === 'topbar-lg') return 'var(--size-topbar-lg)';
  return `${offset}px`;
};

const indent = { 1: 'pl-3', 2: 'pl-6', 3: 'pl-9' } as const;

// Table of contents with scroll tracking. The active link carries aria-current="location" and a bold weight plus a marker, not color alone.
const TableOfContents = React.forwardRef<HTMLElement, TableOfContentsProps>(
  ({ className, items, activeId: activeIdProp, onActiveChange, label: labelProp, rootMargin = '0px 0px -66% 0px', scrollRoot, scrollOffset = 'topbar', activeTone = 'default', ...props }, ref) => {
    const l = useLabels(labelProp ? { tableOfContents: labelProp } : undefined);
    const [tracked, setTracked] = React.useState<string | undefined>(items[0]?.id);
    const active = activeIdProp ?? tracked;
    const onChangeRef = React.useRef(onActiveChange);
    onChangeRef.current = onActiveChange;
    const idsKey = items.map((item) => item.id).join('|');

    React.useEffect(() => {
      if (activeIdProp !== undefined || typeof IntersectionObserver === 'undefined') return undefined;
      const ids = idsKey ? idsKey.split('|') : [];
      const visible = new Set<string>();
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
          });
          const next = ids.find((id) => visible.has(id));
          if (next) {
            setTracked(next);
            onChangeRef.current?.(next);
          }
        },
        { root: scrollRoot ?? null, rootMargin },
      );
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
      return () => observer.disconnect();
    }, [idsKey, activeIdProp, rootMargin, scrollRoot]);

    // The native anchor jump honours scroll-margin, so the offset also applies to deep links and keyboard activation.
    React.useEffect(() => {
      const value = offsetValue(scrollOffset);
      if (!value) return undefined;
      const targets = (idsKey ? idsKey.split('|') : []).map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
      const previous = targets.map((el) => el.style.scrollMarginTop);
      targets.forEach((el) => {
        el.style.scrollMarginTop = value;
      });
      return () => {
        targets.forEach((el, index) => {
          el.style.scrollMarginTop = previous[index];
        });
      };
    }, [idsKey, scrollOffset]);

    return (
      <nav ref={ref} aria-label={l.tableOfContents} className={cn('text-text-default', className)} {...props}>
        <ul className="m-0 flex list-none flex-col border-0 border-l border-solid border-hairline p-0">
          {items.map((item) => {
            const current = item.id === active;
            return (
              <li key={item.id} className="flex">
                <a
                  href={`#${item.id}`}
                  aria-current={current ? 'location' : undefined}
                  onClick={() => {
                    if (activeIdProp === undefined) setTracked(item.id);
                    onActiveChange?.(item.id);
                  }}
                  className={cn(
                    '-ml-px flex-1 rounded-item border-0 border-l-2 border-solid py-1 pr-3 underline-offset-4 hover:underline',
                    !current && 'hover:text-foreground',
                    indent[item.level ?? 1],
                    current ? cn('typography-ui-semibold border-border-brand', activeTone === 'brand' ? 'text-text-brand' : 'text-foreground') : 'typography-ui border-transparent text-text-subtle',
                    focusRing,
                  )}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  },
);
TableOfContents.displayName = 'TableOfContents';

export { TableOfContents };
