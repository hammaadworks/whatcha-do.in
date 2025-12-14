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

interface UseHabitDndProps {
  habits: Habit[];
  onHabitMoved?: () => void;
}

/**
 * Custom hook to manage Drag and Drop logic for Habits.
 * Handles sensors, active state, optimistic updates, and Supabase calls.
 */
export function useHabitDnd({ habits, onHabitMoved }: UseHabitDndProps) {
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
        if (overHabit.pile_state === 'today') targetColumn = 'today';
        else if (overHabit.pile_state === 'yesterday') targetColumn = 'yesterday';
        else targetColumn = 'pile';
      }
    }

    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    // Determine source column
    let sourceColumn = 'pile';
    if (habit.pile_state === 'today') sourceColumn = 'today';
    else if (habit.pile_state === 'yesterday') sourceColumn = 'yesterday';

    if (sourceColumn === targetColumn) return;

    // Optimistic Update
    const newHabits = habits.map((h) => {
      if (h.id === habitId) {
        let newPileState = targetColumn;
        // Basic mapping, exact logic depends on enums but this matches original code
        if (targetColumn === 'pile') newPileState = 'pile';
        return { ...h, pile_state: newPileState };
      }
      return h;
    });
    setOptimisticHabits(newHabits);

    try {
      if (sourceColumn === 'today' && (targetColumn === 'yesterday' || targetColumn === 'pile')) {
        // Unmark Flow
        if (window.confirm('Are you sure you want to unmark?')) {
          await unmarkHabit(habitId, targetColumn);
          onHabitMoved?.();
        } else {
          // Revert optimistic update if cancelled
          setOptimisticHabits(null);
        }
      } else {
        // Standard Move
        await updateHabit(habitId, { pile_state: targetColumn });
        onHabitMoved?.();
      }
      toast.success(`Moved to ${targetColumn}`);
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
