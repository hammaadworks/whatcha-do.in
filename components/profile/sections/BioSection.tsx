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
        <div className="bio-container w-full h-full flex flex-col p-6"> {/* Added p-6 for internal padding */}
            <div className="flex justify-between items-start mb-4"> {/* Removed border-b, adjusted spacing */}
                <h2 className="text-xl font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    Bio
                </h2>
                {isOwner && onBioUpdate && !isReadOnly && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => setIsBioModalOpen(true)}
                                    title="Edit Bio"
                                >
                                    <Pencil className="h-4 w-4"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Bio</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            
            <div className="flex-grow">
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-left leading-relaxed break-words text-foreground/90">
                    <ReactMarkdown
                        remarkPlugins={[remarkBreaks]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                            a: ({node, ...props}) => <a {...props} className="text-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer"/>,
                            p: ({node, ...props}) => <p {...props} className="mb-4 last:mb-0 leading-7"/>,
                            strong: ({node, ...props}) => <strong {...props} className="text-foreground font-bold"/>,
                            h1: ({node, ...props}) => <h1 {...props} className="text-foreground text-3xl font-bold mt-6 mb-4 border-b border-border/50 pb-2"/>,
                            h2: ({node, ...props}) => <h2 {...props} className="text-foreground text-2xl font-bold mt-5 mb-3"/>,
                            h3: ({node, ...props}) => <h3 {...props} className="text-foreground text-xl font-bold mt-4 mb-2"/>,
                            h4: ({node, ...props}) => <h4 {...props} className="text-foreground text-lg font-bold mt-3 mb-1"/>,
                            blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4"/>,
                            ul: ({node, ...props}) => <ul {...props} className="list-disc pl-5 space-y-1 my-2"/>,
                            ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-5 space-y-1 my-2"/>,
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