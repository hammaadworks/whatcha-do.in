// components/profile/VibeSelector.tsx
"use client";

import React from 'react';
import {cn} from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pencil, Lock, Users } from 'lucide-react'; // Importing icons

interface VibeSelectorProps {
    currentViewMode: 'edit' | 'private' | 'public';
    onViewModeChange: (mode: 'edit' | 'private' | 'public') => void;
}

export const VibeSelector: React.FC<VibeSelectorProps> = ({currentViewMode, onViewModeChange}) => {
    const buttonClass = "px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center"; // Reverted to original button class structure, will adjust later for spacing

    // UPDATED ORDER AND LABELS
    const VIBE_OPTIONS = [
        { id: 'private', label: 'Private Preview', icon: Lock },
        { id: 'edit', label: 'Edit', icon: Pencil },
        { id: 'public', label: 'Public Preview', icon: Users },
    ];

    return (
        <TooltipProvider>
            <div className="flex items-center justify-between bg-card rounded-full p-2 shadow-md border border-primary gap-x-4">
                {VIBE_OPTIONS.map((option) => (
                    <Tooltip key={option.id}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        buttonClass,
                                        currentViewMode === option.id
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90" // Selected: dim hover
                                            : "bg-background/80 text-muted-foreground hover:bg-accent/50" // Unselected: light hover (UserClock based)
                                    )}
                                    onClick={() => onViewModeChange(option.id as 'edit' | 'private' | 'public')}
                                >
                                    <option.icon className="h-4 w-4" />
                                    <span className={cn(
                                        "ml-2",
                                        // Always show if selected
                                        currentViewMode === option.id ? "inline-block" : "hidden",
                                        // On large screens, always show (overrides 'hidden' for unselected)
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