"use client"

import { useEffect, useRef } from "react" // Removed useState
import {
  HTMLMotionProps,
  motion,
  useMotionValue,
} from "motion/react"

import { cn, isTouchDevice } from "@/lib/utils"

/**
 * A custom pointer component that displays an animated cursor.
 * This component will globally hide the native cursor and replace it with a custom one.
 * You can pass custom children to render as the pointer.
 *
 * @component
 * @param {HTMLMotionProps<"div">} props - The component props
 */
export function Pointer({
  className,
  style,
  children,
  ...props
}: HTMLMotionProps<"div">): React.ReactNode {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null) // Ref for consistency

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isTouchDevice()) {
        return; // Do not apply custom cursor logic on touch devices
      }

      // Use CSS class instead of injecting style tag
      document.documentElement.classList.add("hide-native-cursor");

      const handleMouseMove = (e: MouseEvent) => {
        x.set(e.clientX);
        y.set(e.clientY);
      };
      
      // Attach event listeners to the window for global coverage
      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        // Clean up on unmount
        document.documentElement.classList.remove("hide-native-cursor");
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [x, y]); // Dependencies are just motion values

  if (typeof window !== "undefined" && isTouchDevice()) {
    return null // Do not render custom pointer on touch devices
  }

  return (
    // Always render the motion.div for the pointer, AnimatePresence is not needed if always rendered.
    <motion.div
      ref={containerRef} // Using ref here to keep consistency
      className="pointer-events-none fixed z-[9999999]"
      style={{
        x: x,
        y: y,
        transform: "translate(-50%, -50%)",
        ...style,
      }}
      initial={{
        scale: 0,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      // exit is not needed if component is always mounted
      {...props}
    >
      {children || (
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="1"
          viewBox="0 0 16 16"
          height="24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "rotate-[-70deg] stroke-[rgb(var(--cursor-stroke))] text-[rgb(var(--cursor-border))] ",
            className
          )}
        >
          <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
        </svg>
      )}
    </motion.div>
  )
}
