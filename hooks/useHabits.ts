import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { updateHabit as updateHabitService, deleteHabit as deleteHabitService, updateStreak as updateStreakService } from '@/lib/supabase/habit'; // Import update, delete, and streak services
import toast from 'react-hot-toast'; // Import toast

interface Habit {
  id: string;
  name: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  pile_state: string; // Add pile_state to Habit interface
  current_streak: number; // Add current_streak
  last_streak: number; // Add last_streak
  last_completed_at: string | null; // Add last_completed_at
  goal_value?: number | null; // Add goal_value
  goal_unit?: string | null; // Add goal_unit
}

const useHabits = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error } = await supabaseClient
      .from('habits')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching habits:', error);
      setError(error.message);
      setHabits([]);
    } else {
      setHabits(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const updateHabit = useCallback(async (
    habitId: string,
    name: string,
    isPublic: boolean,
    goalValue?: number | null,
    goalUnit?: string | null
  ) => {
    if (!user) {
      toast.error('You must be logged in to update a habit.');
      return;
    }

    const originalHabits = [...habits]; // Save current state for rollback

    // Optimistic UI update
    setHabits(currentHabits =>
      currentHabits.map(habit =>
        habit.id === habitId ? { ...habit, name, is_public: isPublic, goal_value: goalValue, goal_unit: goalUnit } : habit
      )
    );

    try {
      const updatedData = await updateHabitService(habitId, { name, is_public: isPublic, goal_value: goalValue, goal_unit: goalUnit });
      if (!updatedData) {
        throw new Error('Habit update failed.');
      }
      toast.success('Habit updated successfully!');
    } catch (err: any) {
      toast.error(`Failed to update habit: ${err.message}`);
      setHabits(originalHabits); // Rollback on error
      console.error('Error updating habit:', err);
    }
  }, [user, habits]);

  const deleteHabit = useCallback(async (habitId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete a habit.');
      return;
    }

    const originalHabits = [...habits]; // Save current state for rollback

    // Optimistic UI update
    setHabits(currentHabits => currentHabits.filter(habit => habit.id !== habitId));
    toast.loading('Deleting habit...', { id: habitId });

    try {
      await deleteHabitService(habitId);
      toast.success('Habit deleted successfully!', { id: habitId });
    } catch (err: any) {
      toast.error(`Failed to delete habit: ${err.message}`, { id: habitId });
      setHabits(originalHabits); // Rollback on error
      console.error('Error deleting habit:', err);
    }
  }, [user, habits]);

  const completeHabit = useCallback(async (habitId: string) => {
    if (!user) {
      toast.error('You must be logged in to complete a habit.');
      return;
    }

    const originalHabits = [...habits]; // Save current state for rollback
    const habitToComplete = habits.find(habit => habit.id === habitId);

    if (!habitToComplete) {
      toast.error('Habit not found.');
      return;
    }

    let newCurrentStreak = habitToComplete.current_streak;
    let newLastStreak = habitToComplete.last_streak;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const lastCompletedDate = habitToComplete.last_completed_at ? new Date(habitToComplete.last_completed_at) : null;
    if (lastCompletedDate) {
      lastCompletedDate.setHours(0, 0, 0, 0); // Normalize to start of day
    }

    // Calculate yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (lastCompletedDate && lastCompletedDate.getTime() === today.getTime()) {
      // Already completed today, do nothing or show a message
      toast('Habit already completed today!', { icon: '👍' });
      return;
    } else if (lastCompletedDate && lastCompletedDate.getTime() === yesterday.getTime()) {
      // Completed yesterday, continue streak
      newCurrentStreak += 1;
    } else if (lastCompletedDate && lastCompletedDate.getTime() < yesterday.getTime()) {
      // Missed a day, reset streak and save last streak
      newLastStreak = habitToComplete.current_streak;
      newCurrentStreak = 1;
    } else {
      // First completion or no previous completion
      newCurrentStreak = 1;
    }

    // Optimistic UI update
    setHabits(currentHabits =>
      currentHabits.map(habit =>
        habit.id === habitId
          ? {
              ...habit,
              current_streak: newCurrentStreak,
              last_streak: newLastStreak,
              last_completed_at: new Date().toISOString(), // Update last completed time
            }
          : habit
      )
    );
    toast.loading('Completing habit...', { id: habitId });

    try {
      await updateStreakService(habitId, {
        current_streak: newCurrentStreak,
        last_streak: newLastStreak,
      });
      // Also update last_completed_at in the database
      await updateHabitService(habitId, { last_completed_at: new Date().toISOString() }); // Assuming updateHabitService can take last_completed_at
      toast.success('Habit completed successfully!', { id: habitId });
    } catch (err: any) {
      toast.error(`Failed to complete habit: ${err.message}`, { id: habitId });
      setHabits(originalHabits); // Rollback on error
      console.error('Error completing habit:', err);
    }
  }, [user, habits]);

  return { habits, loading, error, updateHabit, deleteHabit, completeHabit };
};

export default useHabits;
