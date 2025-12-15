import { useState } from 'react';
import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Habit } from '@/lib/supabase/types';
import { updateHabit, unmarkHabit } from '@/lib/supabase/habit';
import { toast } from 'sonner';
import { HabitState } from '@/lib/enums';

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
export function useHabitDnd({ habits, onHabitMoved, onCompleteHabit, onUnmarkConfirmation }: UseHabitDndProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);
  const [optimisticHabits, setOptimisticHabits] = useState<Habit[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const habit = habits.find((h) => h.id === event.active.id);
    setActiveHabit(habit || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveHabit(null);

    if (!over) return;

    const habitId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    let targetColumn = overId;
    // If dropped over a habit, find that habit's column
    if (!['today', 'yesterday', 'pile'].includes(overId)) {
      const overHabit = habits.find((h) => h.id === overId);
      if (overHabit) {
        // Map pile states to column IDs
        if (overHabit.habit_state === HabitState.TODAY) targetColumn = 'today';
        else if (overHabit.habit_state === HabitState.YESTERDAY) targetColumn = 'yesterday';
        else targetColumn = 'pile';
      }
    }

    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    // Determine source column
    let sourceColumn = 'pile';
    if (habit.habit_state === HabitState.TODAY) sourceColumn = 'today';
    else if (habit.habit_state === HabitState.YESTERDAY) sourceColumn = 'yesterday';

    if (sourceColumn === targetColumn) return;

    // Invalid Move Check: Pile -> Yesterday (Forbidden)
    if (sourceColumn === 'pile' && targetColumn === 'yesterday') {
      toast.error("Invalid move: Cannot move from Pile to Yesterday.");
      return;
    }

    // Optimistic Update
    const newHabits = habits.map((h) => {
      if (h.id === habitId) {
        let newPileState = targetColumn;
        // Basic mapping, exact logic depends on enums but this matches original code
        if (targetColumn === 'pile') newPileState = HabitState.PILE_LIVELY;
        return { ...h, habit_state: newPileState };
      }
      return h;
    });
    setOptimisticHabits(newHabits);

    // Special case: Drop to Today (triggers completion flow if handler provided)
    if (targetColumn === 'today' && sourceColumn !== 'today' && onCompleteHabit) {
      onCompleteHabit(habitId);
      // We return here and rely on the callback to handle the DB update (e.g., opening a modal).
      // If the modal is cancelled, the parent component must revert the optimistic update.
      return;
    }

    try {
      if (sourceColumn === 'today' && (targetColumn === 'yesterday' || targetColumn === 'pile')) {
        const performUnmark = async () => {
             await unmarkHabit(habitId, targetColumn === 'pile' ? HabitState.PILE_LIVELY : targetColumn);
             onHabitMoved?.();
        };

        const cancelUnmark = () => {
             setOptimisticHabits(null);
        };

        if (onUnmarkConfirmation) {
            onUnmarkConfirmation(habit, performUnmark, cancelUnmark);
        } else if (window.confirm('Are you sure you want to unmark?')) {
            // Fallback
             await performUnmark();
        } else {
             cancelUnmark();
        }
      } else {
        // Standard Move
        await updateHabit(habitId, { habit_state: targetColumn === 'pile' ? HabitState.PILE_LIVELY : targetColumn });
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
    sensors,
    activeId,
    activeHabit,
    optimisticHabits,
    handleDragStart,
    handleDragEnd,
    setOptimisticHabits
  };
}
