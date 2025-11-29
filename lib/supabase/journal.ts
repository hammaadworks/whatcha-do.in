// lib/supabase/journal.ts
import { createClient } from './client';
import { JournalEntry } from './types';

export async function fetchJournalEntries(userId: string): Promise<JournalEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false }); // Order by date, newest first

  if (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }
  return data || [];
}
