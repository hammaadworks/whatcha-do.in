'use client';

import React from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {EditorWithControls} from '@/components/shared/EditorWithControls';

interface BioEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newBio: string) => Promise<void>;
    initialBio: string | null;
    userId: string;
}

export const BioEditorModal: React.FC<BioEditorModalProps> = ({isOpen, onClose, onSave, initialBio, userId}) => {
    
    const handleSave = async (content: string) => {
        await onSave(content);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] h-[95vh] max-w-none sm:max-w-none flex flex-col p-4 sm:p-6 overflow-hidden rounded-xl border shadow-2xl gap-0">
                <DialogHeader className="px-6 pt-6 pb-4 sm:px-0 sm:pt-0">
                    <DialogTitle className="text-2xl font-bold text-primary">Edit Bio</DialogTitle>
                </DialogHeader>

                <div className="flex-grow overflow-hidden border rounded-md">
                    <EditorWithControls
                        initialContent={initialBio || ''}
                        onSave={handleSave}
                        userId={userId}
                        isOwner={true} // Bio is always editable by owner in this modal
                        uploadIsPublic={true}
                        placeholder="Tell your story..."
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
