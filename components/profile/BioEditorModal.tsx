'use client';

import React, {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {CustomMarkdownEditor} from '@/components/shared/CustomMarkdownEditor';
import {Check, Loader2, X} from 'lucide-react';

interface BioEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newBio: string) => Promise<void>;
    initialBio: string | null;
}

export const BioEditorModal: React.FC<BioEditorModalProps> = ({isOpen, onClose, onSave, initialBio}) => {
    const [bio, setBio] = useState(initialBio || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setBio(initialBio || '');
        }
    }, [isOpen, initialBio]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(bio);
            onClose();
        } catch (error) {
            console.error("Failed to save bio", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] h-[95vh] max-w-none sm:max-w-none flex flex-col p-4 sm:p-6 overflow-hidden rounded-xl border shadow-2xl">
                <DialogHeader className="px-6 pt-6 sm:px-0 sm:pt-0">
                    <DialogTitle className="text-2xl font-bold text-primary">Edit Bio</DialogTitle>
                </DialogHeader>

                <div className="flex-grow overflow-hidden p-6 sm:px-0">
                    <CustomMarkdownEditor
                        value={bio}
                        onChange={setBio}
                        className="h-full border rounded-md overflow-y-auto resize-none"
                        fullHeight
                    />
                </div>

                <DialogFooter className="px-6 pb-6 sm:px-0 sm:pb-0 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        <X className="h-4 w-4 mr-1"/> Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1"/> :
                            <Check className="h-4 w-4 mr-1"/>}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>);
};
