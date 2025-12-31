"use client";

import { createClient } from "./client";
import { ActivityLogEntry, CompletionsData, Habit, ISODate } from "./types";
import { JournalActivityService } from "@/lib/logic/JournalActivityService";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Fetches all unprocessed habits for a specific user.
 * Intended for the "Owner View" where all habits (public and private) should be visible.
 *
 * @param userId - The UUID of the user.
 * @param todayDate
 * @returns A promise resolving to an array of Habit objects.
 */
export async function fetchUnprocessedHabits(userId: string, todayDate: ISODate): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habits")
    .select(`
      *,
      habit_identities (
        identities (
          id,
          color
        )
      )
    `)
    .eq("user_id", userId)
    .neq("processed_date", todayDate)
    .order("target_time", { ascending: true, nullsFirst: false })
    .order("streak", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching owner's habits:", error);
    throw error;
  }

  // Transform nested response to match Habit interface
  return (data || []).map((habit: any) => ({
    ...habit,
    habit_identities: undefined, // Remove the raw relation
    linked_identities: habit.habit_identities?.map((hi: any) => hi.identities) || []
  }));
}

/**
 * Fetches all habits for a specific user.
 * Intended for the "Owner View" where all habits (public and private) should be visible.
 *
 * @param userId - The UUID of the user.
 * @returns A promise resolving to an array of Habit objects.
 */
export async function fetchOwnerHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habits")
    .select(`
      *,
      habit_identities (
        identities (
          id,
          color
        )
      )
    `)
    .eq("user_id", userId)
    .order("target_time", { ascending: true, nullsFirst: false })
    .order("streak", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching owner's habits:", error);
    throw error;
  }
  
  // Transform nested response to match Habit interface
  return (data || []).map((habit: any) => {
    const linked = habit.habit_identities?.map((hi: any) => hi.identities) || [];
    // console.log(`[Habit Fetch] ${habit.name} linked:`, linked); // Debug log
    return {
      ...habit,
      habit_identities: undefined, // Remove the raw relation
      linked_identities: linked
    };
  });
}

/**
 * Creates a new habit record in the database.
 *
 * @param habit - A partial habit object containing at least the required fields (name, user_id).
 * @returns A promise resolving to an object containing the created habit data or an error.
 */
export const createHabit = async (habit: Partial<Habit>): Promise<{
  data: Habit | null; error: PostgrestError | null
}> => {
  const supabase = createClient();

  // Check for duplicates
  const { data: existingHabits } = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", habit.user_id)
    .ilike("name", habit.name as string); // Case-insensitive check

  if (existingHabits && existingHabits.length > 0) {
    throw new Error(`A habit with the name "${habit.name}" already exists.`);
  }

  console.log("[Supabase] Creating habit:", habit);
  const { data, error } = await supabase
    .from("habits")
    .insert([habit])
    .select()
    .single();

  if (data) {
    console.log("[Supabase] Habit created:", data);
  }

  return { data, error };
};


/**
 * Updates an existing habit's properties.
 *
 * @param habitId - The UUID of the habit to update.
 * @param updates - A partial Habit object containing the fields to change.
 * @returns A promise resolving to the updated Habit object.
 */
export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
  const supabase = createClient();

  // Fetch the existing habit to get user_id and current name
  const { data: existingHabit, error: fetchError } = await supabase
    .from("habits")
    .select("id, name, user_id")
    .eq("id", habitId)
    .single();

  if (fetchError || !existingHabit) {
    console.error("Error fetching existing habit for update:", fetchError);
    throw fetchError;
  }

  // Check for duplicate name if name is being updated
  if (updates.name && updates.name !== existingHabit.name) {
    const { data: duplicateHabits, error: duplicateError } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", existingHabit.user_id)
      .ilike("name", updates.name)
      .neq("id", habitId); // Exclude the current habit from the check

    if (duplicateError) {
      console.error("Error checking for duplicate habit names:", duplicateError);
      throw duplicateError;
    }

    if (duplicateHabits && duplicateHabits.length > 0) {
      throw new Error(`A habit with the name "${updates.name}" already exists.`);
    }
  }

  const { data, error } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", habitId)
    .select()
    .single();

  if (error) {
    console.error("Error updating habit:", error);
    throw error;
  }

  // If the habit name was updated, also update it in the journal activity log
  if (updates.name && updates.name !== existingHabit.name) {
    const journalActivityService = new JournalActivityService(supabase);
    await journalActivityService.updateHabitNameInJournal(existingHabit.user_id, habitId, existingHabit.name, updates.name, new Date());
  }
  return data;
}

/**
 * Deletes a habit and all its associated data (completions, etc., via foreign key cascades).
 *
 * @param habitId - The UUID of the habit to delete.
 */
export async function deleteHabit(habitId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId);

  if (error) {
    console.error("Error deleting habit:", error);
    throw error;
  }
}

/**
 * Marks a habit as completed for a specific date, updates the streak,
 * and logs the activity to the journal.
 *
 * @param habit
 * @param updates
 * @param completions_data - The completion details (mood, work value, duration, notes).
 * @param completionTime - The exact timestamp of completion (optional, defaults to now).
 * @returns A promise resolving to an object containing the new completion ID or an error.
 */
export async function markHabit(
  habit: Habit,
  updates: Partial<Habit>,
  completions_data: CompletionsData,
  completionTime?: Date
) {
  const supabase = createClient();
  const journalActivityService = new JournalActivityService(supabase);

  // 3. Update habit state
  const { error: updateError } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", habit.id);

  if (updateError) {
    console.error("Error updating habit streak:", updateError);
    throw updateError;
  }

  // 4. Log activity to Journal
  const logEntryDetails: ActivityLogEntry["details"] = {
    mood: completions_data.mood,
    work_value: completions_data.work_value,
    time_taken: completions_data.time_taken,
    time_taken_unit: completions_data.time_taken_unit,
    notes: completions_data.notes
  };

  // Use provided completionTime or fallback to now (system time)
  // This allows Time Travel logic to pass a simulated "now"
  const timestamp = completionTime ? completionTime.toISOString() : new Date().toISOString();

  // We log using the reference date provided (which preserves time) but ensured it's consistent with "Today"
  if (updates.completed_date) {
    await journalActivityService.logActivity(habit.user_id, updates.completed_date, {
      id: habit.id,
      type: "habit",
      description: habit.name,
      timestamp: timestamp,
      is_public: habit.is_public,
      status: "completed",
      details: logEntryDetails
    });
  }
}

export async function unmarkHabit(habit: Habit, updates: Partial<Habit>): Promise<void> {
  const supabase = createClient();
  const journalActivityService = new JournalActivityService(supabase);

  // 3. Update habit state
  const { error: updateError } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", habit.id);

  if (updateError) {
    console.error("Error updating habit streak:", updateError);
    throw updateError;
  }

  // 4. Delete activity record
  // Use the original completion date for removal if it exists
  if (habit.completed_date) {
    await journalActivityService.removeActivity(habit.user_id, habit.completed_date, habit.id, "habit", habit.is_public);
  }
}