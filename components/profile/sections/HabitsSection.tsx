'use client';

import React, {useState, useRef} from 'react';
import {HabitChipPrivate} from '@/components/habits/HabitChipPrivate';
import {HabitChipPublic} from '@/components/habits/HabitChipPublic';
import {mockHabitsData, mockPublicHabitsData} from '@/lib/mock-data';
import {MovingBorder} from '@/components/ui/moving-border';
import {Button} from '@/components/ui/button';
import {Habit} from '@/lib/supabase/types';
import {Skeleton} from '@/components/ui/skeleton';
import {completeHabit, deleteHabit, updateHabit} from '@/lib/supabase/habit';
import {toast} from 'sonner';
import {CompletionData, HabitCompletionModal} from '@/components/habits/HabitCompletionModal';
import {Plus} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {HabitCreatorModal} from '@/components/habits/HabitCreatorModal';
import HabitDebugPanel from '@/components/profile/sections/HabitDebugPanel';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import {useAuth} from '@/hooks/useAuth';
import { useSystemTime } from '@/components/providers/SystemTimeProvider';
import { useHabitDnd } from '@/hooks/useHabitDnd';
import { HabitColumn } from '@/components/habits/HabitColumn';
import { HabitState } from '@/lib/enums';
import UnmarkConfirmationModal from '@/components/habits/UnmarkConfirmationModal';

interface HabitsSectionProps {
    isOwner: boolean;
    isReadOnly?: boolean;
    habits?: Habit[];
    loading: boolean;
    onActivityLogged?: () => void;
}

/**
 * The main container for the Habits feature on the user profile.
 * Manages the "Today", "Yesterday", and "Pile" columns.
 * Handles drag-and-drop reordering and state transitions.
 */
