'use client';

import React from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Globe, Lock, Target} from 'lucide-react';
import {Identity} from '@/lib/supabase/types';

interface IdentityCardProps {
    identity: Identity & { backingCount: number };
    onClick: () => void;
}

export const IdentityCard: React.FC<IdentityCardProps> = ({identity, onClick}) => {
    return (<Card
            className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-primary"
            onClick={onClick}
        >
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight">{identity.title}</h3>
                    {identity.is_public ? (<Globe className="h-4 w-4 text-muted-foreground flex-shrink-0"/>) : (
                        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0"/>)}
                </div>

                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Target className="h-3 w-3"/>
                        {identity.backingCount} Habits
                    </Badge>
                </div>
            </CardContent>
        </Card>);
};
