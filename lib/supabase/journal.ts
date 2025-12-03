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

export async function fetchJournalEntryByDate(userId: string, date: string, isPublic: boolean): Promise<JournalEntry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', date)
    .eq('is_public', isPublic)
    .maybeSingle();

  if (error) {
    console.error("Error fetching journal entry by date:", error);
    throw error;
  }
  return data;
}

export async function upsertJournalEntry(entry: Partial<JournalEntry> & { user_id: string; entry_date: string; is_public: boolean }): Promise<JournalEntry> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('journal_entries')
    .upsert(entry, { onConflict: 'user_id, entry_date, is_public' })
    .select()
    .single();

  if (error) {
    console.error("Error upserting journal entry:", error);
    throw error;
  }
  return data;
}
