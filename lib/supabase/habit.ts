import {createClient} from './client';
import {Habit, ActivityLogEntry} from './types'; 
import {CompletionData} from '@/components/habits/HabitCompletionModal';
import { JournalActivityService } from '@/lib/logic/JournalActivityService';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Creates a new habit record in the database.
 * @param habit - Partial habit object containing initial fields.
 * @returns Object containing the created data or an error.
 */
export const createHabit = async (habit: Partial<Habit>): Promise<{ data: Habit | null; error: PostgrestError | null }> => {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('habits')
        .insert([habit])
        .select()
        .single();
    return {data, error};
};

/**
 * Marks a habit as completed for a specific date.
 * Updates streak, inserts completion record, and logs to journal.
 * 
 * @param habitId - ID of the habit to complete.
 * @param data - Completion details (mood, work value, etc.).
 * @param date - The date of completion (defaults to now).
 * @returns Object containing the new completion ID or error.
 */
export async function completeHabit(habitId: string, data: CompletionData, date: Date = new Date()): Promise<{ data: { id: string } | null; error: PostgrestError | null }> {
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

    // 2. Calculate new streak
    let newStreak = habit.current_streak + 1;
    if (habit.pile_state === 'junked') {
        newStreak = 1; // Reset if junked
    }

    // 3. Insert completion record
    const { data: newCompletion, error: insertError } = await supabase
        .from('habit_completions')
        .insert({
            habit_id: habitId,
            user_id: habit.user_id,
            mood_score: data.mood_score,
            work_value: data.work_value,
            duration_value: data.duration_value,
            duration_unit: data.duration_unit,
            notes: data.notes,
            completed_at: date.toISOString(), // Explicitly set completion time
            goal_at_completion: habit.goal_value // Record what the goal was at this time
        })
        .select('id') // Select 'id' to return it
        .single();


    if (insertError) {
        console.error("Error inserting completion:", insertError);
        throw insertError;
    }

    // 4. Update habit state
    const {error: updateError} = await supabase
        .from('habits')
        .update({
            current_streak: newStreak, pile_state: 'today',
        })
        .eq('id', habitId);

    if (updateError) {
        console.error("Error updating habit streak:", updateError);
        throw updateError;
    }

    // --- NEW JOURNAL LOGIC (Start) ---
    const logEntryDetails: ActivityLogEntry['details'] = {
        mood_score: data.mood_score,
        work_value: data.work_value,
        duration_value: data.duration_value,
        duration_unit: data.duration_unit,
        notes: data.notes,
    };

    if (newCompletion?.id) {
        await journalActivityService.logActivity(
            habit.user_id, // Use user_id from fetched habit
            date, // Log for today
            {
                id: newCompletion.id, // Use habit_completion ID as the unique ID for this log entry
                type: 'habit',
                description: habit.name,
                is_public: habit.is_public, // Pass public status from fetched habit
                status: 'completed',
                details: logEntryDetails,
            }
        );
    }
    // --- NEW JOURNAL LOGIC (End) ---

    return { data: { id: newCompletion?.id ?? null }, error: null };
}

/**
 * Deletes a specific habit completion record and removes its journal entry.
 * 
 * @param completionId - ID of the completion to delete.
 * @param userId - ID of the user owning the completion.
 */
export async function deleteHabitCompletion(completionId: string, userId: string): Promise<void> {
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);

    // First, get details before deletion to pass to removeActivity
    const { data: completion, error: fetchError } = await supabase
        .from('habit_completions')
        .select('habit_id, completed_at')
        .eq('id', completionId)
        .single();

    if (fetchError || !completion) {
        console.error('Error fetching habit completion for deletion:', fetchError);
        throw fetchError;
    }

    // Determine public status by fetching the habit itself
    const { data: habit, error: habitError } = await supabase.from('habits').select('is_public').eq('id', completion.habit_id).single();
    if (habitError || !habit) {
        console.error('Error fetching habit for deletion:', habitError);
        throw habitError;
    }

    const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', completionId)
        .eq('user_id', userId); // Ensure only user's own completion can be deleted

    if (error) {
        console.error('Error deleting habit completion:', error);
        throw error;
    }

    // --- NEW JOURNAL LOGIC (Start) ---
    const completionDate = new Date(completion.completed_at);
    await journalActivityService.removeActivity(
        userId,
        completionDate,
        completionId,
        'habit',
        habit.is_public
    );
    // --- NEW JOURNAL LOGIC (End) ---
}


