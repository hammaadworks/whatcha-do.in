import { createServerSideClient } from './server';
import { Habit } from '@/lib/supabase/types'; // Import Habit from centralized types

/**
 * Fetches all habits for a specific user from the server-side.
 * Used for authenticated views or owner dashboards.
 * 
 * @param userId - The ID of the user whose habits to fetch.
 * @returns A promise resolving to an array of Habit objects.
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
 * Fetches only public habits for a specific user.
 * Used for public profile views.
 * 
 * @param userId - The ID of the user whose public habits to fetch.
 * @returns A promise resolving to an array of public Habit objects.
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
