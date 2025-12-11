"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/lib/store/uiStore';
import { LayoutGrid, RectangleVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const GuestLayoutSelector = () => {
    const { layoutMode, setLayoutMode } = useUiStore();
    
    // Using the same styling structure as VibeSelector.tsx
    const buttonClass = "px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center";

    const LAYOUT_OPTIONS = [
        { id: 'card', label: 'Card View', icon: LayoutGrid },
        { id: 'section', label: 'Focus View', icon: RectangleVertical },
    ];

    return (
        <TooltipProvider>
            <div className="w-full flex justify-center pt-4 sm:pt-0">
                <div className="flex items-center justify-between bg-card rounded-full p-2 shadow-md border border-primary gap-x-4">
                    {LAYOUT_OPTIONS.map((option) => (
                        <Tooltip key={option.id}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        buttonClass,
                                        layoutMode === option.id
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "bg-background/80 text-muted-foreground hover:bg-accent/50"
                                    )}
                                    onClick={() => setLayoutMode(option.id as 'card' | 'section')}
                                >
                                    <option.icon className="h-4 w-4" />
                                    <span className={cn(
                                        "ml-2",
                                        layoutMode === option.id ? "inline-block" : "hidden",
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
            </div>
        </TooltipProvider>
    );
};
