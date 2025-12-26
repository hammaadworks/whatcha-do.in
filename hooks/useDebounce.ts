"use client";

import { useState, useEffect } from 'react';

/**
 * A custom React hook that debounces a value.
 * 
 * Returns a value that updates only after the specified delay has passed without 
 * the source value changing. Useful for search inputs or expensive computations.
 *
 * @param value - The value to debounce.
 * @param delay - The delay in milliseconds before the debounced value updates. Defaults to 500ms.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: clear the timeout if the value or delay changes
    // or if the component unmounts.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run if value or delay changes

  return debouncedValue;
}