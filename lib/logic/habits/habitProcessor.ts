"use client";

import { Habit, ISODate } from "@/lib/supabase/types.ts";
import { diffInDays } from "@/lib/date.ts";
import { fetchUnprocessedHabits, updateHabit } from "@/lib/supabase/habit.ts";
import { HabitLifecycleEvent, HabitState } from "@/lib/enums.ts";
import { calculateHabitUpdates } from "@/lib/logic/habits/habitLifecycle.ts";

/**
 * Result of the lifecycle processing.
 */
export interface LifecycleResult {
  graceHabits: Habit[];
  processedCount: number;
}

/**
 * Processes the lifecycle for all habits of a user.
 * - Auto-resolves habits that don't need user input (e.g. Day Rollover, AutoJunk).
 * - Identifies habits eligible for Grace Period.
 *
 * @param userId The user's ID.
 * @param todayISO
 */
export async function processHabitLifecycle(userId: string, todayISO: ISODate): Promise<LifecycleResult> {
  const habits = await fetchUnprocessedHabits(userId, todayISO);

  const graceHabits: Habit[] = [];
  let processedCount = 0;

  for (const h of habits) {
    let habit = h;
    let gap = diffInDays(habit.processed_date, todayISO);

    if (gap < 1) {
      const update: Partial<Habit> = {
        processed_date: todayISO
      };
      await updateHabit(habit.id, update);
    }

    if (gap > 1) {
      let updates: Partial<Habit> = {};
      while (gap > 1) {
        updates = calculateHabitUpdates(habit, HabitLifecycleEvent.GRACE_INCOMPLETE, todayISO);
        habit = { ...habit, ...updates };
        gap -= 1;
      }
      await updateHabit(habit.id, updates);
    }

    if (habit.habit_state == HabitState.TODAY) {
      const rolloverChanges: Partial<Habit> = calculateHabitUpdates(habit, HabitLifecycleEvent.GRACE_INCOMPLETE, todayISO);
      await updateHabit(habit.id, rolloverChanges);
    } else {
      graceHabits.push(habit);
    }

    processedCount += 1;
  }

  return { graceHabits, processedCount };
}

