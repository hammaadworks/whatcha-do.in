import { supabaseClient } from "./client";

interface CreateHabitData {
  name: string;
  goal_value?: number;
  goal_unit?: string;
  user_id: string; // Assuming user_id is passed from the client for insertion
  is_public?: boolean; // Add optional is_public parameter
}

export async function createHabit(habitData: CreateHabitData) {
  const { name, goal_value, goal_unit, user_id, is_public } = habitData; // Destructure is_public

  const { data, error } = await supabaseClient
    .from("habits")
    .insert([
      {
        name,
        is_public: is_public !== undefined ? is_public : true, // Use provided is_public or default to true
        current_streak: 0, // Default to 0 streak
        goal_value: goal_value || null,
        goal_unit: goal_unit || null,
        user_id,
      },
    ])
    .select();

  if (error) {
    console.error("Error creating habit:", error);
    throw error;
  }

  return data;
}

interface UpdateHabitData {
  name?: string;
  is_public?: boolean;
  last_completed_at?: string;
  goal_value?: number | null; // Add optional goal_value parameter
  goal_unit?: string | null; // Add optional goal_unit parameter
}

export async function updateHabit(habitId: string, habitData: UpdateHabitData) {
  const { name, is_public, last_completed_at, goal_value, goal_unit } = habitData; // Destructure new goal fields

  const { data, error } = await supabaseClient
    .from("habits")
    .update({ name, is_public, last_completed_at, goal_value, goal_unit }) // Include new goal fields in update
    .eq("id", habitId)
    .select();

  if (error) {
    console.error("Error updating habit:", error);
    throw error;
  }

  return data;
}

export async function deleteHabit(habitId: string) {
  const { error } = await supabaseClient
    .from("habits")
    .delete()
    .eq("id", habitId);

  if (error) {
    console.error("Error deleting habit:", error);
    throw error;
  }

  return true; // Indicate successful deletion
}

interface UpdateStreakData {
  current_streak: number;
  last_streak: number;
}

export async function updateStreak(habitId: string, streakData: UpdateStreakData) {
  const { current_streak, last_streak } = streakData;

  const { data, error } = await supabaseClient
    .from("habits")
    .update({ current_streak, last_streak })
    .eq("id", habitId)
    .select();

  if (error) {
    console.error("Error updating streak:", error);
    throw error;
  }

  return data;
}
