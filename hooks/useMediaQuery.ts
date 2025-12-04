import { useState, useEffect } from 'react';

type MediaQueryString = `(min-width: ${number}px)` | `(max-width: ${number}px)` | string;

export function useMediaQuery(query: MediaQueryString): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (for SSR environments)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Initial check
    setMatches(mediaQueryList.matches);

    // Listen for changes
    mediaQueryList.addEventListener('change', listener);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}
