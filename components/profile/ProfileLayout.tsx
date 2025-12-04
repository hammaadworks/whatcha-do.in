'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import { MovingBorder } from '@/components/ui/moving-border';
import { UserClock } from './UserClock';
import { CustomMarkdownEditor } from '@/components/shared/CustomMarkdownEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // New import
import { ShineBorder } from '@/components/ui/shine-border';

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
        <div className="profile-container w-full mx-auto bg-card border border-primary shadow-lg rounded-3xl relative mt-8 mb-8">
            {/* User Clock positioned in the top right corner */}
            {timezone && (
                <div className="absolute top-4 right-4 z-30 md:top-6 md:right-6">
                    <UserClock timezone={timezone} />
                </div>
            )}

            {/* Main card content with its own padding and z-index */}
            <div className="relative z-10 p-6 pt-12 sm:p-8 md:p-10 lg:p-12">
                <h1 className="text-4xl font-extrabold text-center text-primary mb-8 mt-4">
                    {isOwner ? `Welcome, ${username}!` : username}
                </h1>
                
                <div className="bio-container mb-8 max-w-3xl mx-auto relative">
                     {isEditingBio ? (
                        <Card className="border-dashed">
                            <CardContent className="p-4 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                                <CustomMarkdownEditor value={editedBio} onChange={setEditedBio} className="min-h-[200px]" />
                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={handleCancelBio} disabled={isSavingBio}>
                                        <X className="h-4 w-4 mr-1" /> Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSaveBio} disabled={isSavingBio}>
                                        {isSavingBio ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                                        Save
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-muted/30 border-none shadow-sm group relative">
                            <h2 className="text-2xl font-bold text-center text-primary mb-4">Bio</h2>
                            <CardContent className="p-6 relative">
                                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-left leading-relaxed break-words">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkBreaks]}
                                        rehypePlugins={[rehypeHighlight]}
                                        components={{
                                            a: ({node, ...props}) => <a {...props} className="text-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" />,
                                            p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
                                            strong: ({node, ...props}) => <strong {...props} className="text-primary font-bold" />,
                                            h1: ({node, ...props}) => <h1 {...props} className="text-primary text-3xl font-bold mt-6 mb-2" />,
                                            h2: ({node, ...props}) => <h2 {...props} className="text-primary text-2xl font-bold mt-5 mb-2" />,
                                            h3: ({node, ...props}) => <h3 {...props} className="text-primary text-xl font-bold mt-4 mb-2" />,
                                            h4: ({node, ...props}) => <h4 {...props} className="text-primary text-lg font-bold mt-3 mb-1" />,
                                            h5: ({node, ...props}) => <h5 {...props} className="text-primary text-base font-bold mt-2 mb-1" />,
                                            h6: ({node, ...props}) => <h6 {...props} className="text-primary text-sm font-bold mt-1 mb-1" />,
                                        }}
                                    >
                                        {bioContent}
                                    </ReactMarkdown>
                                </div>
                                {isOwner && onBioUpdate && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card hover:bg-primary/20 hover:text-primary border-border hover:border-primary shadow-sm"
                                                    onClick={() => {
                                                        setEditedBio(bio || '');
                                                        setIsEditingBio(true);
                                                    }}
                                                    title="Edit Bio"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Edit Bio</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </CardContent>
                            <ShineBorder borderWidth={2} shineColor="hsl(var(--primary))" className="dark:shine" />
                        </Card>
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