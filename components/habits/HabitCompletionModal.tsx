'use client';

import React, {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Slider} from '@/components/ui/slider';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Badge} from '@/components/ui/badge';
import {Clock, Dumbbell, Flame, StickyNote} from 'lucide-react';
import {Habit} from '@/lib/supabase/types';

interface HabitCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    habit: Habit;
    onConfirm: (data: CompletionData) => Promise<void>;
}

export interface CompletionData {
    mood_score: number;
    work_value?: number;
    duration_value?: number;
    duration_unit?: string;
    notes?: string;
}

export const HabitCompletionModal: React.FC<HabitCompletionModalProps> = ({isOpen, onClose, habit, onConfirm}) => {
    const [mood, setMood] = useState(50); // 0-100
    const [workValue, setWorkValue] = useState<string>('');
    const [durationValue, setDurationValue] = useState<string>('');
    const [durationUnit, setDurationUnit] = useState('minutes');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form on open
    useEffect(() => {
        if (isOpen) {
            setMood(50);
            setWorkValue('');
            setDurationValue('');
            setDurationUnit('minutes');
            setNotes('');
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const data: CompletionData = {
            mood_score: mood, notes: notes.trim() || undefined,
        };

        if (workValue) data.work_value = parseFloat(workValue);
        if (durationValue) {
            data.duration_value = parseFloat(durationValue);
            data.duration_unit = durationUnit;
        }

        try {
            await onConfirm(data);
            onClose();
        } catch (error) {
            console.error("Completion failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Complete: <span className="text-primary">{habit.name}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Streak Preview */}
                    <div className="flex justify-center items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Current</p>
                            <Badge variant="secondary" className="text-lg px-3 py-1 mt-1">{habit.current_streak}</Badge>
                        </div>
                        <div className="text-primary font-bold text-xl">→</div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">New Streak</p>
                            <Badge variant="default" className="text-lg px-3 py-1 mt-1 bg-green-500 hover:bg-green-600">
                                <Flame className="w-4 h-4 mr-1 fill-current"/>
                                {habit.current_streak + 1}
                            </Badge>
                        </div>
                    </div>

                    {/* Mood / Fuel Meter */}
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Label>Mood / Energy</Label>
                            <span className="text-sm font-bold text-primary">{mood}%</span>
                        </div>
                        <Slider
                            defaultValue={[50]}
                            max={100}
                            step={10}
                            value={[mood]}
                            onValueChange={(val) => setMood(val[0])}
                            className="cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>Drained</span>
                            <span>Neutral</span>
                            <span>Pumped</span>
                        </div>
                    </div>

                    {/* Work / Goal Input */}
                    {habit.goal_value && (<div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Dumbbell size={16}/>
                                Work Done (Goal: {habit.goal_value} {habit.goal_unit})
                            </Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="number"
                                    placeholder={`${habit.goal_value}`}
                                    value={workValue}
                                    onChange={(e) => setWorkValue(e.target.value)}
                                />
                                <span className="text-sm font-medium text-muted-foreground">
                                    {habit.goal_unit}
                                </span>
                            </div>
                        </div>)}

                    {/* Duration */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Clock size={16}/> Duration
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="0"
                                value={durationValue}
                                onChange={(e) => setDurationValue(e.target.value)}
                                className="flex-1"
                            />
                            <Select value={durationUnit} onValueChange={setDurationUnit}>
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minutes">mins</SelectItem>
                                    <SelectItem value="hours">hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <StickyNote size={16}/> Reflections
                        </Label>
                        <Textarea
                            placeholder="How did it go?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none h-20"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? "Logging..." : "Complete Habit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>);
};
