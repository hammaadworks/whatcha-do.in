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
        { id: 'private', label: <span>Private <span className="hidden sm:inline">Preview</span></span>, icon: Lock },
        { id: 'edit', label: 'Edit', icon: Pencil },
        { id: 'public', label: <span>Public <span className="hidden sm:inline">Preview</span></span>, icon: Users },
    ];

    return (
        <ToggleButtonGroup
            options={VIBE_OPTIONS}
            selectedValue={currentViewMode}
            onValueChange={onViewModeChange as (value: string) => void}
        />
    );
};