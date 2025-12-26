import { useState, useEffect } from 'react';

type MediaQueryString = `(min-width: ${number}px)` | `(max-width: ${number}px)` | string;

/**
 * Custom hook to detect if the window matches a specific media query.
 * 
 * Useful for responsive logic in JavaScript.
 * Handles SSR by defaulting to `false` (no match) on the server.
 * 
 * @param query - The media query string (e.g., `(min-width: 768px)`).
 * @returns True if the media query matches, false otherwise.
 */
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