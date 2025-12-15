import {createClient} from './client';
import {ActivityLogEntry, Habit} from './types';
import {CompletionsData} from '@/components/habits/HabitCompletionsModal.tsx';
import {JournalActivityService} from '@/lib/logic/JournalActivityService';
import {PostgrestError} from '@supabase/supabase-js';
import {HabitState} from '@/lib/enums';

/**
 * Fetches all habits for a specific user.
 * Intended for the "Owner View" where all habits (public and private) should be visible.
 *
 * @param userId - The UUID of the user.
 * @returns A promise resolving to an array of Habit objects.
 */
export async function fetchOwnerHabits(userId: string): Promise<Habit[]> {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching owner's habits:", error);
        throw error;
    }
    return data || [];
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
    const {data: existingHabits} = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', habit.user_id)
        .ilike('name', habit.name as string); // Case-insensitive check

    if (existingHabits && existingHabits.length > 0) {
        throw new Error(`A habit with the name "${habit.name}" already exists.`);
    }

    const {data, error} = await supabase
        .from('habits')
        .insert([habit])
        .select()
        .single();
    return {data, error};
};

/**
 * Marks a habit as completed for a specific date, updates the streak,
 * and logs the activity to the journal.
 *
 * @param habitId - The UUID of the habit to complete.
 * @param completions_data - The completion details (mood, work value, duration, notes).
 * @param date - The date of completion (defaults to the current system time).
 * @returns A promise resolving to an object containing the new completion ID or an error.
 */
export async function completeHabit(habitId: string, completions_data: CompletionsData, date: Date): Promise<{
    data: { id: string } | null; error: PostgrestError | null
}> {
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);

    // 1. Fetch current habit state
    const {data: habit, error: fetchError} = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single() as { data: Habit | null, error: Error | null };

    if (fetchError || !habit) {
        console.error("Error fetching habit for completion:", fetchError);
        throw fetchError;
    }

    if (habit.last_completed_date == date) {
        throw new Error("Action failed: The habit status is already complete.");
    }

    // 2. Calculate new streak, last_non_today_streak and longest streak
    habit.last_non_today_streak = habit.streak;
    habit.streak = habit.streak + 1;
    if (habit.habit_state === HabitState.JUNKED) {
        habit.streak = 1;
    }
    habit.longest_streak = Math.max(habit.longest_streak, habit.streak);
    habit.last_non_today_state = habit.habit_state;
    habit.habit_state = HabitState.TODAY;
    habit.last_completed_date = date;
    habit.junked_at = null;

    // 3. Update habit state
    const {error: updateError} = await supabase
        .from('habits')
        .update({
            last_non_today_streak: habit.last_non_today_streak,
            streak: habit.streak,
            longest_streak: habit.longest_streak,
            last_non_today_state: habit.last_non_today_state,
            habit_state: HabitState.TODAY,
            last_completed_date: habit.last_completed_date,
            junked_at: habit.junked_at,
        })
        .eq('id', habitId);

    if (updateError) {
        console.error("Error updating habit streak:", updateError);
        throw updateError;
    }

    // 4. Log activity to Journal
    const logEntryDetails: ActivityLogEntry['details'] = {
        mood: completions_data.mood,
        work_value: completions_data.work_value,
        time_taken: completions_data.time_taken,
        time_taken_unit: completions_data.time_taken_unit,
        notes: completions_data.notes,
    };
    await journalActivityService.logActivity(habit.user_id, date, {
        id: habit.id,
        type: 'habit',
        description: habit.name,
        is_public: habit.is_public,
        status: 'completed',
        details: logEntryDetails,
    });

    return {data: null, error: null};
}


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
    const {data: existingHabit, error: fetchError} = await supabase
        .from('habits')
        .select('id, name, user_id')
        .eq('id', habitId)
        .single();

    if (fetchError || !existingHabit) {
        console.error("Error fetching existing habit for update:", fetchError);
        throw fetchError;
    }

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== existingHabit.name) {
        const {data: duplicateHabits, error: duplicateError} = await supabase
            .from('habits')
            .select('id')
            .eq('user_id', existingHabit.user_id)
            .ilike('name', updates.name)
            .neq('id', habitId); // Exclude the current habit from the check

        if (duplicateError) {
            console.error("Error checking for duplicate habit names:", duplicateError);
            throw duplicateError;
        }

        if (duplicateHabits && duplicateHabits.length > 0) {
            throw new Error(`A habit with the name "${updates.name}" already exists.`);
        }
    }

    const {data, error} = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId)
        .select()
        .single();

    if (error) {
        console.error("Error updating habit:", error);
        throw error;
    }

    // If the habit name was updated, also update it in the journal activity log
    if (updates.name && updates.name !== existingHabit.name) {
        const journalActivityService = new JournalActivityService(supabase);
        await journalActivityService.updateHabitNameInJournal(existingHabit.user_id, habitId, existingHabit.name, updates.name);
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
    const {error} = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

    if (error) {
        console.error("Error deleting habit:", error);
        throw error;
    }
}

export async function unmarkHabit(habitId: string): Promise<void> {
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);

    // 1. Fetch habit
    const {data: habit, error: habitError} = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single() as { data: Habit | null, error: Error | null };

    if (habitError || !habit) throw habitError;
    if (habit.habit_state != HabitState.TODAY) throw new Error("Action not allowed. You can only unmark habits in your 'Today' list.");

    const completionDate = habit.last_completed_date ? new Date(habit.last_completed_date) : new Date();

    // 2. Update streak and state
    habit.streak = habit.last_non_today_streak;
    habit.longest_streak = Math.max(habit.streak, habit.longest_streak)
    habit.habit_state = habit.last_non_today_state;
    habit.last_completed_date = null;

    // 3. Update habit state
    const {error: updateError} = await supabase
        .from('habits')
        .update({
            streak: habit.streak,
            longest_streak: habit.longest_streak,
            habit_state: habit.habit_state,
            last_completed_date: habit.last_completed_date,
        })
        .eq('id', habitId);

    if (updateError) {
        throw updateError;
    }
    // 4. Delete activity record
    await journalActivityService.removeActivity(habit.user_id, completionDate, habit.id, 'habit', habit.is_public);
}
