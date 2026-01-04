"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';

interface ToggleButtonGroupOption {
    id: string;
    label: React.ReactNode | string;
    icon?: LucideIcon; // Make icon optional
}

interface ToggleButtonGroupProps {
    options: ToggleButtonGroupOption[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    className?: string;
    itemClassName?: string;
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
    options,
    selectedValue,
    onValueChange,
    className,
    itemClassName,
}) => {
    return (
        <TooltipProvider>
            <div className={cn(
                "flex items-center gap-1 p-1 rounded-full border-2 border-primary bg-card shadow-[4px_4px_0px_0px_var(--color-primary)] transition-all overflow-x-auto no-scrollbar max-w-[calc(100%-5px)]",
                className
            )}>
                {options.map((option) => {
                    const isSelected = selectedValue === option.id;
                    return (
                        <Tooltip key={option.id}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => onValueChange(option.id)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 border-2 whitespace-nowrap",
                                        isSelected 
                                            ? "bg-accent text-accent-foreground border-primary" 
                                            : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50",
                                        itemClassName
                                    )}
                                >
                                    {option.icon && <option.icon className="h-4 w-4 shrink-0" />}
                                    <span className={cn("transition-all", isSelected ? "inline" : "inline")}>{option.label}</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{typeof option.label === 'string' ? option.label : option.id}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
};
