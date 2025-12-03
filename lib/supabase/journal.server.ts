import { createServerSideClient } from './server';
import { JournalEntry } from '@/lib/supabase/types'; // Import JournalEntry from centralized types

/**
 * Fetches journal entries for a specific user.
 * Assumes RLS is configured to handle public/private filtering if userId is for owner or other.
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
 * Fetches only the public journal entries for a specific user.
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
