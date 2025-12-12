import { createServerSideClient } from './server';
import { JournalEntry } from '@/lib/supabase/types'; // Import JournalEntry from centralized types

/**
 * Fetches all journal entries for a specific user from the server-side.
 * 
 * Used for authenticated views or owner dashboards where RLS applies.
 * 
 * @param userId - The ID of the user whose journal entries to fetch.
 * @returns A promise resolving to an array of JournalEntry objects, ordered by date descending.
 */
export async function fetchJournalEntriesServer(userId: string): Promise<JournalEntry[]> {
  const supabase = await createServerSideClient();
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false }); // Order by date descending

  if (error) {
    console.error("Supabase Fetch Error (Server Journal Entries):", JSON.stringify(error, null, 2));
    throw error;
  }
  return data || [];
}

/**
 * Fetches only the public journal entries for a specific user from the server-side.
 * 
 * Used for public profile views.
 * 
 * @param userId - The ID of the user whose public entries to fetch.
 * @returns A promise resolving to an array of public JournalEntry objects, ordered by date descending.
 */
export async function fetchPublicJournalEntriesServer(userId: string): Promise<JournalEntry[]> {
  const supabase = await createServerSideClient();
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true) // Ensure only public entries are fetched
    .order('entry_date', { ascending: false }); // Order by date descending

  if (error) {
    console.error("Supabase Fetch Error (Server Public Journal Entries):", JSON.stringify(error, null, 2));
    throw error;
  }
  return data || [];
}