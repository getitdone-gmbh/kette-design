'use client';

import { useEffect, useRef } from 'react';

// Calls `handler` when Escape is pressed anywhere on the page, unless another handler already consumed the event.
export function useEscapeKey(handler: (() => void) | undefined, enabled = true) {
  const ref = useRef(handler);
  ref.current = handler;
  const active = enabled && handler !== undefined;
  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      ref.current?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);
}
