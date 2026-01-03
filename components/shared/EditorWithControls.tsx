'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CustomMarkdownEditor as MarkdownEditor } from '@/components/shared/CustomMarkdownEditor';
import { Check, Loader2, X } from 'lucide-react';
import { uploadJournalMedia, getSignedUrlForPath } from '@/lib/supabase/storage';
import { useAuth } from '@/packages/auth/hooks/useAuth';
import { ProUpgradeModal } from '@/components/shared/ProUpgradeModal';
import { toast } from 'sonner';

interface EditorWithControlsProps {
    initialContent: string;
    onSave: (content: string) => Promise<void>;
    userId: string;
    isOwner: boolean;
    placeholder?: string;
    uploadIsPublic: boolean;
    isLoading?: boolean;
    className?: string;
    onDirtyChange?: (isDirty: boolean) => void;
}

export function EditorWithControls({
    initialContent,
    onSave,
    userId,
    isOwner,
    placeholder,
    uploadIsPublic,
    isLoading = false,
    className,
    onDirtyChange
}: EditorWithControlsProps) {
    const { user } = useAuth();
    const [content, setContent] = useState(initialContent);
    const [isSaving, setIsSaving] = useState(false);
    const [isProModalOpen, setIsProModalOpen] = useState(false);
    const lastSavedContentRef = useRef(initialContent);

    // Sync state when initialContent changes (e.g. changing dates)
    useEffect(() => {
        setContent(initialContent);
        lastSavedContentRef.current = initialContent;
    }, [initialContent]);

    const handleSave = async () => {
        if (!isOwner) return;
        setIsSaving(true);
        try {
            await onSave(content);
            lastSavedContentRef.current = content;
            toast.success("Changes saved successfully");
        } catch (error) {
            console.error("Failed to save", error);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setContent(lastSavedContentRef.current);
        toast.info("Changes discarded");
    };

    const handleUpload = useCallback(async (file: File): Promise<string> => {
        if (!isOwner) throw new Error("Permission denied");

        if (!user?.is_pro) {
            setIsProModalOpen(true);
            throw new Error("Pro membership required");
        }

        const { path } = await uploadJournalMedia(file, userId, uploadIsPublic);
        return `![Image](${path})`;
    }, [isOwner, uploadIsPublic, userId, user?.is_pro]);

    const resolveImage = useCallback(async (src: string): Promise<string | null> => {
        if (src.startsWith('storage://')) {
            return await getSignedUrlForPath(src);
        }
        return src;
    }, []);

    const isDirty = content !== lastSavedContentRef.current;

    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    return (
        <div className={`flex flex-col h-full overflow-hidden ${className || ''}`}>
            <div className="flex-grow overflow-hidden relative">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground bg-card rounded-md border border-dashed">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        Loading...
                    </div>
                ) : (
                    <MarkdownEditor
                        value={content}
                        onChange={setContent}
                        placeholder={placeholder}
                        readOnly={!isOwner}
                        className="h-full border-0"
                        onUpload={handleUpload}
                        resolveImageUrl={resolveImage}
                        fullHeight
                    />
                )}
            </div>
            
            {isOwner && (
                <div className="flex justify-end gap-2 p-4 border-t bg-muted/20 shrink-0">
                    <Button variant="outline" onClick={handleCancel} disabled={!isDirty || isSaving}>
                        <X className="h-4 w-4 mr-1" /> Revert
                    </Button>
                    <Button onClick={handleSave} disabled={!isDirty || isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> :
                            <Check className="h-4 w-4 mr-1" />}
                        Save Changes
                    </Button>
                </div>
            )}
            
            <ProUpgradeModal open={isProModalOpen} onOpenChange={setIsProModalOpen} />
        </div>
    );
}
