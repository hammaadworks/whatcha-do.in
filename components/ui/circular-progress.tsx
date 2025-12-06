import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react'; // Import Check icon

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number; // diameter in pixels
  strokeWidth?: number; // width of the progress circle
  color?: string; // Tailwind color class, e.g., "text-primary"
  bgColor?: string; // Tailwind color class for the background circle, e.g., "text-gray-200"
  children?: React.ReactNode;
  showTickOnComplete?: boolean; // New prop to show tick when progress is 100
  completeCircleBgColor?: string; // New prop for background color when complete
  completeStrokeColor?: string; // New prop for stroke color when complete
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 24,
  strokeWidth = 3,
  color = "text-primary",
  bgColor = "text-muted",
  children,
  showTickOnComplete = false, // Default to false
  completeCircleBgColor = "var(--muted-foreground)", // Default to direct CSS var
  completeStrokeColor = "var(--accent)", // Default to direct CSS var
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isComplete = showTickOnComplete && progress >= 99.9; // Use 99.9 to account for potential float inaccuracies

  return (
    <div className="relative flex items-center justify-center rounded-full transition-colors hover:bg-accent/50 cursor-pointer" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          className={cn(bgColor)} // completeCircleBgColor is no longer a class, it's a fill color
          stroke={isComplete ? completeStrokeColor : "currentColor"} // Use completeStrokeColor when complete
          fill={isComplete ? completeCircleBgColor : 'transparent'} // Fill with completeCircleBgColor when complete
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn(color)}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: 'stroke-dashoffset 0.35s ease-out' }}
        />
      </svg>
      {(children || isComplete) && ( // Render children OR tick if complete
        <div className="absolute inset-0 flex items-center justify-center">
          {isComplete ? (
            <Check className="h-2/3 w-2/3 text-primary-foreground animate-spin-scale" /> // Render animated tick with accent color
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
};