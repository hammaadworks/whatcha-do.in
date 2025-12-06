import {createClient} from './client';
import {Habit, ActivityLogEntry} from './types'; // Import ActivityLogEntry
import {CompletionData} from '@/components/habits/HabitCompletionModal';
import { JournalActivityService } from '@/lib/logic/JournalActivityService'; // New import for JournalActivityService

// Placeholder for createHabit if it was lost, or real implementation
export const createHabit = async (habit: Partial<Habit>): Promise<{ data: Habit | null; error: any }> => {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('habits')
        .insert([habit])
        .select()
        .single();
    return {data, error};
};

export async function completeHabit(habitId: string, data: CompletionData): Promise<{ data: { id: string } | null; error: any }> {
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
            completed_at: new Date().toISOString(), // Explicitly set completion time
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
            new Date(), // Log for today
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

