import {useState} from 'react';
import {DragEndEvent, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors,} from '@dnd-kit/core';
import {Habit} from '@/lib/supabase/types';
import {unmarkHabit, updateHabit} from '@/lib/supabase/habit';
import {toast} from 'sonner';
import {HabitBoxType, HabitState} from '@/lib/enums';
import {useSystemTime} from "@/components/providers/SystemTimeProvider.tsx";

interface UseHabitDndProps {
    habits: Habit[];
    onHabitMoved?: () => void;
    onCompleteHabit?: (habitId: string) => void;
    onUnmarkConfirmation?: (habit: Habit, onConfirm: () => Promise<void>, onCancel: () => void) => void;
}

/**
 * Custom hook to manage Drag and Drop logic for Habits.
 * Handles sensors, active state, optimistic updates, and Supabase calls.
 */
export function useHabitDnd({habits, onHabitMoved, onCompleteHabit, onUnmarkConfirmation}: UseHabitDndProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
    const [optimisticHabits, setOptimisticHabits] = useState<Habit[] | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 4}}), useSensor(TouchSensor));

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        const habit = habits.find((h) => h.id === event.active.id);
        setActiveHabit(habit || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const {active, over} = event;
        setActiveId(null);
        setActiveHabit(null);

        if (!over) return;

        const habitId = active.id as string;
        const overId = over.id as string;

        // 1. Determine Target Box (Destination)
        let targetBox: HabitBoxType | null = null;

        if (Object.values(HabitBoxType).includes(overId as HabitBoxType)) {
            targetBox = overId as HabitBoxType;
        } else {
            // Dropped over another habit, find that habit's box
            const overHabit = habits.find((h) => h.id === overId);
            if (overHabit) {
                if (overHabit.habit_state === HabitState.TODAY) targetBox = HabitBoxType.TODAY; else if (overHabit.habit_state === HabitState.YESTERDAY) targetBox = HabitBoxType.YESTERDAY; else targetBox = HabitBoxType.PILE;
            }
        }

        if (!targetBox) return;

        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return;

        // 2. Determine Source Box
        let sourceBox: HabitBoxType = HabitBoxType.PILE;
        if (habit.habit_state === HabitState.TODAY) sourceBox = HabitBoxType.TODAY; else if (habit.habit_state === HabitState.YESTERDAY) sourceBox = HabitBoxType.YESTERDAY;

        if (sourceBox === targetBox) return;

        // 3. Invalid Moves
        if (sourceBox === HabitBoxType.PILE && targetBox === HabitBoxType.YESTERDAY) {
            toast.error("Invalid move: Cannot move from Pile to Yesterday.");
            return;
        }

        // 4. Map Target Box to Habit State
        let newHabitState: HabitState = HabitState.LIVELY;
        if (targetBox === HabitBoxType.TODAY) newHabitState = HabitState.TODAY; else if (targetBox === HabitBoxType.YESTERDAY) newHabitState = HabitState.YESTERDAY; else newHabitState = HabitState.LIVELY; // Default for Pile

        // 5. Optimistic Update
        const newHabits = habits.map((h) => {
            if (h.id === habitId) {
                return {...h, habit_state: newHabitState};
            }
            return h;
        });
        setOptimisticHabits(newHabits);

        // 6. Special Case: Completion (Today)
        if (targetBox === HabitBoxType.TODAY && sourceBox !== HabitBoxType.TODAY && onCompleteHabit) {
            onCompleteHabit(habitId);
            // We return here and rely on the callback to handle the DB update (e.g., opening a modal).
            // If the modal is cancelled, the parent component must revert the optimistic update.
            return;
        }

        try {
            if (sourceBox === HabitBoxType.TODAY && (targetBox === HabitBoxType.YESTERDAY || targetBox === HabitBoxType.PILE)) {
                const performUnmark = async () => {
                    await unmarkHabit(habitId);
                    onHabitMoved?.();
                };

                const cancelUnmark = () => {
                    setOptimisticHabits(null);
                };

                if (onUnmarkConfirmation) {
                    onUnmarkConfirmation(habit, performUnmark, cancelUnmark);
                } else if (typeof window !== 'undefined' && window.confirm('Are you sure you want to unmark?')) {
                    // Fallback
                    await performUnmark();
                } else {
                    cancelUnmark();
                }
            } else {
                // Standard Move
                await updateHabit(habitId, {habit_state: newHabitState});
                onHabitMoved?.();
            }
            // Toast handled by caller or specific logic
        } catch (error) {
            console.error('Move failed', error);
            toast.error('Failed to move habit');
            setOptimisticHabits(null); // Revert on error
        }
    };

    return {
        sensors, activeId, activeHabit, optimisticHabits, handleDragStart, handleDragEnd, setOptimisticHabits
    };
}
