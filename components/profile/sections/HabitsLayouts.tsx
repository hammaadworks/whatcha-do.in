import React from 'react';
import {HabitBox} from '@/components/habits/HabitBox';
import {MovingBorder} from '@/components/ui/moving-border';
import {Button} from '@/components/ui/button';
import {HabitBoxType} from '@/lib/enums';
import {Habit} from '@/lib/supabase/types';

interface HabitsLayoutProps {
    todayHabits: Habit[];
    yesterdayHabits: Habit[];
    pileHabits: Habit[]; // For desktop, or the slice for mobile
    renderHabitChip: (h: Habit) => React.ReactNode;
    isReadOnly: boolean;
    activeId: string | null;
    showAllPileHabits?: boolean;
    setShowAllPileHabits?: (show: boolean) => void;
    hasMoreHabits?: boolean;
}

export const MobileHabitsLayout: React.FC<HabitsLayoutProps> = ({
                                                                    todayHabits,
                                                                    yesterdayHabits,
                                                                    pileHabits,
                                                                    renderHabitChip,
                                                                    isReadOnly,
                                                                    activeId,
                                                                    showAllPileHabits,
                                                                    setShowAllPileHabits,
                                                                    hasMoreHabits
                                                                }) => {
    return (
        <div className="md:hidden flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-xl shadow">
                <HabitBox
                    id={HabitBoxType.TODAY}
                    habits={todayHabits}
                    renderHabit={renderHabitChip}
                    className="p-4 bg-background border border-primary rounded-xl z-10 relative min-h-[100px]"
                    disabled={isReadOnly}
                    emptyMessage={activeId ? "" : "No habits for today."}
                />
                <div className="absolute inset-0 rounded-[inherit] z-20 pointer-events-none">
                    <MovingBorder duration={8000} rx="6" ry="6">
                        <div
                            className="h-1 w-8 bg-[radial-gradient(var(--primary)_60%,transparent_100%)] opacity-100 shadow-[0_0_25px_var(--primary)]"/>
                    </MovingBorder>
                </div>
            </div>

            <HabitBox
                id={HabitBoxType.YESTERDAY}
                habits={yesterdayHabits}
                renderHabit={renderHabitChip}
                className={`p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden min-h-[100px] ${yesterdayHabits.length > 0 ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
                disabled={isReadOnly}
                emptyMessage={activeId ? "" : "No habits from yesterday."}
                headerContent={yesterdayHabits.length > 0 ? <span
                    className="text-xs text-orange-500 font-bold animate-pulse">Complete to save streak!</span> : null}
            />

            <HabitBox
                id={HabitBoxType.PILE}
                habits={pileHabits}
                renderHabit={renderHabitChip}
                className="p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden min-h-[100px]"
                disabled={isReadOnly}
                emptyMessage={activeId ? "" : "The Pile is empty."}
                footerContent={hasMoreHabits && setShowAllPileHabits && (
                    <Button
                        variant="ghost"
                        onClick={() => setShowAllPileHabits(!showAllPileHabits)}
                        className="mt-2 w-full"
                    >
                        {showAllPileHabits ? 'Show Less' : 'Show More'}
                    </Button>
                )}
            />
        </div>
    );
};

export const DesktopHabitsLayout: React.FC<HabitsLayoutProps> = ({
                                                                     todayHabits,
                                                                     yesterdayHabits,
                                                                     pileHabits,
                                                                     renderHabitChip,
                                                                     isReadOnly,
                                                                     activeId
                                                                 }) => {
    return (
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-xl shadow">
                <HabitBox
                    id={HabitBoxType.TODAY}
                    habits={todayHabits}
                    renderHabit={renderHabitChip}
                    className="p-4 bg-background border border-primary rounded-xl z-10 relative min-h-[100px]"
                    disabled={isReadOnly}
                    emptyMessage={activeId ? "" : "No habits for today."}
                />
                <div className="absolute inset-0 rounded-[inherit] z-20 pointer-events-none">
                    <MovingBorder duration={8000} rx="6" ry="6">
                        <div
                            className="h-1 w-8 bg-[radial-gradient(var(--primary)_60%,transparent_100%)] opacity-100 shadow-[0_0_25px_var(--primary)]"/>
                    </MovingBorder>
                </div>
            </div>

            <HabitBox
                id={HabitBoxType.YESTERDAY}
                habits={yesterdayHabits}
                renderHabit={renderHabitChip}
                className={`p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden min-h-[100px] ${yesterdayHabits.length > 0 ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
                disabled={isReadOnly}
                emptyMessage={activeId ? "" : "No habits from yesterday."}
                headerContent={yesterdayHabits.length > 0 ? <span
                    className="text-xs text-orange-500 font-bold animate-pulse">Complete to save streak!</span> : null}
            />

            <HabitBox
                id={HabitBoxType.PILE}
                habits={pileHabits}
                renderHabit={renderHabitChip}
                className="p-4 bg-background border border-card-border rounded-xl shadow md:col-span-full lg:col-span-2 min-h-[100px]"
                disabled={isReadOnly}
                emptyMessage={activeId ? "" : "The Pile is empty."}
            />
        </div>
    );
};
