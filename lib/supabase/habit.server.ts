import { createServerSideClient } from "./server";
import { Habit } from "@/lib/supabase/types";
import { HabitState } from "@/lib/enums.ts"; // Import Habit from centralized types

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
    .eq("is_public", true)
    .neq("habit_state", HabitState.JUNKED); // Ensure only public habits are fetched

  if (error) {
    console.error("Supabase Fetch Error (Server Public Habits):", JSON.stringify(error, null, 2));
    throw error;
  }
  
  // Transform nested response to match Habit interface
  return (data || []).map((habit: any) => ({
    ...habit,
    habit_identities: undefined, // Remove the raw relation
    linked_identities: habit.habit_identities?.map((hi: any) => hi.identities) || []
  }));
}
