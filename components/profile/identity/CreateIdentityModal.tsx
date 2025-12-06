'use client';

import React, {useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Loader2} from 'lucide-react';

interface CreateIdentityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, isPublic: boolean) => Promise<void>;
}

export const CreateIdentityModal: React.FC<CreateIdentityModalProps> = ({isOpen, onClose, onCreate}) => {
    const [title, setTitle] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) return;

        setIsCreating(true);
        try {
            await onCreate(title, isPublic);
            setTitle('');
            setIsPublic(false);
            onClose();
        } catch (error) {
            console.error("Failed to create identity", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Define New Identity</DialogTitle>
                    <DialogDescription>
                        Who do you want to become? (e.g., "I am a runner")
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="identity-title">Identity Statement</Label>
                        <Input
                            id="identity-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="I am a..."
                            autoFocus
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="public-mode">Public Identity</Label>
                        <Switch
                            id="public-mode"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={isCreating || !title.trim()}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>);
};