/**
 * Fetches all habits for a specific user (owner view).
 * @param userId - ID of the user.
 * @returns Array of habits.
 */
export async function fetchOwnerHabits(userId: string): Promise<Habit[]> {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('habits')
        .select('*') // Select all columns for owner's habits (public and private)
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching owner's habits:", error);
        throw error;
    }
    return data || [];
}

/**
 * Updates an existing habit.
 * @param habitId - ID of the habit to update.
 * @param updates - Partial object with fields to update.
 * @returns The updated habit object.
 */
export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    const supabase = createClient();
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
    return data;
}

/**
 * Deletes a habit and all associated data.
 * @param habitId - ID of the habit to delete.
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
 * Moves a habit to a new pile state and optionally removes the latest completion if it was "today".
 * Used when dragging a habit out of the "Today" column (unmarking it).
 * 
 * @param habitId - ID of the habit.
 * @param targetState - The new pile state (e.g., 'yesterday', 'pile').
 * @param referenceDate - Optional reference date for "today" check (defaults to now).
 */
export async function unmarkHabit(habitId: string, targetState: string, referenceDate: Date = new Date()): Promise<void> {
    const supabase = createClient();
    
    // 1. Fetch habit
    const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single();
        
    if (habitError || !habit) throw habitError;

    // 2. Find latest completion
    const { data: latestCompletion } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();
        
    let newStreak = habit.current_streak;
    
    // If we have a completion and it looks recent (e.g. created today), we delete it.
    if (latestCompletion) {
       // We can check if `latestCompletion.completed_at` is today.
       const completionDate = new Date(latestCompletion.completed_at);
       
       const isSameDay = completionDate.toDateString() === referenceDate.toDateString();
       
       if (isSameDay) {
           await deleteHabitCompletion(latestCompletion.id, habit.user_id);
           newStreak = Math.max(0, newStreak - 1);
       }
    }
    
    // 3. Update habit state
    const { error: updateError } = await supabase
        .from('habits')
        .update({
            current_streak: newStreak,
            pile_state: targetState
        })
        .eq('id', habitId);

    if (updateError) {
        throw updateError;
    }
}

/**
 * Backdates a completion for a habit (Developer Tool).
 * @param habitId - ID of the habit.
 * @param completedAt - The date to backdate the completion to.
 */
export async function backdateHabitCompletion(habitId: string, completedAt: Date): Promise<void> {
    const supabase = createClient();
    const journalActivityService = new JournalActivityService(supabase);

    // 1. Fetch current habit state to get user_id and name
    const { data: habit, error: fetchError } = await supabase
        .from('habits')
        .select('id, user_id, name, is_public, goal_value')
        .eq('id', habitId)
        .single();

    if (fetchError || !habit) {
        console.error("Error fetching habit for backdated completion:", fetchError);
        throw fetchError;
    }

    // 2. Insert completion record with the backdated time
    const { data: newCompletion, error: insertError } = await supabase
        .from('habit_completions')
        .insert({
            habit_id: habitId,
            user_id: habit.user_id,
            completed_at: completedAt.toISOString(),
            goal_at_completion: habit.goal_value,
            // Other fields are optional and can be null for debug purposes
        })
        .select('id')
        .single();

    if (insertError) {
        console.error("Error inserting backdated completion:", insertError);
        throw insertError;
    }

    // 3. Log activity for the backdated completion
    if (newCompletion?.id) {
        await journalActivityService.logActivity(
            habit.user_id,
            completedAt, // Log for the specific backdated date
            {
                id: newCompletion.id,
                type: 'habit',
                description: habit.name,
                is_public: habit.is_public,
                status: 'completed',
                details: {
                    // No specific details for backdated completion from debug panel
                },
            }
        );
    }
}
