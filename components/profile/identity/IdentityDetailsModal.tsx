'use client';

import React, {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Loader2, Plus, Trash2, X} from 'lucide-react';
import {Habit, Identity} from '@/lib/supabase/types';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from '@/components/ui/command';

interface IdentityDetailsModalProps {
    identity: Identity;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, updates: Partial<Identity>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    allHabits: Habit[];
    linkedHabits: Habit[];
    onLinkHabit: (habitId: string) => Promise<void>;
    onUnlinkHabit: (habitId: string) => Promise<void>;
    isReadOnly?: boolean; // Add isReadOnly prop
}

export const IdentityDetailsModal: React.FC<IdentityDetailsModalProps> = ({
                                                                              identity,
                                                                              isOpen,
                                                                              onClose,
                                                                              onUpdate,
                                                                              onDelete,
                                                                              allHabits,
                                                                              linkedHabits,
                                                                              onLinkHabit,
                                                                              onUnlinkHabit,
                                                                              isReadOnly = false // Set default to false
                                                                          }) => {
    const [title, setTitle] = useState(identity.title);
    const [description, setDescription] = useState(identity.description || '');
    const [isPublic, setIsPublic] = useState(identity.is_public);
    const [isSaving, setIsSaving] = useState(false);
    const [isLinking, setIsLinking] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);

    // Reset state when identity changes
    useEffect(() => {
        if (isOpen) {
            setTitle(identity.title);
            setDescription(identity.description || '');
            setIsPublic(identity.is_public);
        }
    }, [identity, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(identity.id, {title, description, is_public: isPublic});
            onClose();
        } catch (error) {
            console.error("Failed to update identity", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this identity?")) {
            setIsSaving(true);
            try {
                await onDelete(identity.id);
                onClose();
            } catch (error) {
                console.error("Failed to delete identity", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleLink = async (habitId: string) => {
        setIsLinking(true);
        try {
            await onLinkHabit(habitId);
            setOpenCombobox(false);
        } catch (error) {
            console.error("Failed to link habit", error);
        } finally {
            setIsLinking(false);
        }
    };

    const handleUnlink = async (habitId: string) => {
        setIsLinking(true);
        try {
            await onUnlinkHabit(habitId);
        } catch (error) {
            console.error("Failed to unlink habit", error);
        } finally {
            setIsLinking(false);
        }
    };

    const availableHabits = allHabits.filter(h => !linkedHabits.find(lh => lh.id === h.id));

    return (<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Identity Details</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Core Fields */}
                    <div className="grid gap-2">
                        <Label htmlFor="edit-title">Identity Statement</Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isReadOnly} // Disable if read-only
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-desc">Description / Why?</Label>
                        <Textarea
                            id="edit-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Why is this identity important to you?"
                            className="min-h-[100px]"
                            disabled={isReadOnly} // Disable if read-only
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="edit-public">Publicly Visible</Label>
                        <Switch
                            id="edit-public"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                            disabled={isReadOnly} // Disable if read-only
                        />
                    </div>

                    {/* Habits Linking */}
                    <div className="grid gap-2">
                        <Label>Backed By Habits</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {linkedHabits.map(habit => (<Badge key={habit.id} variant="secondary"
                                                               className="pl-2 pr-1 py-1 flex items-center gap-1">
                                    {habit.name}
                                    {!isReadOnly && ( // Only show unlink button if not read-only
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 hover:bg-destructive/20 rounded-full"
                                            onClick={() => handleUnlink(habit.id)}
                                            disabled={isLinking}
                                        >
                                            <X className="h-3 w-3"/>
                                        </Button>)}
                                </Badge>))}
                            {linkedHabits.length === 0 && (
                                <span className="text-sm text-muted-foreground italic">No habits linked yet.</span>)}
                        </div>

                        {!isReadOnly && ( // Only show link habit button if not read-only
                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                        {isLinking ? "Linking..." : "Link a Habit..."}
                                        <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search habits..."/>
                                        <CommandList>
                                            <CommandEmpty>No habits found.</CommandEmpty>
                                            <CommandGroup heading="Available Habits">
                                                {availableHabits.map(habit => (<CommandItem
                                                        key={habit.id}
                                                        value={habit.name}
                                                        onSelect={() => handleLink(habit.id)}
                                                    >
                                                        {habit.name}
                                                    </CommandItem>))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>)}
                    </div>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    {!isReadOnly && ( // Only show delete button if not read-only
                        <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isSaving}>
                            <Trash2 className="h-4 w-4"/>
                        </Button>)}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isSaving || isReadOnly}>Cancel</Button>
                        {!isReadOnly && ( // Only show save button if not read-only
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Save
                            </Button>)}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>);
};
