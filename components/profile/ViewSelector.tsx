"use client";

import React from 'react';
import { useUiStore } from '@/lib/store/uiStore';
import { cn } from '@/lib/utils';
import { LayoutGrid, RectangleVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const ViewSelector = () => {
    const { layoutMode, setLayoutMode } = useUiStore();
    const buttonClass = "px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center";

    return (
        <TooltipProvider>
            <div className="flex items-center justify-between bg-card rounded-full p-2 shadow-md border border-primary gap-x-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setLayoutMode('card')}
                            className={cn(
                                buttonClass,
                                layoutMode === 'card'
                                    ? "bg-background text-foreground shadow-sm border border-border"
                                    : "text-muted-foreground hover:bg-accent/50"
                            )}
                        >
                            <LayoutGrid size={16} />
                            <span className={cn("ml-2", layoutMode === 'card' ? "inline-block" : "hidden lg:inline-block")}>
                                Card View
                            </span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Card View</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => setLayoutMode('section')}
                            className={cn(
                                buttonClass,
                                layoutMode === 'section'
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-accent/50"
                            )}
                        >
                            <RectangleVertical size={16} />
                            <span className={cn("ml-2", layoutMode === 'section' ? "inline-block" : "hidden lg:inline-block")}>
                                Focus View
                            </span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Focus View</TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};
