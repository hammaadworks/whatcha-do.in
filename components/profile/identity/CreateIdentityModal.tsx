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
import {Check, Loader2, Plus, X} from 'lucide-react';
import { IDENTITY_START_PHRASE, IDENTITY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Habit } from '@/lib/supabase/types';
import { Badge } from '@/components/ui/badge';
import { SearchableDropdown } from '@/components/shared/SearchableDropdown';

interface CreateIdentityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, isPublic: boolean, color: string, linkedHabitIds: string[]) => Promise<void>;
    habits: Habit[];
}

export const CreateIdentityModal: React.FC<CreateIdentityModalProps> = ({isOpen, onClose, onCreate, habits}) => {
    const [title, setTitle] = useState('');
    const [prefix, setPrefix] = useState('a');
    const [isManualPrefix, setIsManualPrefix] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedColor, setSelectedColor] = useState(IDENTITY_COLORS[0]);
    const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);

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
            
            await onCreate(finalTitle, isPublic, selectedColor, selectedHabitIds);
            // Reset state
            setTitle('');
            setPrefix('a');
            setIsManualPrefix(false);
            setIsPublic(false);
            setSelectedColor(IDENTITY_COLORS[0]);
            setSelectedHabitIds([]);
            onClose();
        } catch (error) {
            console.error("Failed to create identity", error);
        } finally {
            setIsCreating(false);
        }
    };

    const toggleHabit = (habitId: string) => {
        setSelectedHabitIds(prev => 
            prev.includes(habitId) 
                ? prev.filter(id => id !== habitId)
                : [...prev, habitId]
        );
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

    const availableHabits = habits.filter(h => !selectedHabitIds.includes(h.id));
    const selectedHabitObjects = habits.filter(h => selectedHabitIds.includes(h.id));

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

                <div className="flex items-center justify-between py-2">
                    <Label htmlFor="public-mode" className="cursor-pointer font-normal">Publicly Visible</Label>
                    <Switch
                        id="public-mode"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                    />
                </div>

                {/* Habits Linking */}
                <div className="grid gap-2 mt-2">
                    <Label>Backed By Habits</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedHabitObjects.map(habit => (
                            <Badge key={habit.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                {habit.name}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 hover:bg-destructive/20 rounded-full"
                                    onClick={() => toggleHabit(habit.id)}
                                >
                                    <X className="h-3 w-3"/>
                                </Button>
                            </Badge>
                        ))}
                        {selectedHabitObjects.length === 0 && (
                            <span className="text-sm text-muted-foreground italic">No habits linked yet.</span>
                        )}
                    </div>

                    <SearchableDropdown 
                        options={availableHabits.map(h => ({ id: h.id, label: h.name }))}
                        onSelect={toggleHabit}
                        placeholder="Link a Habit..."
                        searchPlaceholder="Search habits..."
                        emptyMessage="No available habits found."
                        className="w-full"
                    />
                </div>
            </div>
        </BaseModal>
    );
};
