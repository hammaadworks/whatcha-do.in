"use client";

import React from 'react';
import { useUiStore } from '@/lib/store/uiStore';
import { cn } from '@/lib/utils';
import { LayoutGrid, RectangleVertical } from 'lucide-react';
import { Label } from '@/components/ui/label';

export const LayoutToggleSettings = () => {
    const { layoutMode, setLayoutMode } = useUiStore();

    return (
        <div className="flex flex-col space-y-2">
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Profile Layout
            </Label>
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
                <button
                    onClick={() => setLayoutMode('card')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                        layoutMode === 'card'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-background/50"
                    )}
                >
                    <LayoutGrid size={16} />
                    <span>Card View</span>
                </button>
                <button
                    onClick={() => setLayoutMode('section')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                        layoutMode === 'section'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-background/50"
                    )}
                >
                    <RectangleVertical size={16} />
                    <span>Focus View</span>
                </button>
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
                Choose how you want to view your profile sections.
            </p>
        </div>
    );
};
