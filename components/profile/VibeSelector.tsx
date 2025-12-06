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
            <div className="w-full flex justify-center pt-4 sm:pt-0"> {/* Kept outer flex and padding */}
                {/* RESTORED border border-primary and shadow-md on inner div */}
                <div className="flex items-center justify-between bg-card rounded-full p-2 shadow-md border border-primary gap-x-4"> {/* Increased padding to p-2 and gap-x to gap-x-4 */}
                    {VIBE_OPTIONS.map((option) => (
                        <Tooltip key={option.id}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        buttonClass,
                                        currentViewMode === option.id
                                            ? "bg-primary text-primary-foreground" // Theme highlighted
                                            : "text-muted-foreground hover:bg-muted"
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
            </div>
        </TooltipProvider>
    );
};