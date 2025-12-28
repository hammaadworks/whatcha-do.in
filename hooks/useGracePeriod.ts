import { useEffect, useState } from "react";
import { Habit, ISODate } from "@/lib/supabase/types";
import { processHabitLifecycle } from "@/lib/logic/habits/habitProcessor.ts";
import { updateHabit } from "@/lib/supabase/habit";
import { calculateHabitUpdates } from "@/lib/logic/habits/habitLifecycle.ts";
import { HabitLifecycleEvent } from "@/lib/enums";

/**
 * Hook to manage the Grace Period logic.
 * Runs the lifecycle processor on mount (or time change) and returns habits requiring grace.
 */
export function useGracePeriod(userId: string | undefined, todayISO: ISODate) {

  const [graceHabits, setGraceHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setGraceHabits([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const runLifecycle = async () => {
      setIsLoading(true);
      try {
        const { graceHabits: needed } = await processHabitLifecycle(userId, todayISO);
        if (isMounted) {
          setGraceHabits(needed);
        }
      } catch (error) {
        console.error("Grace period check failed:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    runLifecycle();

    return () => {
      isMounted = false;
    };
    // Depend on refDateKey (string) instead of refDate (object)
  }, [userId, todayISO]);

  // Function to manually refresh (e.g., after resolving a grace habit)
  const refresh = async (graceHabits: Habit[], habitId: string) => {
    if (!userId) return;
    setIsLoading(true);
    setGraceHabits(graceHabits.filter(item => item.id !== habitId));
    setIsLoading(false);
  };

  /**
   * Resolves a habit as "Incomplete" (Skipped) during Grace Period.
   * Triggers transitions like Lively -> Junked or Yesterday -> Lively (Pile).
   */
  const resolveHabitIncomplete = async (habit: Habit) => {
    if (!userId) return;
    try {
      const updates = calculateHabitUpdates(habit, HabitLifecycleEvent.GRACE_INCOMPLETE, todayISO);
      await updateHabit(habit.id, updates);
      await refresh(graceHabits, habit.id); // Refresh list to remove resolved habit
    } catch (error) {
      console.error(`Failed to resolve habit ${habit.id} as incomplete:`, error);
      throw error; // Let UI handle error
    }
  };

  return { graceHabits, isLoading, refresh, resolveHabitIncomplete };
}