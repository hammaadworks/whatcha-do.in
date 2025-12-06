'use client';

import React, {useRef, useEffect, useCallback} from 'react';
import {MovingBorder} from '@/components/ui/moving-border';
import {UserClock} from './UserClock';
import {useAuth} from '@/hooks/useAuth';
import {useUiStore} from '@/lib/store/uiStore'; // Import the Zustand store
import {toast} from 'sonner'; // Import toast for user feedback

interface ProfileLayoutProps {
    username: string;
    isOwner: boolean;
    isReadOnly?: boolean;
    timezone?: string | null;
    onTimezoneChange?: (newTimezone: string) => Promise<void>;
    children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
                                                         username,
                                                         isOwner,
                                                         isReadOnly = false,
                                                         timezone,
                                                         onTimezoneChange,
                                                         children
                                                     }) => {
    const { user: viewer } = useAuth();
    const usernameRef = useRef<HTMLHeadingElement>(null); // Ref for the username heading
    const { setUsernameSticky, setStickyUsername } = useUiStore(); // Zustand store actions

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setUsernameSticky(!entry.isIntersecting);
                setStickyUsername(entry.isIntersecting ? null : username);
            },
            {
                root: null, // relative to the viewport
                rootMargin: '0px',
                threshold: 0.1, // Trigger when 10% of the item is visible/invisible
            }
        );

        if (usernameRef.current) {
            observer.observe(usernameRef.current);
        }

        return () => {
            if (usernameRef.current) {
                observer.unobserve(usernameRef.current);
            }
        };
    }, [username, setUsernameSticky, setStickyUsername]);

    const handleCopyProfileLink = useCallback(() => {
        const profileLink = `${window.location.origin}/${username}`;
        navigator.clipboard.writeText(profileLink).then(() => {
            toast.success('Profile link copied to clipboard!');
        }).catch((err) => {
            console.error('Failed to copy: ', err);
            toast.error('Failed to copy profile link.');
        });
    }, [username]);

    return (
        <div
            className="profile-container w-full mx-auto bg-card border border-primary shadow-lg rounded-3xl relative mt-8 mb-8">
            {/* User Clock positioned in the top right corner */}
            {timezone && (
                <div className="absolute top-4 right-4 z-30 md:top-6 md:right-6">
                    <UserClock timezone={timezone} isOwner={isOwner} viewerTimezone={viewer?.timezone} />
                </div>
            )}

            {/* Main card content with its own padding and z-index */}
            <div className="relative z-10 p-6 pt-12 sm:p-8 md:p-10 lg:p-12">
                <h1
                    ref={usernameRef} // Attach ref
                    className="text-4xl font-extrabold text-center text-primary mb-8 mt-4 cursor-pointer" // Add cursor-pointer
                    onClick={handleCopyProfileLink} // Attach onClick handler
                >
                    {isOwner ? `Welcome, ${username}!` : username}
                </h1>

                <div className="main-profile-grid">
                    <div className="main-content-column">
                        {children}
                    </div>
                </div>
            </div>
            {!isOwner && (
                <div className="absolute inset-0 rounded-[inherit] z-20 pointer-events-none">
                    <MovingBorder duration={24000} rx="24" ry="24">
                        <div
                            className="h-1 w-6 bg-[radial-gradient(var(--primary)_60%,transparent_100%)] opacity-100 shadow-[0_0_25px_var(--primary)]"/>
                    </MovingBorder>
                </div>
            )}
        </div>
    );
};

export default ProfileLayout;
