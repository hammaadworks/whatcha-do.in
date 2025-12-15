"use client";

import React, {useState} from 'react';
import {Habit} from '@/lib/supabase/types';
import HabitInfoModal from './HabitInfoModal';
import {CompletionsData, HabitCompletionsModal} from './HabitCompletionsModal';
import {Info, Skull} from 'lucide-react';
import {HabitBoxType, HabitState} from '@/lib/enums';
import {differenceInCalendarDays} from 'date-fns';
import {useSystemTime} from '@/components/providers/SystemTimeProvider';
import {cn} from '@/lib/utils';

interface HabitChipProps {
    habit: Habit;
    isOwner?: boolean;
    // Owner-only props
    onHabitUpdated?: (habitId: string, name: string, isPublic: boolean, goalValue?: number | null, goalUnit?: string | null) => void;
    onHabitDeleted?: (habitId: string) => void;
    onHabitCompleted?: (habitId: string, data: CompletionsData) => void;
    box: HabitBoxType;
    // Visual/Public props
    disableClick?: boolean;
    rightAddon?: React.ReactNode;
}

/**
 * A unified Habit Chip component.
 * Renders the visual representation of a habit and handles interactions based on ownership.
 */
export const HabitChip: React.FC<HabitChipProps> = ({
                                                        habit,
                                                        isOwner = false,
                                                        onHabitUpdated,
                                                        onHabitDeleted,
                                                        onHabitCompleted,
                                                        box,
                                                        disableClick = false,
                                                        rightAddon
                                                    }) => {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const {simulatedDate} = useSystemTime();

    const isJunked = habit.habit_state === HabitState.JUNKED;
    const canBeDeleted = box === HabitBoxType.PILE;

    const daysNeglected = isJunked && habit.junked_at ? differenceInCalendarDays(simulatedDate || new Date(), new Date(habit.junked_at)) : 0;

    const handleClick = () => {
        if (disableClick) return;

        // If owner, let them click to open info/actions or handle other logic?
        // The original Public chip opened Info modal on click.
        // The original Private chip disabled click on the public part and used the 'Info' icon.
        // Let's standardize: If owner, main click could open completion or info?
        // For now, adhering to "public view" behavior (opens info) unless disabled.
        setIsInfoModalOpen(true);
    };

    return (<>
            <div className="group relative flex items-center w-fit">
                <div
                    onClick={handleClick}
                    className={cn("group relative flex items-center gap-x-2 rounded-full py-2.5 pl-5 pr-4 font-bold border transition-colors w-fit", isJunked ? "bg-gray-800 text-gray-300 border-gray-600 grayscale border-dashed cursor-not-allowed" : "bg-[--chip-bg] text-[--chip-text] border-[--chip-border] hover:bg-[--secondary-bg]", (disableClick || isJunked) ? "cursor-default" : "cursor-pointer")}
                >
                    {/* Main content */}
                    <div className="flex items-center gap-x-2">
                        <span>{habit.name}</span>

                        {isJunked ? (<div
                                className="inline-block rounded-[0.5rem] bg-destructive/20 px-2 py-1 text-[0.9rem] font-extrabold text-destructive items-center gap-1">
                                <Skull size={14}/>
                                {daysNeglected > 0 ? `${daysNeglected}d` : ''}
                            </div>) : (/* Streak Counter */
                            <div
                                className="inline-block rounded-[0.5rem] bg-primary px-2 py-1 text-[0.9rem] font-extrabold text-primary-foreground items-center gap-1">
                                {habit.streak}
                            </div>)}
                    </div>

                    {/* Public Addon */}
                    {rightAddon}

                    {/* Owner Addon (Info Button) - formerly in Private wrapper */}
                    {isOwner && (<button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsInfoModalOpen(true);
                            }}
                            className="ml-2 rounded-full p-1.5 hover:bg-gray-500/20"
                            title="Habit Info & Actions"
                        >
                            <Info size={16}/>
                        </button>)}
                </div>
            </div>

            {/* Info Modal */}
            <HabitInfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                habit={habit}
                // Only pass these if owner
                onHabitUpdated={isOwner ? onHabitUpdated : undefined}
                onHabitDeleted={isOwner ? onHabitDeleted : undefined}
                isPrivateHabit={isOwner}
                canBeDeleted={canBeDeleted}
            />

            {/* Completion Modal - Only render if owner and handlers exist */}
            {isOwner && onHabitCompleted && (<HabitCompletionsModal
                    isOpen={isCompletionModalOpen}
                    onClose={() => setIsCompletionModalOpen(false)}
                    habit={habit}
                    onConfirm={async (data) => onHabitCompleted(habit.id, data)}
                />)}
        </>);
};
