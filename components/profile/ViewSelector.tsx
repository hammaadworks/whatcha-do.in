"use client";

import React from 'react';
import { useUiStore } from '@/lib/store/uiStore';
import { LayoutGrid, RectangleVertical } from 'lucide-react';
import { ToggleButtonGroup } from '@/components/shared/ToggleButtonGroup';

export const ViewSelector = () => {
    const { layoutMode, setLayoutMode } = useUiStore();

    const VIEW_OPTIONS = [
        { id: 'card', label: 'Card View', icon: LayoutGrid },
        { id: 'section', label: 'Focus View', icon: RectangleVertical },
    ];

    const selectedClassMap = {
        'card': "bg-accent text-accent-foreground shadow-sm",
        'section': "bg-primary text-primary-foreground shadow-sm",
    };

    const unselectedButtonClass = "text-muted-foreground hover:bg-accent/50";
    const containerClass = "flex items-center justify-between bg-card rounded-full p-2 shadow-md border border-primary gap-x-4";

    return (
        <ToggleButtonGroup
            options={VIEW_OPTIONS}
            selectedValue={layoutMode}
            onValueChange={(value) => setLayoutMode(value as "card" | "section")}
            selectedClassMap={selectedClassMap}
            unselectedClass={unselectedButtonClass}
            containerClass={containerClass}
            showLabelOnSelected={true} // Keep consistent behavior
        />
    );
};