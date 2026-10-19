'use client';

import { useEffect, type RefObject } from 'react';

// Keeps aria-controls only while the element it points at exists. Radix tabs and cmdk always emit the reference, even when the panel or list is not mounted, and a dangling reference fails aria-valid-attr-value. `scope` picks the ancestor watched for the target appearing.
export const useDanglingControls = (
  ref: RefObject<HTMLElement | null>,
  scope: (node: HTMLElement) => Element | null,
  onSync?: (node: HTMLElement, exists: boolean) => void,
) => {
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const root = scope(node) ?? document.body;
    const sync = () => {
      const id = node.getAttribute('aria-controls') ?? node.dataset.controlsId;
      if (!id) return;
      node.dataset.controlsId = id;
      const exists = Boolean(document.getElementById(id));
      if (exists) node.setAttribute('aria-controls', id);
      else node.removeAttribute('aria-controls');
      onSync?.(node, exists);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
};
