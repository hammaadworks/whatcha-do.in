"use client";

import React, {useState} from 'react';
import {Habit} from '@/lib/supabase/types';
import {HabitChipPublic} from './HabitChipPublic';
import HabitInfoModal from './HabitInfoModal'; // Import HabitInfoModal
import {Info, CheckCircle2} from 'lucide-react'; // Import Info icon
import {HabitPileState} from '@/lib/enums';
import {HabitCompletionModal, CompletionData} from './HabitCompletionModal'; // Import CompletionModal

interface HabitChipPrivateProps {
    habit: Habit;
    onHabitUpdated: (habitId: string, name: string, isPublic: boolean, goalValue?: number | null, goalUnit?: string | null) => void;
    onHabitDeleted: (habitId: string) => void;
    onHabitCompleted: (habitId: string, data: CompletionData) => void; // New prop
    columnId?: 'today' | 'yesterday' | 'pile';
}

export const HabitChipPrivate: React.FC<HabitChipPrivateProps> = ({
                                                                      habit,
                                                                      onHabitUpdated,
                                                                      onHabitDeleted,
                                                                      onHabitCompleted,
                                                                      columnId,
                                                                  }) => {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

    const canBeDeleted = columnId === 'pile';
    const isCompletedToday = habit.pile_state === 'today' && habit.current_streak > 0; // Logic might vary based on exact state definitions, but usually "today" means completed for today?
    // Wait, "Today" column usually means "Due Today" or "Done Today"?
    // PRD: "Three-column layout (Today, Yesterday, The Pile)".
    // Usually "Today" holds habits *to be done*.
    // If completed, do they stay or move?
    // PRD 2.9: "Automatically transition between Today and Yesterday at midnight".
    // If completed, it stays in Today (marked done?).
    // Let's assume "Today" column has both.
    // But wait, usually apps move completed to "Done" section.
    // Let's assume we show a Check button if it's NOT completed today.
    // Ideally we check `last_completed_at`?
    // For MVP, let's assume we can always "Complete" it to increment streak (maybe multiple times a day for some habits?).
    // But typically once per day.

    // Let's just add the check button.

    return (<>
            <div className="group relative flex items-center w-fit">
                <div className="absolute left-[-12px] z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsCompletionModalOpen(true)}
                        className="bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:scale-110 transition-transform"
                        title="Mark Complete"
                    >
                        <CheckCircle2 size={16}/>
                    </button>
                </div>

                {/* The public chip provides the base visuals */}
                <HabitChipPublic
                    habit={habit}
                    disableClick={true}
                    isPrivate={true} // Mark as private for styling
                    isJunked={habit.pile_state === HabitPileState.JUNKED}
                    pileState={habit.pile_state} // Pass pile_state for conditional rendering/styling
                    rightAddon={<button
                        onClick={() => setIsInfoModalOpen(true)}
                        className="rounded-full p-1.5 hover:bg-gray-500/20"
                        title="Habit Info & Actions"
                    >
                        <Info size={16}/>
                    </button>}
                />
            </div>

            {/* The Info Modal is now managed by this private component */}
            <HabitInfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                habit={habit}
                onHabitUpdated={onHabitUpdated}
                onHabitDeleted={onHabitDeleted}
                isPrivateHabit={true}
                canBeDeleted={canBeDeleted}
            />

            <HabitCompletionModal
                isOpen={isCompletionModalOpen}
                onClose={() => setIsCompletionModalOpen(false)}
                habit={habit}
                onConfirm={async (data) => onHabitCompleted(habit.id, data)}
            />
        </>);
};
