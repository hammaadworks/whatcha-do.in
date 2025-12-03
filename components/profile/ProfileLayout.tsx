'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MovingBorder } from '@/components/ui/moving-border';
import { UserClock } from './UserClock';

interface ProfileLayoutProps {
    username: string;
    bio: string | null;
    isOwner: boolean;
    timezone?: string | null;
    onTimezoneChange?: (newTimezone: string) => Promise<void>;
    children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ username, bio, isOwner, timezone, onTimezoneChange, children }) => {
    const bioContent = bio || (isOwner ? 'This is your private dashboard. Your bio will appear here, and you can edit it in settings.' : 'This user has not set a bio yet.');

    return (
        <div className="profile-container w-full mx-auto bg-card border border-primary shadow-lg rounded-3xl relative mt-8 mb-8 overflow-hidden">
            
            {/* User Clock positioned in the top right corner */}
            {timezone && (
                <div className="absolute top-4 right-4 z-30 md:top-6 md:right-6">
                    <UserClock timezone={timezone} />
                </div>
            )}

            {/* Main card content with its own padding and z-index */}
            <div className="relative z-10 pt-16 sm:p-6 md:p-8 lg:p-12">
                <h1 className="text-4xl font-extrabold text-center text-primary mb-2 mt-4">
                    {isOwner ? `Welcome, ${username}!` : username}
                </h1>
                
                <div className="bio text-lg text-muted-foreground text-center mb-8 leading-relaxed">
                    <ReactMarkdown>{bioContent}</ReactMarkdown>
                </div>

                <div className="main-profile-grid">
                    <div className="main-content-column">
                        {children}
                    </div>
                </div>
            </div>
            {!isOwner && (
                <div className="absolute inset-0 rounded-[inherit] z-20 pointer-events-none">
                    <MovingBorder duration={24000} rx="24" ry="24">
                        <div className="h-1 w-6 bg-[radial-gradient(var(--primary)_60%,transparent_100%)] opacity-100 shadow-[0_0_25px_var(--primary)]"/>
                    </MovingBorder>
                </div>
            )}
        </div>
    );
};

export default ProfileLayout;