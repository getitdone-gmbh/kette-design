'use client';

import * as React from 'react';

// A sticky or fixed header or footer inside a scrolling overlay covers the focused element when the browser scrolls it to the edge (reverse Tab to the first field, WCAG 2.4.11 Focus Not Obscured).
// The bar reports its height as --sticky-inset-top or --sticky-inset-bottom on the overlay content (the element with data-inset-scope). Scroll containers read it as scroll-padding, so a focused element always stops clear of the bar.
export const INSET_SCOPE_ATTRIBUTE = 'data-inset-scope';

// Utility classes for the scroll containers of an overlay: the content panel and its scrolling body.
export const scrollInsetClasses = 'scroll-pt-[var(--sticky-inset-top,0px)] scroll-pb-[var(--sticky-inset-bottom,0px)]';

type Edge = 'top' | 'bottom';

const property = (edge: Edge) => `--sticky-inset-${edge}`;

export function useStickyInset<T extends HTMLElement>(edge: Edge, forwardedRef?: React.ForwardedRef<T>) {
  const [element, setElement] = React.useState<T | null>(null);
  const setRef = React.useCallback(
    (node: T | null) => {
      setElement(node);
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<T | null>).current = node;
    },
    [forwardedRef],
  );
  React.useEffect(() => {
    if (!element) return undefined;
    const scope = element.closest<HTMLElement>(`[${INSET_SCOPE_ATTRIBUTE}]`);
    if (!scope) return undefined;
    const name = property(edge);
    const report = () => {
      const position = window.getComputedStyle(element).position;
      // Only a bar that stays in view while the content scrolls can cover a focused element.
      const covers = position === 'sticky' || position === 'fixed';
      scope.style.setProperty(name, covers ? `${element.offsetHeight}px` : '0px');
    };
    report();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(report);
    observer?.observe(element);
    window.addEventListener('resize', report);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', report);
      scope.style.removeProperty(name);
    };
  }, [element, edge]);
  return setRef;
}
