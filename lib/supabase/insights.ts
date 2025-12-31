import { createClient } from "@/lib/supabase/client.ts";

export interface Insight {
  id: string;
  title: string;
  description: string;
  /**
   * Asynchronously fetches the dynamic value for the insight.
   * @param userId The ID of the user for whom to fetch the insight.
   * @returns A Promise that resolves to the string representation of the insight's value.
   */
  fetchValue: (userId: string) => Promise<string>;
}

// --- Supabase Data Fetching Functions ---

async function fetchUserHabits(userId: string): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("id, name, streak, longest_streak, habit_state, is_public")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching habits:", error);
    return [];
  }
  return data || [];
}

async function fetchUserJournalEntries(userId: string): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("id, entry_date, is_public, content")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching journal entries:", error);
    return [];
  }
  return data || [];
}

async function fetchUser(userId: string): Promise<any | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, created_at, username, motivations, is_pro, purchased_themes, active_theme")
    .eq("id", userId)
    .single(); // Expecting a single user

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  return data;
}

async function fetchUserIdentities(userId: string): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("identities")
    .select("id, title, is_public")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching identities:", error);
    return [];
  }
  return data || [];
}

async function fetchUserHabitIdentities(userId: string): Promise<any[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("habit_identities")
        .select("identity_id")
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching habit identities:", error);
        return [];
    }
    return data || [];
}

async function fetchUserActions(userId: string): Promise<any[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("actions")
    .select("data") // Fetching only the data field
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching actions:", error);
    return [];
  }
  return data || [];
}


// --- Metric Calculation Functions ---

async function getLongestHabitStreak(userId: string): Promise<string> {
  const habits = await fetchUserHabits(userId);
  if (!habits || habits.length === 0) return "0 days";
  // Ensure habit.longest_streak is treated as a number, default to 0 if null/undefined
  const longest = habits.reduce((max, habit) => Math.max(max, Number(habit.longest_streak) || 0), 0);
  return `${longest} days`;
}

// For "Habits Tracked"
async function getTotalHabitsTracked(userId: string): Promise<string> {
  const habits = await fetchUserHabits(userId);
  return habits ? habits.length.toString() : "0";
}

async function getMemberSince(userId: string): Promise<string> {
  const user = await fetchUser(userId);
  if (!user || !user.created_at) return "N/A";

  const now = new Date();
  const created = new Date(user.created_at);
  const diffTime = now.getTime() - created.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "Joined today";
  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.round(diffDays / 30)} months`;
  return `${Math.round(diffDays / 365)} years`;
}

async function getTotalWordsWritten(userId: string): Promise<string> {
    const journalEntries = await fetchUserJournalEntries(userId);
    if (!journalEntries || journalEntries.length === 0) return "0 words";

    let totalWords = 0;
    journalEntries.forEach(entry => {
        if (entry.content) {
            // Basic word count splitting by whitespace
            const words = entry.content.trim().split(/\s+/).length;
            totalWords += words;
        }
    });

    if (totalWords > 1000000) return `${(totalWords / 1000000).toFixed(1)}M words`;
    if (totalWords > 1000) return `${(totalWords / 1000).toFixed(1)}k words`;
    return `${totalWords} words`;
}

async function getCurrentHotStreak(userId: string): Promise<string> {
  const habits = await fetchUserHabits(userId);
  if (!habits || habits.length === 0) return "No active habits";

  // Filter for habits that are currently "lively" and have a streak > 0
  const activeHabits = habits.filter(habit => habit.habit_state === "lively" && habit.streak > 0);

  if (activeHabits.length === 0) return "No active streaks";

  // Find the habit with the maximum current streak
  const hottestHabit = activeHabits.reduce((maxHabit, currentHabit) => {
    return currentHabit.streak > maxHabit.streak ? currentHabit : maxHabit;
  }, activeHabits[0]);

  return `${hottestHabit.name} (${hottestHabit.streak})`;
}

async function getTotalCheckIns(userId: string): Promise<string> {
    const habits = await fetchUserHabits(userId);
    if (!habits || habits.length === 0) return "0";

    // Summing up all current streaks as a proxy for "check-ins" or "consistency points"
    // Ideally we would sum total completions if we had that history easily accessible
    const totalStreaks = habits.reduce((sum, habit) => sum + (Number(habit.streak) || 0), 0);
    
    return totalStreaks.toString();
}

async function getTopIdentity(userId: string): Promise<string> {
    const [identities, habitIdentities] = await Promise.all([
        fetchUserIdentities(userId),
        fetchUserHabitIdentities(userId)
    ]);

    if (!identities.length || !habitIdentities.length) return "N/A";

    // Count frequency of each identity_id
    const identityCounts: Record<string, number> = {};
    habitIdentities.forEach(hi => {
        identityCounts[hi.identity_id] = (identityCounts[hi.identity_id] || 0) + 1;
    });

    // Find identity_id with max count
    let maxCount = 0;
    let topIdentityId = null;
    for (const [id, count] of Object.entries(identityCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topIdentityId = id;
        }
    }

    if (!topIdentityId) return "N/A";

    const topIdentity = identities.find(i => i.id === topIdentityId);
    return topIdentity ? topIdentity.title : "N/A";
}


// --- Insight Definitions ---
// Aligning with original titles/icons and their intent

export const insights: Insight[] = [
  {
    id: "1",
    title: "🏆 Longest Streak",
    description: "Your all-time best streak.",
    fetchValue: getLongestHabitStreak
  },
  {
    id: "5",
    title: "🔥 Hot Streak",
    description: "Your best active streak.",
    fetchValue: getCurrentHotStreak
  },
  {
    id: "8",
    title: "📝 Words Written",
    description: "Total words in your journal.",
    fetchValue: getTotalWordsWritten
  },
  {
    id: "9",
    title: "✅ Check-ins",
    description: "Total active habit completions.",
    fetchValue: getTotalCheckIns
  },
  {
    id: "10",
    title: "🆔 Top Identity",
    description: "Your most active persona.",
    fetchValue: getTopIdentity
  },
  {
    id: "3",
    title: "🗓️ Member Since",
    description: "Time since you joined.",
    fetchValue: getMemberSince
  },
];