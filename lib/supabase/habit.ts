'use client';

import {createClient} from './client';
import {ActivityLogEntry, CompletionsData, Habit, ISODate} from './types';
import {JournalActivityService} from '@/lib/logic/JournalActivityService';
import {PostgrestError} from '@supabase/supabase-js';
import {HabitLifecycleEvent} from '@/lib/enums';
import {calculateHabitUpdates} from '@/lib/logic/habits/habitLifecycle.ts';
import {getTodayISO} from '@/lib/date';

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
    const {data, error} = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .neq('processed_date', todayDate);

    if (error) {
        console.error("Error fetching owner's habits:", error);
        throw error;
    }
    return data || [];
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

    console.log('[Supabase] Creating habit:', habit);
    const {data, error} = await supabase
        .from('habits')
        .insert([habit])
        .select()
        .single();

    if (data) {
        console.log('[Supabase] Habit created:', data);
    }

    return {data, error};
};

/**
 * Marks a habit as completed for a specific date, updates the streak,
 * and logs the activity to the journal.
 *
 * @param habitId - The UUID of the habit to complete.
 * @param completions_data - The completion details (mood, work value, duration, notes).
 * @param date - The date of completion (should be the reference date in simulated time).
 * @returns A promise resolving to an object containing the new completion ID or an error.
 */
export async function completeHabit(habitId: string, completions_data: CompletionsData, date: Date): Promise<{
    data: { id: string } | null; error: PostgrestError | null
}> {
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);

    // 1. Fetch current habit state and User (for timezone)
    // We need user's timezone to correctly calculate "Today" ISODate
    const {data: habit, error: fetchError} = await supabase
        .from('habits')
        .select('*, users!inner(timezone)')
        .eq('id', habitId)
        .single();

    if (fetchError || !habit) {
        console.error("Error fetching habit for completion:", fetchError);
        throw fetchError;
    }

    // Cast the joined result to a type that includes the user data
    type HabitWithUser = Habit & { users: { timezone: string } };
    const habitData = habit as unknown as HabitWithUser; // Using assertion here as Supabase generic types can be complex to map perfectly without generated types

    const timezone = habitData.users?.timezone || 'UTC';

    // Resolve "Today" ISO based on user's timezone and the provided reference date
    const todayISO = getTodayISO(timezone, date);

    // 2. Calculate updates using the transition engine
    let updates: Partial<Habit>;
    try {
        // Strip the extra 'users' property before passing to logic if strictness is required,
        // though structural typing usually allows extra properties. 
        // We pass it as Habit to satisfy the interface.
        updates = calculateHabitUpdates(habitData, HabitLifecycleEvent.USER_COMPLETE, todayISO);
    } catch (e: any) {
        console.error("Transition logic error:", e.message);
        throw new Error(`Action failed: ${e.message}`);
    }

    // 3. Update habit state
    const {error: updateError} = await supabase
        .from('habits')
        .update(updates)
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

    // We log using the reference date provided (which preserves time) but ensured it's consistent with "Today"
    await journalActivityService.logActivity(habit.user_id, date, {
        id: habit.id,
        type: 'habit',
        description: habit.name,
        timestamp: date.toISOString(),
        is_public: habit.is_public,
        status: 'completed',
        details: logEntryDetails,
    });

    return {data: null, error: null};
}

/**
 * Marks a habit as completed retroactively for YESTERDAY (Grace Period).
 * Updates the state to YESTERDAY.
 */
export async function completeHabitGrace(habitId: string, completions_data: CompletionsData, todayRefDate: Date): Promise<{
    data: { id: string } | null; error: PostgrestError | null
}> {
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);

    // 1. Fetch
    const {data: habit, error: fetchError} = await supabase
        .from('habits')
        .select('*, users!inner(timezone)')
        .eq('id', habitId)
        .single();

    if (fetchError || !habit) throw fetchError;

    // Cast
    type HabitWithUser = Habit & { users: { timezone: string } };
    const habitData = habit as unknown as HabitWithUser;
    const timezone = habitData.users?.timezone || 'UTC';

    const todayISO = getTodayISO(timezone, todayRefDate);

    // 2. Logic (GRACE_COMPLETE)
    let updates: Partial<Habit>;
    try {
        updates = calculateHabitUpdates(habitData, HabitLifecycleEvent.GRACE_COMPLETE, todayISO);
    } catch (e: any) {
        throw new Error(`Action failed: ${e.message}`);
    }

    // 3. DB Update
    const {error: updateError} = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId);

    if (updateError) throw updateError;

    // 4. Journal (Log for YESTERDAY)
    // We need to calculate the actual Date object for yesterday to store in the journal timestamp.
    // We subtract 24 hours from the reference date? 
    // Or we rely on `last_completed_date` from updates?
    // `updates.last_completed_date` is a Date object (from logic).
    // Let's use that.
    const completedDate = updates.last_completed_date as Date;

    const logEntryDetails: ActivityLogEntry['details'] = {
        mood: completions_data.mood,
        work_value: completions_data.work_value,
        time_taken: completions_data.time_taken,
        time_taken_unit: completions_data.time_taken_unit,
        notes: completions_data.notes,
        grace_period: true // Mark as grace entry
    };

    await journalActivityService.logActivity(habit.user_id, completedDate, {
        id: habit.id,
        type: 'habit',
        description: habit.name,
        timestamp: completedDate.toISOString(),
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
    const {error} = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

    if (error) {
        console.error("Error deleting habit:", error);
        throw error;
    }
}

export async function unmarkHabit(habitId: string, referenceDate: Date): Promise<void> {
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);

    // 1. Fetch habit + User (timezone)
    const {data: habit, error: habitError} = await supabase
        .from('habits')
        .select('*, users!inner(timezone)')
        .eq('id', habitId)
        .single();

    if (habitError || !habit) throw habitError;

    // Cast the joined result to a type that includes the user data
    type HabitWithUser = Habit & { users: { timezone: string } };
    const habitData = habit as unknown as HabitWithUser;

    const timezone = habitData.users?.timezone || 'UTC';

    // Resolve "Today" based on simulated time
    const todayISO = getTodayISO(timezone, referenceDate);

    // 2. Calculate updates
    let updates: Partial<Habit>;
    try {
        updates = calculateHabitUpdates(habitData, HabitLifecycleEvent.USER_UNDO, todayISO);
    } catch (e: any) {
        throw new Error(`Action not allowed: ${e.message}`);
    }

    // 3. Update habit state
    const {error: updateError} = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId);

    if (updateError) {
        throw updateError;
    }

    // 4. Delete activity record
    // Use the original completion date for removal if it exists
    const completionDate = habit.last_completed_date ? new Date(habit.last_completed_date) : new Date();
    await journalActivityService.removeActivity(habit.user_id, completionDate, habit.id, 'habit', habit.is_public);
}