"use client";

import { cn } from "@/lib/utils";

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
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
            id="flickering-grid"
            width={squareSize + gridGap}
            height={squareSize + gridGap}
            patternUnits="userSpaceOnUse"
          >
            <rect
              width={squareSize}
              height={squareSize}
              fill={color}
              className="animate-flicker"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#flickering-grid)" />
      </svg>
      <style jsx>{`
        .animate-flicker {
          animation: flicker 2s infinite;
        }
        @keyframes flicker {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: ${maxOpacity};
          }
        }
      `}</style>
    </div>
  );
};
