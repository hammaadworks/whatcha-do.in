import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isTouchDevice() {
  if (typeof window === "undefined") {
    return false
  }
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0 ||
    window.matchMedia("(hover: none) and (pointer: coarse)").matches
  )
}