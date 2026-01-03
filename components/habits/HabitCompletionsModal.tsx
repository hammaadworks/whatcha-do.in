"use client";

import React, {useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {CompletionsData, Habit} from "@/lib/supabase/types";
import {HabitState} from "@/lib/enums";
import {Calendar as CalendarIcon, Clock, Dumbbell, Flame, StickyNote} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/shared/Calendar";
import {format} from "date-fns";
import {useSimulatedTime} from "@/components/layout/SimulatedTimeProvider";
import {getReferenceDateUI} from "@/lib/date";

interface HabitCompletionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    habit: Habit;
    onConfirm: (data: CompletionsData) => Promise<void>;
}

/**
 * Modal for logging the completion of a habit.
 * Collects metadata like mood, duration, and notes.
 */
export const HabitCompletionsModal: React.FC<HabitCompletionsModalProps> = ({isOpen, onClose, habit, onConfirm}) => {
    const {simulatedDate} = useSimulatedTime();
    const refDate = getReferenceDateUI(simulatedDate);

    const [mood, setMood] = useState(3); // 1-5
    const [workValue, setWorkValue] = useState<string>("");
    const [timeTaken, setTimeTaken] = useState<string>("");
    const [timeTakenUnit, setTimeTakenUnit] = useState("minutes");
    const [notes, setNotes] = useState("");
    const [dedicatedDate, setDedicatedDate] = useState<Date | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const isTodayCompleted = habit.habit_state === HabitState.TODAY;
    const isGoalUnitTimeBased = habit.goal_unit === "minutes" || habit.goal_unit === "hours";

    // Reset form on open
    useEffect(() => {
        if (isOpen) {
            setMood(3);
            setWorkValue("");
            setTimeTaken("");
            setTimeTakenUnit("minutes");
            setNotes("");
            setDedicatedDate(isTodayCompleted ? refDate : undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const data: CompletionsData = {
            mood: mood, notes: notes.trim() || undefined, attributed_date: dedicatedDate || undefined
        };

        if (workValue) {
            data.work_value = Number.parseFloat(workValue);
            if (isGoalUnitTimeBased) {
                data.time_taken = Number.parseFloat(workValue);
                data.time_taken_unit = habit.goal_unit as "minutes" | "hours";
            }
        }

        if (!isGoalUnitTimeBased && timeTaken) {
            data.time_taken = Number.parseFloat(timeTaken);
            data.time_taken_unit = timeTakenUnit;
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
        <DialogContent
            className="sm:max-w-[425px] max-h-[85vh] flex flex-col w-[95vw] p-0 gap-0 overflow-hidden rounded-xl">
            <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b shrink-0 bg-background/95 backdrop-blur z-10">
                <DialogTitle className="flex items-center gap-2 text-xl leading-tight text-left">
                    Complete: <span className="text-primary truncate">{habit.name}</span>
                </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Streak Preview */}
                <div
                    className="flex justify-center items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/50 shrink-0">
                    <div className="text-center min-w-[60px]">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Current</p>
                        <Badge variant="secondary"
                               className="text-base sm:text-lg px-3 py-1 bg-secondary text-secondary-foreground border shadow-sm">{habit.streak < 1 ? habit.streak + 1 : habit.streak}</Badge>
                    </div>
                    <div className="text-muted-foreground/40 font-bold text-xl">→</div>
                    <div className="text-center min-w-[60px]">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">
                            {isTodayCompleted ? "Extra 🔥" : "New Streak"}
                        </p>
                        <Badge variant="default"
                               className="text-base sm:text-lg px-3 py-1 bg-primary text-primary-foreground shadow-md shadow-primary/20">
                            <Flame className="w-4 h-4 mr-1 fill-current"/>
                            {habit.streak + 1}
                        </Badge>
                    </div>
                </div>

                {/* Mood Emoji Picker */}
                <div className="space-y-3 shrink-0">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">How ya
                        feeling!</Label>
                    <div className="flex flex-wrap justify-between gap-3">
                        {[{value: 1, emoji: "😫", label: "Drained"}, {value: 2, emoji: "😕", label: "Meh"}, {
                            value: 3, emoji: "😐", label: "Okay"
                        }, {value: 4, emoji: "🙂", label: "Good"}, {
                            value: 5, emoji: "🤩", label: "Pumped!"
                        }].map((item) => (<button
                            key={item.value}
                            onClick={() => setMood(item.value)}
                            className={cn("flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[56px] flex-1", mood === item.value ? "bg-primary/10 ring-2 ring-primary scale-105 shadow-sm" : "hover:bg-muted/60 opacity-60 hover:opacity-100")}
                            type="button"
                        >
                            <span className="text-2xl sm:text-3xl mb-1 filter drop-shadow-sm">{item.emoji}</span>
                            <span
                                className="text-[10px] font-medium text-center leading-tight whitespace-nowrap">{item.label}</span>
                        </button>))}
                    </div>
                </div>

                {/* Work / Goal Input */}
                {habit.goal_value && (<div className="space-y-2 shrink-0">
                    <Label
                        className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                        <Dumbbell size={14}/>
                        Work Done <span
                        className="font-normal normal-case opacity-70">(Goal: {habit.goal_value} {habit.goal_unit})</span>
                    </Label>
                    <div className="flex gap-2 items-center">
                        <Input
                            type="number"
                            placeholder={`${habit.goal_value}`}
                            min="1"                     // 1. Prevents browser arrows from dipping below 1
                            inputMode="numeric"        // 2. Mobile UX: Forces number-only keypad
                            onKeyDown={(e) => {
                                // 3. Blocks keys for "-", "+", and scientific notation "e"
                                if (["-", "+", "e", "E"].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onPaste={(e) => {
                                // 4. Sanitizes pasted content to block negative values
                                const pasteData = e.clipboardData.getData("text");
                                if (Number(pasteData) < 0) {
                                    e.preventDefault();
                                }
                            }}
                            value={workValue}
                            onChange={(e) => {
                                const val = Number.parseFloat(e.target.value);
                                // 5. Only updates state if it's a positive number or cleared empty
                                if (val > 0 || e.target.value === "") {
                                    setWorkValue(e.target.value);
                                }
                            }}
                            className="h-11 text-lg"
                        />

                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[3ch]">
                {habit.goal_unit}
            </span>
                    </div>
                </div>)}

                {/* Duration */}
                {!isGoalUnitTimeBased && (<div className="space-y-2 shrink-0">
                        <Label
                            className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                            <Clock size={14}/> Duration
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="0"
                                min="1"                     // 1. Prevents browser arrows from dipping below 1
                                inputMode="numeric"        // 2. Mobile UX: Forces the pure number keypad
                                onKeyDown={(e) => {
                                    // 3. Prevent typing symbols like "-", "+", and "e"
                                    if (["-", "+", "e", "E"].includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                onPaste={(e) => {
                                    // 4. Sanitizes pasted content to block negative values
                                    const pasteData = e.clipboardData.getData("text");
                                    if (Number(pasteData) < 0) {
                                        e.preventDefault();
                                    }
                                }}
                                value={timeTaken}
                                onChange={(e) => {
                                    const val = Number.parseFloat(e.target.value);
                                    // 5. Final state check: only allow positive values or empty input
                                    if (val > 0 || e.target.value === "") {
                                        setTimeTaken(e.target.value);
                                    }
                                }}
                                className="flex-1 h-11 text-lg"
                            />

                            <Select value={timeTakenUnit} onValueChange={setTimeTakenUnit}>
                                <SelectTrigger className="w-[110px] h-11">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minutes">mins</SelectItem>
                                    <SelectItem value="hours">hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>)}

                {/* Dedicate Date (Super Streak) - Only visible if already completed today */}
                {isTodayCompleted && (
                    <div className="space-y-2 bg-secondary/20 p-3 rounded-lg border border-secondary/20 shrink-0">
                        <Label
                            className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">
                            <CalendarIcon size={14}/> Redeem a missed day?
                        </Label>
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal h-11", !dedicatedDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                    {dedicatedDate ? format(dedicatedDate, "PPP") :
                                        <span>Pick a date (Default: Today)</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="center" sideOffset={4}>
                                <Calendar
                                    mode="single"
                                    selected={dedicatedDate}
                                    onSelect={(date) => {
                                        setDedicatedDate(date);
                                        setIsPopoverOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-1">
                            Select a past date to fill a gap in your streak history.
                        </p>
                    </div>)}

                {/* Notes */}
                <div className="space-y-2 shrink-0">
                    <Label
                        className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                        <StickyNote size={14}/> Reflections
                    </Label>
                    <Textarea
                        placeholder="How did it go? Any blockers?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="resize-none min-h-[100px] text-sm leading-relaxed"
                    />
                </div>
            </div>

            <DialogFooter
                className="px-4 py-3 sm:px-6 sm:py-4 border-t gap-4 sm:gap-3 flex-col-reverse sm:flex-row bg-background/95 backdrop-blur z-10 shrink-0">
                <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="h-11 w-full sm:w-auto">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}
                        className="h-11 w-full sm:w-auto bg-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all">
                    {isSubmitting ? "Logging..." : "Complete Habit"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>);
};
