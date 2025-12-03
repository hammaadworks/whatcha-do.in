"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useId } from "react";

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number; // Not used in this simple version but kept for API compatibility
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
}

export const FlickeringGrid = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
  ...props
}: FlickeringGridProps) => {
  const patternId = useId();
  
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 size-full overflow-hidden [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
        className,
      )}
      {...props}
    >
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern
            id={patternId}
            width={squareSize + gridGap}
            height={squareSize + gridGap}
            patternUnits="userSpaceOnUse"
          >
            <motion.rect
              width={squareSize}
              height={squareSize}
              fill={color}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, maxOpacity, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};