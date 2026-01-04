import React from 'react';
import { cn } from "@/lib/utils";

interface IdentityChipProps {
    id: string;
    title: string;
    color?: string;
    className?: string;
}

export const IdentityChip: React.FC<IdentityChipProps> = ({ title, color, className }) => {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm transition-colors",
                // Base styles - use a fallback if color isn't provided or valid
                !color && "bg-secondary text-secondary-foreground border-transparent",
                color, // Apply the color class (e.g., "bg-red-100 text-red-800")
                className
            )}
        >
            {title}
        </span>
    );
};
