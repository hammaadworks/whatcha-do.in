import { createClient } from './client';
import { JournalEntry, ActivityLogEntry } from './types';
import { withLogging } from '@/lib/logger/withLogging';

/**
 * Internal function to fetch all journal entries.
 */
async function _fetchJournalEntries(userId: string): Promise<JournalEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false });

  if (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }
  return data || [];
}

/**
 * Fetches all journal entries for a given user, ordered by date descending.
 * 
 * @param userId - The ID of the user.
 * @returns A promise resolving to an array of JournalEntry objects.
 */
export const fetchJournalEntries = withLogging(_fetchJournalEntries, 'fetchJournalEntries');

/**
 * Internal function to fetch single journal entry.
 */
async function _fetchJournalEntryByDate(
  userId: string, 
  date: string, 
  isPublic: boolean
): Promise<JournalEntry | null> {
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

/**
 * Fetches a single journal entry by date and public status.
 * 
 * @param userId - The ID of the user.
 * @param date - The date string (YYYY-MM-DD).
 * @param isPublic - Whether to fetch the public or private entry.
 * @returns A promise resolving to the JournalEntry or null if not found.
 */
export const fetchJournalEntryByDate = withLogging(_fetchJournalEntryByDate, 'fetchJournalEntryByDate');

/**
 * Internal function to upsert journal entry.
 */
async function _upsertJournalEntry(
  entry: Partial<JournalEntry> & { user_id: string; entry_date: string; is_public: boolean }
): Promise<JournalEntry> {
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

/**
 * Creates or updates a journal entry.
 * 
 * @param entry - Partial entry object. Must include user_id, entry_date, and is_public.
 * @returns A promise resolving to the upserted JournalEntry.
 */
export const upsertJournalEntry = withLogging(_upsertJournalEntry, 'upsertJournalEntry');

/**
 * Internal function to update activity log entry.
 */
async function _updateActivityLogEntry(
  userId: string,
  entryDate: string,
  journalIsPublic: boolean,
  activityLogId: string,
  changes: Partial<ActivityLogEntry>,
  now: Date = new Date()
): Promise<JournalEntry> {
  const supabase = createClient();

  // 1. Fetch the existing journal entry
  // Note: We use the internal function to avoid double-logging if we called the exported one
  // but for consistency/completeness of tracing, calling the exported one is also fine.
  // Using the exported one 'fetchJournalEntryByDate' adds a nested log which is useful.
  const existingEntry = await fetchJournalEntryByDate(userId, entryDate, journalIsPublic);

  if (!existingEntry) {
    throw new Error('Journal entry not found.');
  }

  // 2. Find and update the specific activity log entry
  const updatedActivityLog = existingEntry.activity_log.map((activity) =>
    activity.id === activityLogId ? { ...activity, ...changes } : activity
  );

  // 3. Upsert the journal entry with the updated activity log
  const { data, error } = await supabase
    .from('journal_entries')
    .upsert({
      ...existingEntry,
      activity_log: updatedActivityLog,
      updated_at: now.toISOString(),
    } as JournalEntry)
    .select()
    .single();

  if (error) {
    console.error(`Error updating activity log entry ${activityLogId}:`, error);
    throw error;
  }

  return data;
}

/**
 * Updates a specific ActivityLogEntry within a JournalEntry's activity_log array.
 * Fetches the journal entry, modifies the activity log, and then upserts the journal entry.
 * 
 * @param userId - The ID of the user.
 * @param entryDate - The date of the journal entry (e.g., 'YYYY-MM-DD').
 * @param journalIsPublic - The public/private status of the parent journal entry.
 * @param activityLogId - The unique ID of the activity log entry to update.
 * @param changes - An object containing the properties to update in the activity log entry.
 * @param now - Optional Date object for the 'updated_at' timestamp (defaults to new Date()).
 * @returns The updated JournalEntry.
 */
export const updateActivityLogEntry = withLogging(_updateActivityLogEntry, 'updateActivityLogEntry');

/**
 * Internal function to delete activity log entry.
 */
async function _deleteActivityLogEntry(
  userId: string,
  entryDate: string,
  journalIsPublic: boolean,
  activityLogId: string,
  now: Date = new Date()
): Promise<JournalEntry> {
  const supabase = createClient();

  // 1. Fetch the existing journal entry
  const existingEntry = await fetchJournalEntryByDate(userId, entryDate, journalIsPublic);

  if (!existingEntry) {
    throw new Error('Journal entry not found.');
  }

  // 2. Filter out the specific activity log entry
  const updatedActivityLog = existingEntry.activity_log.filter(
    (activity) => activity.id !== activityLogId
  );

  // 3. Upsert the journal entry with the updated activity log
  const { data, error } = await supabase
    .from('journal_entries')
    .upsert({
      ...existingEntry,
      activity_log: updatedActivityLog,
      updated_at: now.toISOString(),
    } as JournalEntry)
    .select()
    .single();

  if (error) {
    console.error(`Error deleting activity log entry ${activityLogId}:`, error);
    throw error;
  }

  return data;
}

/**
 * Deletes a specific ActivityLogEntry from a JournalEntry's activity_log array.
 * Fetches the journal entry, removes the activity log entry, and then upserts the journal entry.
 * 
 * @param userId - The ID of the user.
 * @param entryDate - The date of the journal entry (e.g., 'YYYY-MM-DD').
 * @param journalIsPublic - The public/private status of the parent journal entry.
 * @param activityLogId - The unique ID of the activity log entry to delete.
 * @param now - Optional Date object for the 'updated_at' timestamp (defaults to new Date()).
 * @returns The updated JournalEntry.
 */
export const deleteActivityLogEntry = withLogging(_deleteActivityLogEntry, 'deleteActivityLogEntry');