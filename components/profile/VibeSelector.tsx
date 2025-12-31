// components/profile/VibeSelector.tsx
"use client";

import React from 'react';
import { Pencil, Lock, Users } from 'lucide-react'; // Importing icons
import { ToggleButtonGroup } from '@/components/shared/ToggleButtonGroup'; // Import the new component

interface VibeSelectorProps {
    currentViewMode: 'edit' | 'private' | 'public';
    onViewModeChange: (mode: 'edit' | 'private' | 'public') => void;
}

export const VibeSelector: React.FC<VibeSelectorProps> = ({currentViewMode, onViewModeChange}) => {
    // UPDATED ORDER AND LABELS
    const VIBE_OPTIONS = [
        { id: 'private', label: 'Private Preview', icon: Lock },
        { id: 'edit', label: 'Edit', icon: Pencil },
        { id: 'public', label: 'Public Preview', icon: Users },
    ];

    const selectedClassMap = {
        'private': "bg-primary text-primary-foreground hover:bg-primary/90",
        'edit': "bg-primary text-primary-foreground hover:bg-primary/90",
        'public': "bg-primary text-primary-foreground hover:bg-primary/90",
    };

    const unselectedButtonClass = "bg-background/80 text-muted-foreground hover:bg-accent/50";
    const containerClass = "flex items-center justify-between bg-card rounded-full p-2 shadow-md border border-primary gap-x-4";

    return (
        <ToggleButtonGroup
            options={VIBE_OPTIONS}
            selectedValue={currentViewMode}
            onValueChange={onViewModeChange as (value: string) => void} // Explicitly cast
            selectedClassMap={selectedClassMap}
            unselectedClass={unselectedButtonClass} // Corrected prop name
            containerClass={containerClass}
            showLabelOnSelected={true}
        />
    );
};