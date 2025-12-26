"use client";

import { Habit, ISODate } from "@/lib/supabase/types.ts";
import { HabitLifecycleEvent, HabitState } from "@/lib/enums.ts";
import { addDays, parseISO } from "@/lib/date.ts";


/**
 * Calculates the updates for a habit based on a lifecycle event.
 * STRICTLY follows the Truth Table and Invariants from docs/wiki/habit-lifecycle.md.
 *
 * @param habit The current state of the habit.
 * @param event The lifecycle event triggering the transition.
 * @param todayDate The current date (YYYY-MM-DD) in the user's timezone.
 * @returns Partial<Habit> containing the fields to update.
 * @throws Error if the transition is forbidden.
 */
export function calculateHabitUpdates(habit: Habit, event: HabitLifecycleEvent, todayDate: ISODate): Partial<Habit> {
  switch (event) {
    case HabitLifecycleEvent.USER_COMPLETE:
      return handleUserComplete(habit, todayDate);
    case HabitLifecycleEvent.USER_UNDO:
      // read undo
      return handleUserUndo(habit, todayDate);
    case HabitLifecycleEvent.GRACE_COMPLETE:
      return handleGraceComplete(habit, todayDate);
    case HabitLifecycleEvent.GRACE_INCOMPLETE:
      return handleGraceIncomplete(habit, todayDate);
    default:
      throw new Error(`Unhandled event: ${event}`);
  }
}

/**
 * Handles the USER_COMPLETE event.
 * Valid from: LIVELY, YESTERDAY, JUNKED.
 */
function handleUserComplete(habit: Habit, todayDate: ISODate): Partial<Habit> {
  if (habit.habit_state === HabitState.TODAY) {
    throw new Error("Habit already completed today.");
  }

  const newHabitStreak = habit.habit_state === HabitState.JUNKED ? 1 : habit.streak + 1;

  const update: Partial<Habit> = {
    streak: newHabitStreak,
    longest_streak: Math.max(habit.longest_streak, newHabitStreak),
    habit_state: HabitState.TODAY,
    junked_date: null,
    completed_date: parseISO(todayDate),
    processed_date: todayDate
  };
  console.log("[HabitLifecycle] User Complete Update:", update);
  return update;
}

/**
 * Handles the USER_UNDO event.
 * Reverts to previous state.
 */
function handleUserUndo(habit: Habit, todayDate: ISODate): Partial<Habit> {
  if (habit.habit_state !== HabitState.TODAY) {
    throw new Error("Cannot undo a habit that is not in 'Today' state.");
  }

  const undoUpdate: Partial<Habit> = {
    streak: habit.undo_streak,
    longest_streak: habit.undo_longest_streak,
    habit_state: habit.undo_habit_state,
    junked_date: habit.undo_junked_date,
    completed_date: habit.undo_completed_date,
    processed_date: todayDate
  };
  console.log("[HabitLifecycle] Undo Update:", undoUpdate);
  return undoUpdate;
}

/**
 * Handles the GRACE_COMPLETE event.
 * Marks as done for yesterday, sets state to YESTERDAY.
 */
function handleGraceComplete(habit: Habit, todayDate: ISODate): Partial<Habit> {
  const yesterdayDate = addDays(todayDate, -1);

  // Streak Logic: If reviving from JUNKED, streak resets to 1.
  const newHabitStreak = habit.habit_state === HabitState.JUNKED ? 1 : habit.streak + 1;
  const newLongestStreak = Math.max(habit.longest_streak, newHabitStreak);
  const update: Partial<Habit> = {
    streak: newHabitStreak,
    undo_streak: newHabitStreak,
    longest_streak: newLongestStreak,
    undo_longest_streak: newLongestStreak,
    habit_state: HabitState.YESTERDAY,
    undo_habit_state: HabitState.YESTERDAY,
    junked_date: null,
    undo_junked_date: null,
    completed_date: parseISO(yesterdayDate),
    undo_completed_date: parseISO(yesterdayDate),
    processed_date: todayDate
  };
  console.log("[HabitLifecycle] Grace Complete Update:", update);
  return update;
}


/**
 * Handles the GRACE_INCOMPLETE event.
 * User admits to missing the habit.
 */
function handleGraceIncomplete(habit: Habit, todayDate: ISODate): Partial<Habit> {
  const yesterdayDate = addDays(todayDate, -1);

  // Streak Logic: goes down the status
  let newHabitState = HabitState.JUNKED;
  let newHabitStreak = habit.streak;
  let newJunkedDate = habit.junked_date;
  let newUndoJunkedDate = habit.undo_junked_date;
  if (habit.habit_state === HabitState.TODAY) {
    newHabitState = HabitState.YESTERDAY;
  } else if (habit.habit_state === HabitState.YESTERDAY) {
    newHabitState = HabitState.LIVELY;
  } else if (habit.habit_state === HabitState.LIVELY) {
    newHabitStreak = -1;
    newJunkedDate = yesterdayDate;
    newUndoJunkedDate = yesterdayDate;
  } else {
    newHabitStreak = habit.streak - 1;
  }

  const update: Partial<Habit> = {
    streak: newHabitStreak,
    undo_streak: habit.streak,
    undo_longest_streak: habit.longest_streak,
    habit_state: newHabitState,
    undo_habit_state: habit.habit_state,
    undo_completed_date: habit.completed_date,
    junked_date: newJunkedDate,
    undo_junked_date: newUndoJunkedDate,
    processed_date: todayDate
  };
  console.log("[HabitLifecycle] Grace Complete Update:", update);
  return update;
}
