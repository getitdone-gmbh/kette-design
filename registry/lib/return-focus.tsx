'use client';
import * as React from 'react';

// Focus return fallback for Radix dialog content. Radix returns focus to the Trigger only. With no Trigger (controlled `open`, a plain Button that sets state) focus would land on the body.
// The opener is remembered when the content mounts and focused again on close, unless a Trigger already took focus or the consumer prevented the default in `onCloseAutoFocus`.

type RememberOpener = (element: HTMLElement | null) => void;

// Rendered as a child of the dialog content, so its first render runs before Radix moves focus into the dialog.
export const OpenerCapture = ({ onCapture }: { onCapture: RememberOpener }) => {
  const [opener] = React.useState<HTMLElement | null>(() => {
    if (typeof document === 'undefined') return null;
    const active = document.activeElement;
    return active instanceof HTMLElement && active !== document.body ? active : null;
  });
  React.useEffect(() => {
    onCapture(opener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

export const useReturnFocusFallback = (consumerHandler?: (event: Event) => void) => {
  const opener = React.useRef<HTMLElement | null>(null);
  const remember = React.useCallback<RememberOpener>((element) => {
    opener.current = element;
  }, []);
  const onCloseAutoFocus = React.useCallback(
    (event: Event) => {
      consumerHandler?.(event);
      if (event.defaultPrevented) return;
      const target = opener.current;
      // Radix runs its own trigger focus right after this handler, so the fallback waits for it.
      queueMicrotask(() => {
        const active = document.activeElement;
        const lost = !active || active === document.body || !active.isConnected;
        if (lost && target && target.isConnected) target.focus();
      });
    },
    [consumerHandler],
  );
  return { remember, onCloseAutoFocus };
};
