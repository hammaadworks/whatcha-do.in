'use client';

import React, {useState} from 'react';
import BaseModal from '@/components/shared/BaseModal';
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
import {Check, Loader2} from 'lucide-react';
import { IDENTITY_START_PHRASE, IDENTITY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CreateIdentityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, isPublic: boolean, color: string) => Promise<void>;
}

export const CreateIdentityModal: React.FC<CreateIdentityModalProps> = ({isOpen, onClose, onCreate}) => {
    const [title, setTitle] = useState('');
    const [prefix, setPrefix] = useState('a');
    const [isManualPrefix, setIsManualPrefix] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedColor, setSelectedColor] = useState(IDENTITY_COLORS[0]);

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
                finalTitle = `${IDENTITY_START_PHRASE} ${title.trim()}`;
            } else {
                finalTitle = `${IDENTITY_START_PHRASE} ${prefix} ${title.trim()}`;
            }
            
            await onCreate(finalTitle, isPublic, selectedColor);
            // Reset state
            setTitle('');
            setPrefix('a');
            setIsManualPrefix(false);
            setIsPublic(false);
            setSelectedColor(IDENTITY_COLORS[0]);
            onClose();
        } catch (error) {
            console.error("Failed to create identity", error);
        } finally {
            setIsCreating(false);
        }
    };

    const footerContent = (
        <>
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
                Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !title.trim()}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Create
            </Button>
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Define New Identity"
            description="Who do you want to become?"
            footerContent={footerContent}
            className="sm:max-w-[500px]"
        >
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="identity-title">Identity Statement</Label>
                    <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-lg font-medium whitespace-nowrap text-muted-foreground">{IDENTITY_START_PHRASE}</span>
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
                            className="flex-1 min-w-[150px]"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Color Code</Label>
                    <div className="flex flex-wrap gap-2">
                        {IDENTITY_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                className={cn(
                                    "w-6 h-6 rounded-full transition-all flex items-center justify-center",
                                    color,
                                    selectedColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-110 opacity-70 hover:opacity-100"
                                )}
                            >
                                {selectedColor === color && <Check className="w-3 h-3 text-white drop-shadow-md" strokeWidth={3} />}
                            </button>
                        ))}
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
        </BaseModal>
    );
};
