'use client';

import { useEffect, useRef, useState } from 'react';

// A scroll area with nothing focusable inside must be reachable by keyboard (WCAG 2.1.1). The area becomes a tab stop only while it really overflows.
export const useScrollRegion = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [overflowing, setOverflowing] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const measure = () => setOverflowing(node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => observer.disconnect();
  }, []);
  return { ref, overflowing };
};
