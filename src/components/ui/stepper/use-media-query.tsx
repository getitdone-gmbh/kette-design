'use client';

import { useEffect, useState } from 'react';

// Works without window.matchMedia (older test DOMs, some embedded webviews): the query then never matches.
export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = window.matchMedia(query);
    setValue(result.matches);
    if (typeof result.addEventListener === 'function') {
      result.addEventListener('change', onChange);
      return () => result.removeEventListener('change', onChange);
    }
    // Safari before 14 only knows the deprecated listener API.
    result.addListener?.(onChange);
    return () => result.removeListener?.(onChange);
  }, [query]);

  return value;
}