const HabitsSection: React.FC<HabitsSectionProps> = ({
                                                         isOwner,
                                                         isReadOnly = false,
                                                         habits: propHabits,
                                                         loading,
                                                         onActivityLogged
                                                     }) => {
    const {user} = useAuth();
    const { simulatedDate } = useSystemTime();
    
    const baseHabits = propHabits ? propHabits : (isOwner ? mockHabitsData : mockPublicHabitsData);

    const [activeHabitForCompletion, setActiveHabitForCompletion] = useState<Habit | null>(null);
    const completionSuccessRef = useRef(false);

    // Unmark Confirmation State
    const [unmarkModalState, setUnmarkModalState] = useState<{
        habit: Habit | null;
        onConfirm: () => Promise<void>;
        onCancel: () => void;
        isOpen: boolean;
    }>({ habit: null, onConfirm: async () => {}, onCancel: () => {}, isOpen: false });

    const handleDragCompletion = (habitId: string) => {
        const habit = baseHabits.find(h => h.id === habitId);
        if (habit) {
            completionSuccessRef.current = false;
            setActiveHabitForCompletion(habit);
        }
    };

    const handleUnmarkConfirmation = (habit: Habit, onConfirm: () => Promise<void>, onCancel: () => void) => {
        setUnmarkModalState({
            habit,
            onConfirm,
            onCancel,
            isOpen: true
        });
    };

    const { 
        sensors, 
        handleDragStart, 
        handleDragEnd, 
        activeHabit, 
        optimisticHabits, 
        setOptimisticHabits,
        activeId 
    } = useHabitDnd({ 
        habits: baseHabits, 
        onHabitMoved: onActivityLogged,
        onCompleteHabit: !isReadOnly ? handleDragCompletion : undefined,
        onUnmarkConfirmation: !isReadOnly ? handleUnmarkConfirmation : undefined
    });

    const habits = optimisticHabits || baseHabits;

    const todayHabits = habits.filter(h => h.habit_state === HabitState.TODAY);
    const yesterdayHabits = habits.filter(h => h.habit_state === HabitState.YESTERDAY);
    const pileHabits = habits.filter(h => h.habit_state === HabitState.PILE_LIVELY || h.habit_state === HabitState.PILE_JUNKED || h.habit_state === 'pile' || h.habit_state === 'active');

    const HabitChipComponent = isOwner ? HabitChipPrivate : HabitChipPublic;

    const [showAllPileHabits, setShowAllPileHabits] = useState(false);
    const initialVisibleHabits = 4;
    const habitsToDisplay = showAllPileHabits ? pileHabits : pileHabits.slice(0, initialVisibleHabits);
    const hasMoreHabits = pileHabits.length > initialVisibleHabits;

    const [isCreateHabitModalOpen, setIsCreateHabitModalOpen] = useState(false);

    // -- Handlers --

    const handleHabitUpdate = async (habitId: string, name: string, isPublic: boolean, goalValue?: number | null, goalUnit?: string | null) => {
        try {
            await updateHabit(habitId, {name, is_public: isPublic, goal_value: goalValue, goal_unit: goalUnit});
            toast.success('Habit updated');
            onActivityLogged?.();
        } catch (error) {
            console.error('Failed to update habit:', error);
            toast.error('Failed to update habit');
        }
    };

    const handleHabitDelete = async (habitId: string) => {
        try {
            await deleteHabit(habitId);
            toast.success('Habit deleted');
            // Remove locally for UI responsiveness
            setOptimisticHabits(habits.filter(h => h.id !== habitId));
            onActivityLogged?.();
        } catch (error) {
            console.error('Failed to delete habit:', error);
            toast.error('Failed to delete habit');
        }
    };

    const handleCreateHabit = () => {
        setIsCreateHabitModalOpen(false);
        toast.success('Habit created!');
        onActivityLogged?.();
    };

    const handleHabitComplete = async (habitId: string, data: CompletionData) => {
        try {
            await completeHabit(habitId, data, simulatedDate || new Date());
            toast.success('Habit completed! 🔥');
            onActivityLogged?.();
        } catch (error) {
            console.error('Failed to complete habit:', error);
            toast.error('Failed to complete habit');
        }
    };

    const handleCompletionConfirm = async (data: CompletionData) => {
        if (activeHabitForCompletion) {
            await handleHabitComplete(activeHabitForCompletion.id, data);
            completionSuccessRef.current = true;
        }
    };

    const handleCompletionClose = () => {
        setActiveHabitForCompletion(null);
        if (!completionSuccessRef.current) {
            setOptimisticHabits(null); // Revert drag if cancelled
        }
        completionSuccessRef.current = false;
    };

    const handleUnmarkModalClose = () => {
        // If simply closed without confirming, treat as cancel
        unmarkModalState.onCancel();
        setUnmarkModalState(prev => ({ ...prev, isOpen: false }));
    };

    const handleUnmarkConfirm = async () => {
        await unmarkModalState.onConfirm();
        // State cleanup happens in close or after
    };

    const noopOnHabitUpdated = () => {};
    const noopOnHabitDeleted = () => {};
    const noopOnHabitCompleted = () => {};

    const renderHabitChip = (h: Habit) => (
        <HabitChipComponent 
            habit={h}
            onHabitUpdated={!isReadOnly ? handleHabitUpdate : noopOnHabitUpdated}
            onHabitDeleted={!isReadOnly ? handleHabitDelete : noopOnHabitDeleted}
            onHabitCompleted={!isReadOnly ? handleHabitComplete : noopOnHabitCompleted}
            columnId={h.habit_state === HabitState.TODAY ? 'today' : h.habit_state === HabitState.YESTERDAY ? 'yesterday' : 'pile'}
        />
    );

    if (loading) {
        return (
            <div className="section mb-10">
                <h2 className="text-2xl font-extrabold border-b border-primary pb-4 mb-6 text-foreground">Habits</h2>
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-10 w-32"/>
                    <Skeleton className="h-10 w-40"/>
                    <Skeleton className="h-10 w-24"/>
                    <Skeleton className="h-10 w-36"/>
                    <Skeleton className="h-10 w-28"/>
                    <Skeleton className="h-10 w-48"/>
                </div>
            </div>
        );
    }

    return (
        <div className="section mb-10">
            <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
                <h2 className="text-2xl font-extrabold text-primary">Habits</h2>
                {isOwner && !isReadOnly && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-muted-foreground ring-offset-background transition-colors ring-2 ring-primary hover:bg-accent hover:text-accent-foreground dark:hover:bg-primary dark:hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    onClick={() => setIsCreateHabitModalOpen(true)}
                                    title="Add New Habit">
                                    <Plus className="h-4 w-4"/>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add New Habit</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCorners} 
                onDragStart={handleDragStart} 
                onDragEnd={handleDragEnd}
            >
            {isOwner ? (
                <>
                    {/* Mobile Layout */}
                    <div className="md:hidden flex flex-col gap-4">
                        <div className="relative overflow-hidden rounded-xl shadow">
                            <HabitColumn 
                                id="today"
                                title="Today"
                                habits={todayHabits}
                                renderHabit={renderHabitChip}
                                className="p-4 bg-background border border-primary rounded-xl z-10 relative min-h-[100px]"
                                disabled={isReadOnly}
                                emptyMessage={!activeId ? "No habits for today." : ""}
                            />
                            <div className="absolute inset-0 rounded-[inherit] z-20 pointer-events-none">
                                <MovingBorder duration={8000} rx="6" ry="6">
                                    <div className="h-1 w-8 bg-[radial-gradient(var(--primary)_60%,transparent_100%)] opacity-100 shadow-[0_0_25px_var(--primary)]"/>
                                </MovingBorder>
                            </div>
                        </div>

                        <HabitColumn 
                            id="yesterday"
                            title="Yesterday"
                            habits={yesterdayHabits}
                            renderHabit={renderHabitChip}
                            className={`p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden min-h-[100px] ${yesterdayHabits.length > 0 ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
                            disabled={isReadOnly}
                            emptyMessage={!activeId ? "No habits from yesterday." : ""}
                            headerContent={yesterdayHabits.length > 0 ? <span className="text-xs text-orange-500 font-bold animate-pulse">Complete to save streak!</span> : null}
                        />

                        <HabitColumn 
                            id="pile"
                            title="The Pile"
                            habits={habitsToDisplay}
                            renderHabit={renderHabitChip}
                            className="p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden min-h-[100px]"
                            disabled={isReadOnly}
                            emptyMessage={!activeId ? "The Pile is empty." : ""}
                            footerContent={hasMoreHabits && (
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

                    {/* Desktop Layout */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <div className="relative overflow-hidden rounded-xl shadow">
                            <HabitColumn 
                                id="today"
                                title="Today"
                                habits={todayHabits}
                                renderHabit={renderHabitChip}
                                className="p-4 bg-background border border-primary rounded-xl z-10 relative min-h-[100px]"
                                disabled={isReadOnly}
                                emptyMessage={!activeId ? "No habits for today." : ""}
                            />
                            <div className="absolute inset-0 rounded-[inherit] z-20 pointer-events-none">
                                <MovingBorder duration={8000} rx="6" ry="6">
                                    <div className="h-1 w-8 bg-[radial-gradient(var(--primary)_60%,transparent_100%)] opacity-100 shadow-[0_0_25px_var(--primary)]"/>
                                </MovingBorder>
                            </div>
                        </div>

                        <HabitColumn 
                            id="yesterday"
                            title="Yesterday"
                            habits={yesterdayHabits}
                            renderHabit={renderHabitChip}
                            className={`p-4 bg-background border border-card-border rounded-xl shadow relative overflow-hidden min-h-[100px] ${yesterdayHabits.length > 0 ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
                            disabled={isReadOnly}
                            emptyMessage={!activeId ? "No habits from yesterday." : ""}
                            headerContent={yesterdayHabits.length > 0 ? <span className="text-xs text-orange-500 font-bold animate-pulse">Complete to save streak!</span> : null}
                        />

                        <HabitColumn 
                            id="pile"
                            title="The Pile"
                            habits={pileHabits}
                            renderHabit={renderHabitChip}
                            className="p-4 bg-background border border-card-border rounded-xl shadow md:col-span-full lg:col-span-2 min-h-[100px]"
                            disabled={isReadOnly}
                            emptyMessage={!activeId ? "The Pile is empty." : ""}
                        />
                    </div>
                </>
            ) : (
                <div className="habit-grid flex flex-wrap gap-4">
                    {habits.filter(h => h.is_public).map((habit) => (<HabitChipPublic key={habit.id} habit={habit}/>))}
                </div>
            )}
            
            <DragOverlay>
                {activeHabit ? (
                    <HabitChipComponent 
                        habit={activeHabit}
                        onHabitUpdated={noopOnHabitUpdated}
                        onHabitDeleted={noopOnHabitDeleted}
                        onHabitCompleted={noopOnHabitCompleted}
                        columnId="today" 
                    />
                ) : null}
            </DragOverlay>
            </DndContext>

            {isOwner && !isReadOnly && (
                <>
                    <HabitCreatorModal
                        isOpen={isCreateHabitModalOpen}
                        onClose={() => setIsCreateHabitModalOpen(false)}
                        onHabitCreated={handleCreateHabit}
                    />
                    {activeHabitForCompletion && (
                        <HabitCompletionModal
                            isOpen={!!activeHabitForCompletion}
                            onClose={handleCompletionClose}
                            habit={activeHabitForCompletion}
                            onConfirm={handleCompletionConfirm}
                        />
                    )}
                    <UnmarkConfirmationModal
                        isOpen={unmarkModalState.isOpen}
                        onClose={handleUnmarkModalClose}
                        habit={unmarkModalState.habit}
                        onConfirm={handleUnmarkConfirm}
                    />
                </>
            )}

            {isOwner && !isReadOnly && process.env.NEXT_PUBLIC_DEV_USER === user?.username && (
                <HabitDebugPanel 
                    habits={habits} 
                    onHabitUpdated={() => onActivityLogged?.()} 
                />
            )}
        </div>
    );
};

export default HabitsSection;