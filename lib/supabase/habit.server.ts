import { createServerSideClient } from './server';
import { Habit } from '@/lib/supabase/types'; // Import Habit from centralized types

/**
 * Fetches habits for a specific user.
 * Assumes RLS is configured to handle public/private filtering if userId is for owner or other.
 */
export async function fetchOwnerHabitsServer(userId: string): Promise<Habit[]> {
  const supabase = await createServerSideClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error("Supabase Fetch Error (Server Owner Habits):", JSON.stringify(error, null, 2));
    throw error;
  }
  return data || [];
}

/**
 * Fetches public habits for a specific user.
 */
export async function fetchPublicHabitsServer(userId: string): Promise<Habit[]> {
  const supabase = await createServerSideClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true); // Ensure only public habits are fetched

  if (error) {
    console.error("Supabase Fetch Error (Server Public Habits):", JSON.stringify(error, null, 2));
    throw error;
  }
  return data || [];
}
