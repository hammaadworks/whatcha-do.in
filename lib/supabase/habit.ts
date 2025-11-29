// lib/supabase/habit.ts
import { createClient } from './client';
import { Habit } from './types'; // Assuming Habit type is defined in types.ts

export const createHabit = async (habitData: unknown /* eslint-disable-line @typescript-eslint/no-unused-vars */) => {
    console.warn("createHabit is a stub and not fully implemented.");
    return { data: null, error: null };
};

export async function fetchPublicHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*') // Select all columns for public habits
    .eq('user_id', userId)
    .eq('is_public', true); // Only fetch public habits

  if (error) {
    console.error("Error fetching public habits:", error);
    throw error;
  }
  return data || [];
}

export async function fetchOwnerHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*') // Select all columns for owner's habits (public and private)
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching owner's habits:", error);
    throw error;
  }
  return data || [];
}