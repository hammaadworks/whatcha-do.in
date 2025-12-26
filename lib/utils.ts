import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, handling conditional classes
 * and merging conflicting Tailwind CSS classes.
 * 
 * @param inputs - Class names, conditional objects, or arrays of classes.
 * @returns A merged string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the current environment is a mobile device based on the user agent string.
 * Note: User agent sniffing is not always 100% accurate.
 * 
 * @returns `true` if a mobile user agent is detected, `false` otherwise.
 */
export function isMobileDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false
  }
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

/**
 * Checks if the device is primarily a touch device (no fine pointer).
 * Used to determine if hover effects or custom cursors should be disabled.
 * 
 * @returns `true` if the device relies on touch input (coarse pointer) and lacks a fine pointer (mouse).
 */
export function isTouchDevice() {
  if (typeof window === "undefined") {
    return false
  }

  // Check if the device has a fine pointer (mouse, trackpad, etc.)
  // If it does, we want to show the custom cursor (so return false for "isTouchDevice" in the context of hiding it).
  // This handles cases like iPad + Mouse or Touchscreen Laptop.
  if (window.matchMedia("(pointer: fine)").matches) {
    return false
  }

  // If no fine pointer is detected, check if it's a mobile device
  if (isMobileDevice()) {
    return true
  }

  // Fallback for other touch-primary devices (e.g., tablets not caught by user agent)
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}