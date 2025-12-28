'use client';

import React from 'react';
import {Globe, Lock, Target} from 'lucide-react';
import {Identity} from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface IdentityCardProps {
    identity: Identity & { backingCount: number };
    onClick: () => void;
}

export const IdentityCard: React.FC<IdentityCardProps> = ({identity, onClick}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex items-center justify-between gap-3 rounded-xl py-3 px-4 border transition-all cursor-pointer select-none",
                "bg-card text-card-foreground border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98]"
            )}
        >
            <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-semibold text-base truncate">{identity.title}</h3>
                {!identity.is_public && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Lock size={14} className="text-muted-foreground/50 shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>Private Identity</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                "bg-primary/10 text-primary"
            )}>
                <Target size={12} className="shrink-0" />
                <span>{identity.backingCount}</span>
            </div>
        </div>
    );
};
