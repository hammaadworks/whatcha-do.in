'use client';

import React from 'react';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton'; // Import Skeleton


interface MotivationsSectionProps {
    username: string;
    isOwner: boolean;
    isReadOnly?: boolean; // Add isReadOnly prop
    loading: boolean; // Add loading prop
}

const MotivationsSection: React.FC<MotivationsSectionProps> = ({username, isOwner, isReadOnly = false, loading}) => {
    const motivationalQuote = "The journey of a thousand miles begins with a single step."; // Example quote

    if (loading) {
        return (<div className="section mb-10">
                <h2 className="text-2xl font-extrabold border-b border-primary pb-4 mb-6 text-foreground">Motivation</h2>
                <Skeleton className="h-24 w-full"/>
            </div>);
    }

    return (<div className="section mb-10">
            <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
                <h2 className="text-2xl font-extrabold text-primary">Motivations</h2>
                {/* The YTD button is a display/navigation element, not an editing one, so it can remain regardless of isReadOnly */}
                <Button variant="outline">
                    YTD
                </Button>
            </div>
            <div
                className="motivational-quote-card relative overflow-hidden rounded-3xl p-10 text-center border border-primary animate-pulse-glow text-white dark:text-black"
                style={{background: 'var(--gradient-primary)'}}>
                <div
                    className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%) animate-rotate-light opacity-30"></div>
                <p className="quote-text text-3xl font-extrabold leading-tight mb-4 relative z-10 text-shadow-sm">
                    <q>Work on your dreams as if your life depends on it. Because it does.</q>
                </p>
                <p className="quote-source text-lg font-semibold opacity-80 relative z-10">
                    — Unknown
                </p>
            </div>
        </div>);
};

export default MotivationsSection;