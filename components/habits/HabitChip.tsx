"use client";

import React, {useState} from 'react';
import {CompletionsData, Habit} from '@/lib/supabase/types';
import HabitInfoModal from './HabitInfoModal';
import {HabitCompletionsModal} from './HabitCompletionsModal';
import {GripVertical, Info, Skull} from 'lucide-react';
import {HabitBoxType, HabitState} from '@/lib/enums';
import {cn} from '@/lib/utils';
import {useAuth} from '@/hooks/useAuth';
import {useSimulatedTime} from '@/components/layout/SimulatedTimeProvider';
import {daysSince, getReferenceDateUI, getTodayISO} from '@/lib/date';
import {SyntheticListenerMap} from '@dnd-kit/core/dist/hooks/utilities';

interface HabitChipProps {
    habit: Habit;
    isOwner?: boolean;
    // Owner-only props
    onHabitUpdated?: (habitId: string, name: string, isPublic: boolean, goalValue?: number | null, goalUnit?: string | null) => void;
    onHabitDeleted?: (habitId: string) => void;
    onHabitCompleted?: (habitId: string, data: CompletionsData) => void;
    onHabitMove?: (habitId: string, targetBox: HabitBoxType) => Promise<void>; // New prop
    box: HabitBoxType;
    // Visual/Public props
    disableClick?: boolean;
    rightAddon?: React.ReactNode;
    dragListeners?: SyntheticListenerMap; // New prop for dnd-kit listeners
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
                                                        onHabitMove,
                                                        box,
                                                        disableClick = false,
                                                        rightAddon,
                                                        dragListeners
                                                    }) => {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const {user} = useAuth();
    const {simulatedDate} = useSimulatedTime();

    // Canonical Time Logic
    const timezone = user?.timezone || 'UTC';
    const refDate = getReferenceDateUI(simulatedDate);
    const todayISO = getTodayISO(timezone, refDate);

    const isJunked = habit.habit_state === HabitState.JUNKED;
    const canBeDeleted = box === HabitBoxType.PILE;

    // Calculate days neglected using ISO dates
    const junkedISO = habit.junked_at ? getTodayISO(timezone, new Date(habit.junked_at)) : null;
    const daysNeglected = isJunked && junkedISO ? daysSince(junkedISO, todayISO) : 0;

    const handleClick = () => {
        if (disableClick) return;
        setIsInfoModalOpen(true);
    };

    return (<>
        <div className="group relative flex items-center w-fit">
            <div
                onClick={handleClick}
                className={cn("group relative flex items-center gap-x-2 rounded-full py-2.5 pl-3 pr-4 font-bold border transition-colors w-fit", isJunked ? "bg-gray-800 text-gray-300 border-gray-600 grayscale border-dashed cursor-not-allowed" : "bg-[--chip-bg] text-[--chip-text] border-[--chip-border] hover:bg-[--secondary-bg]", (disableClick || isJunked) ? "cursor-default" : "cursor-pointer")}
            >
                {/* Drag Handle (Only if listeners provided) */}
                {dragListeners && (
                    <div
                        {...dragListeners}
                        onClick={(e) => e.stopPropagation()} // Prevent click propagation
                        className="cursor-grab hover:text-primary active:cursor-grabbing p-1 -ml-1 text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors touch-none"
                    >
                        <GripVertical size={16}/>
                    </div>
                )}

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
            onHabitMove={isOwner ? onHabitMove : undefined} // Pass to modal
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
