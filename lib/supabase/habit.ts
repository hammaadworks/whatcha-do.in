import {createClient} from './client';
import {ActivityLogEntry, Habit} from './types';
import {CompletionsData} from '@/components/habits/HabitCompletionsModal.tsx';
import {JournalActivityService} from '@/lib/logic/JournalActivityService';
import {PostgrestError} from '@supabase/supabase-js';
import {HabitState} from '@/lib/enums';

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
        .single();

    if (fetchError || !habit) {
        console.error("Error fetching habit for completion:", fetchError);
        throw fetchError;
    }

    // 2. Calculate new streak and longest streak
    habit.streak = habit.streak + 1;
    if (habit.habit_state === HabitState.JUNKED) {
        habit.streak = 1;
    }
    habit.longest_streak = Math.max(habit.longest_streak, habit.streak);


    // 3. Log activity to Journal
    const logEntryDetails: ActivityLogEntry['details'] = {
        mood: completions_data.mood,
        work_value: completions_data.work_value,
        time_taken: completions_data.time_taken,
        time_taken_unit: completions_data.time_taken_unit,
        notes: completions_data.notes,
    };

    // 4. Update habit state
    const {error: updateError} = await supabase
        .from('habits')
        .update({
            streak: habit.streak,
            longest_streak: habit.longest_streak,
            habit_state: HabitState.TODAY,
            last_non_today_state: habit.habit_state,
            last_completed_date: date,
        })
        .eq('id', habitId);

    if (updateError) {
        console.error("Error updating habit streak:", updateError);
        throw updateError;
    }

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
 * Deletes a specific habit completion record and removes its corresponding journal entry.
 *
 * @param completionId - The UUID of the completion record to delete.
 * @param userId - The UUID of the user who owns the completion.
 * @throws Will throw an error if the completion or habit cannot be found or deletion fails.
 */
export async function deleteHabitCompletion(completionId: string, userId: string): Promise<void> {
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);

    // 1. Get details before deletion to pass to removeActivity
    const {data: completion, error: fetchError} = await supabase
        .from('habit_completions')
        .select('habit_id, completed_at')
        .eq('id', completionId)
        .single();

    if (fetchError || !completion) {
        console.error('Error fetching habit completion for deletion:', fetchError);
        throw fetchError;
    }

    // 2. Determine public status by fetching the habit itself
    const {data: habit, error: habitError} = await supabase
        .from('habits')
        .select('is_public')
        .eq('id', completion.habit_id)
        .single();

    if (habitError || !habit) {
        console.error('Error fetching habit for deletion:', habitError);
        throw habitError;
    }

    // 3. Delete from database
    const {error} = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', completionId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting habit completion:', error);
        throw error;
    }

    // 4. Remove from Journal
    const completionDate = new Date(completion.completed_at);
    await journalActivityService.removeActivity(userId, completionDate, completionId, 'habit', habit.is_public);
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

/**
 * Moves a habit to a new pile state (e.g., when dragging from 'Today' back to 'Pile').
 * If the habit was completed "Today", it effectively "uncompletes" it by removing the latest completion
 * and decrementing the streak.
 *
 * Note: This function assumes that `referenceDate` is in the same timezone context as the user's browser,
 * as it uses `toDateString()` for "Same Day" comparison against the stored UTC completion time converted to local.
 *
 * @param habitId - The UUID of the habit.
 * @param targetState - The new pile state (e.g., 'yesterday', 'pile').
 * @param referenceDate - The date to check "Today" against (defaults to new Date()).
 */
export async function unmarkHabit(habitId: string, targetState: string, referenceDate: Date = new Date()): Promise<void> {
    const supabase = createClient();

    // 1. Fetch habit
    const {data: habit, error: habitError} = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single();

    if (habitError || !habit) throw habitError;

    // 2. Find latest completion
    const {data: latestCompletion} = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .order('completed_at', {ascending: false})
        .limit(1)
        .single();

    let newStreak = habit.current_streak;

    // If we have a completion and it looks recent (e.g. created today), we delete it.
    if (latestCompletion) {
        const completionDate = new Date(latestCompletion.completed_at);
        // Compare "Local Calendar Date"
        const isSameDay = completionDate.toDateString() === referenceDate.toDateString();

        if (isSameDay) {
            await deleteHabitCompletion(latestCompletion.id, habit.user_id);
            newStreak = Math.max(0, newStreak - 1);
        }
    }

    // 3. Update habit state
    const {error: updateError} = await supabase
        .from('habits')
        .update({
            current_streak: newStreak, habit_state: targetState
        })
        .eq('id', habitId);

    if (updateError) {
        throw updateError;
    }
}

/**
 * Backdates a completion for a habit.
 * This is primarily a **Developer Tool** or used for "Yesterday" corrections.
 *
 * @param habitId - The UUID of the habit.
 * @param completedAt - The specific Date object to record the completion at.
 */
export async function backdateHabitCompletion(habitId: string, completedAt: Date): Promise<void> {
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);

    // 1. Fetch current habit state to get user_id and name
    const {data: habit, error: fetchError} = await supabase
        .from('habits')
        .select('id, user_id, name, is_public, goal_value')
        .eq('id', habitId)
        .single();

    if (fetchError || !habit) {
        console.error("Error fetching habit for backdated completion:", fetchError);
        throw fetchError;
    }

    // 2. Insert completion record with the backdated time
    const {data: newCompletion, error: insertError} = await supabase
        .from('habit_completions')
        .insert({
            habit_id: habitId,
            user_id: habit.user_id,
            completed_at: completedAt.toISOString(),
            goal_at_completion: habit.goal_value,
        })
        .select('id')
        .single();

    if (insertError) {
        console.error("Error inserting backdated completion:", insertError);
        throw insertError;
    }

    // 3. Log activity for the backdated completion
    if (newCompletion?.id) {
        await journalActivityService.logActivity(habit.user_id, completedAt, {
            id: newCompletion.id,
            type: 'habit',
            description: habit.name,
            is_public: habit.is_public,
            status: 'completed',
            details: {}, // No specific details for basic backdated completion
        });
    }
}
