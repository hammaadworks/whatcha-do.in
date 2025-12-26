'use client';

import React, {useState} from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import {BioEditorModal} from '@/components/profile/BioEditorModal';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Pencil} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import {ShineBorder} from '@/components/ui/shine-border';

interface BioSectionProps {
    username: string;
    bio: string | null;
    isOwner: boolean;
    isReadOnly?: boolean;
    onBioUpdate?: (newBio: string) => Promise<void>;
}

export default function BioSection({
    username,
    bio,
    isOwner,
    isReadOnly = false,
    onBioUpdate
}: BioSectionProps) {
    const [isBioModalOpen, setIsBioModalOpen] = useState(false);

    const bioContent = bio || (isOwner ? 'This is your private dashboard. Your bio will appear here.' : 'This user has not set a bio yet.');

    const handleBioSave = async (newBio: string) => {
        if (onBioUpdate) {
            await onBioUpdate(newBio);
        }
    };

    return (
        <div className="bio-container w-full relative h-full mb-10"> {/* Added mb-10 for section spacing */}
            <div className="flex justify-between items-center border-b border-primary pb-4 mb-6 px-6">
                <h2 className="text-2xl font-extrabold text-primary">Bio</h2>
                {isOwner && onBioUpdate && !isReadOnly && ( // Repositioned edit button here
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                                                 <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground ring-offset-background transition-colors ring-2 ring-primary hover:bg-accent hover:text-accent-foreground dark:hover:bg-primary dark:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                                    onClick={() => setIsBioModalOpen(true)}
                                                                    title="Edit Bio"                                >
                                    <Pencil className="h-4 w-4"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Bio</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            <div className="p-6 pt-0 relative"> {/* Adjusted padding and relative positioning */}
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-left leading-relaxed break-words">
                    <ReactMarkdown
                        remarkPlugins={[remarkBreaks]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                            a: ({node, ...props}) => <a {...props} className="text-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer"/>,
                            p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0"/>,
                            strong: ({node, ...props}) => <strong {...props} className="text-primary font-bold"/>,
                            h1: ({node, ...props}) => <h1 {...props} className="text-primary text-3xl font-bold mt-6 mb-2"/>,
                            h2: ({node, ...props}) => <h2 {...props} className="text-primary text-2xl font-bold mt-5 mb-2"/>,
                            h3: ({node, ...props}) => <h3 {...props} className="text-primary text-xl font-bold mt-4 mb-2"/>,
                            h4: ({node, ...props}) => <h4 {...props} className="text-primary text-lg font-bold mt-3 mb-1"/>,
                            h5: ({node, ...props}) => <h5 {...props} className="text-primary text-base font-bold mt-2 mb-1"/>,
                            h6: ({node, ...props}) => <h6 {...props} className="text-primary text-sm font-bold mt-1 mb-1"/>,
                        }}
                    >
                        {bioContent}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Bio Editor Modal */}
            {isOwner && onBioUpdate && !isReadOnly && (
                <BioEditorModal
                    isOpen={isBioModalOpen}
                    onClose={() => setIsBioModalOpen(false)}
                    onSave={handleBioSave}
                    initialBio={bio}
                />
            )}
        </div>
    );
}