'use client';

import React, { useState } from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {EditorWithControls} from '@/components/shared/EditorWithControls';
import {cn} from '@/lib/utils';
import {Globe} from 'lucide-react';

interface BioEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newBio: string) => Promise<void>;
    initialBio: string | null;
    userId: string;
}

export const BioEditorModal: React.FC<BioEditorModalProps> = ({isOpen, onClose, onSave, initialBio, userId}) => {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    
    const handleSave = async (content: string) => {
        await onSave(content);
        setHasUnsavedChanges(false);
        onClose();
    };

    const handleCloseAttempt = (open: boolean) => {
        if (open) return; // Opening is always allowed
        
        if (hasUnsavedChanges) {
            setShowCloseConfirm(true);
        } else {
            onClose();
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
                <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl h-[95vh] flex flex-col p-4 sm:p-6 overflow-hidden rounded-xl border shadow-2xl gap-0">
                    <DialogHeader className="px-6 pt-6 pb-4 sm:px-0 sm:pt-0">
                        <DialogTitle className="text-2xl font-bold text-primary">Edit Bio</DialogTitle>
                    </DialogHeader>

                    <div 
                        className={cn(
                            "flex-grow overflow-hidden rounded-md border transition-all duration-500",
                            "bg-accent/[0.05] border-accent/20"
                        )}
                        style={{
                            backgroundImage: `linear-gradient(to right, hsl(var(--foreground) / 0.07) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.07) 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    >
                        <EditorWithControls
                            initialContent={initialBio || ''}
                            onSave={handleSave}
                            userId={userId}
                            isOwner={true} // Bio is always editable by owner in this modal
                            uploadIsPublic={true}
                            placeholder="Tell your story..."
                            onDirtyChange={setHasUnsavedChanges}
                            watermark={
                                <div className="opacity-[0.05] dark:opacity-[0.08] flex items-center justify-center w-full h-full">
                                    <Globe className="w-1/3 h-auto max-w-[12rem] min-w-[4rem] text-accent" />
                                </div>
                            }
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to discard them and leave?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            setShowCloseConfirm(false);
                            setHasUnsavedChanges(false);
                            onClose();
                        }}>
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
