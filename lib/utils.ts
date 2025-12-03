import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isMobileDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false
  }
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

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