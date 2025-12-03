'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { MovingBorder } from '@/components/ui/moving-border';
import { UserClock } from './UserClock';
import { MarkdownEditor } from '@/components/journal/MarkdownEditor';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X, Loader2 } from 'lucide-react';

interface ProfileLayoutProps {
    username: string;
    bio: string | null;
    isOwner: boolean;
    timezone?: string | null;
    onTimezoneChange?: (newTimezone: string) => Promise<void>;
    onBioUpdate?: (newBio: string) => Promise<void>;
    children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ username, bio, isOwner, timezone, onTimezoneChange, onBioUpdate, children }) => {
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [editedBio, setEditedBio] = useState(bio || '');
    const [isSavingBio, setIsSavingBio] = useState(false);

    const bioContent = bio || (isOwner ? 'This is your private dashboard. Your bio will appear here.' : 'This user has not set a bio yet.');

    const handleSaveBio = async () => {
        if (onBioUpdate) {
            setIsSavingBio(true);
            try {
                await onBioUpdate(editedBio);
                setIsEditingBio(false);
            } catch (error) {
                console.error("Failed to update bio", error);
            } finally {
                setIsSavingBio(false);
            }
        }
    };

    const handleCancelBio = () => {
        setEditedBio(bio || '');
        setIsEditingBio(false);
    };

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
                
                <div className="bio-container mb-8 max-w-3xl mx-auto relative group min-h-[3rem]">
                     {isEditingBio ? (
                        <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                            <MarkdownEditor value={editedBio} onChange={setEditedBio} className="min-h-[200px]" />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={handleCancelBio} disabled={isSavingBio}>
                                    <X className="h-4 w-4 mr-1" /> Cancel
                                </Button>
                                <Button size="sm" onClick={handleSaveBio} disabled={isSavingBio}>
                                    {isSavingBio ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex justify-center">
                             <div className="bio text-lg text-muted-foreground text-center leading-relaxed prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{bioContent}</ReactMarkdown>
                            </div>
                            {isOwner && onBioUpdate && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 md:-right-12 md:top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        setEditedBio(bio || '');
                                        setIsEditingBio(true);
                                    }}
                                    title="Edit Bio"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
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