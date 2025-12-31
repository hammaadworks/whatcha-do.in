"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react'; // Import LucideIcon type

interface ToggleButtonGroupOption {
    id: string;
    label: string;
    icon: LucideIcon; // Use LucideIcon type for the icon component
}

interface ToggleButtonGroupProps {
    options: ToggleButtonGroupOption[];
    selectedValue: string;
    onValueChange: (value: ToggleButtonGroupOption['id']) => void; // More specific type
    selectedClassMap: Record<string, string>; // Change to a map
    unselectedClass: string;
    buttonBaseClass?: string;
    containerClass?: string;
    showLabelOnSelected?: boolean; // New prop to control label visibility
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
    options,
    selectedValue,
    onValueChange,
    selectedClassMap, // Use map
    unselectedClass,
    buttonBaseClass = "px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center",
    containerClass = "flex items-center justify-between bg-card rounded-full p-2 shadow-md border border-primary gap-x-4",
    showLabelOnSelected = true,
}) => {
    return (
        <TooltipProvider>
            <div className={containerClass}>
                {options.map((option) => (
                    <Tooltip key={option.id}>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    buttonBaseClass,
                                    selectedValue === option.id
                                        ? selectedClassMap[option.id] || "" // Use map for selected class
                                        : unselectedClass
                                )}
                                onClick={() => onValueChange(option.id)}
                            >
                                <option.icon className="h-4 w-4" />
                                <span className={cn(
                                    "ml-2",
                                    (showLabelOnSelected && selectedValue === option.id) ? "inline-block" : "hidden",
                                    // Always show on large screens (overrides 'hidden' for unselected if needed)
                                    "lg:inline-block"
                                )}>
                                    {option.label}
                                </span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{option.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
};
