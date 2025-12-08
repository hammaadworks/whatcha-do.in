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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {Loader2} from 'lucide-react';

interface CreateIdentityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, isPublic: boolean) => Promise<void>;
}

export const CreateIdentityModal: React.FC<CreateIdentityModalProps> = ({isOpen, onClose, onCreate}) => {
    const [title, setTitle] = useState('');
    const [prefix, setPrefix] = useState('a');
    const [isManualPrefix, setIsManualPrefix] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setTitle(newVal);

        if (!isManualPrefix) {
            const trimmed = newVal.trim();
            if (trimmed.length > 0) {
                // Check first letter for vowel
                const firstChar = trimmed[0].toLowerCase();
                if (['a', 'e', 'i', 'o', 'u'].includes(firstChar)) {
                    setPrefix('an');
                } else {
                    setPrefix('a');
                }
            }
        }
    };

    const handlePrefixChange = (value: string) => {
        setPrefix(value);
        setIsManualPrefix(true);
    };

    const handleCreate = async () => {
        if (!title.trim()) return;

        setIsCreating(true);
        try {
            let finalTitle = "";
            if (prefix === '-') {
                finalTitle = `I am ${title.trim()}`;
            } else {
                finalTitle = `I am ${prefix} ${title.trim()}`;
            }
            
            await onCreate(finalTitle, isPublic);
            // Reset state
            setTitle('');
            setPrefix('a');
            setIsManualPrefix(false);
            setIsPublic(false);
            onClose();
        } catch (error) {
            console.error("Failed to create identity", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    return (<Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Define New Identity</DialogTitle>
                    <DialogDescription>
                        Who do you want to become?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="identity-title">Identity Statement</Label>
                        <div className="flex gap-3 items-center">
                            <span className="text-lg font-medium whitespace-nowrap text-muted-foreground">I am</span>
                            <Select value={prefix} onValueChange={handlePrefixChange}>
                                <SelectTrigger className="w-[70px] shrink-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="a">a</SelectItem>
                                    <SelectItem value="an">an</SelectItem>
                                    <SelectItem value="-">-</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                id="identity-title"
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="Runner, Entrepreneur..."
                                className="flex-1"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
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