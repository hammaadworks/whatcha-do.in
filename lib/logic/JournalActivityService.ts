import { SupabaseClient } from '@supabase/supabase-js';
import { ActivityLogEntry, JournalEntry, Database } from '../supabase/types'; 
import { format } from 'date-fns';
import { withLogging } from '../logger/withLogging'; 
import logger from '../logger/server';

export class JournalActivityService {
  private supabase: SupabaseClient<Database>;
  private logger = logger.child({ service: 'JournalActivityService' });

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  /**
   * Fetches a journal entry for a given user, date, and privacy status.
   * Creates a new one if it doesn't exist.
   */
  private async _getOrCreateJournalEntry(
    userId: string,
    date: Date,
    isPublic: boolean
  ): Promise<JournalEntry> {
    const formattedDate = format(date, 'yyyy-MM-dd');
    this.logger.debug({ userId, formattedDate, isPublic }, 'Attempting to get or create journal entry.');

    const { data, error } = await this.supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', formattedDate)
      .eq('is_public', isPublic)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
      this.logger.error({ err: error, userId, formattedDate, isPublic }, 'Error fetching journal entry.');
      throw error;
    }

    if (data) {
      // Cast data to JournalEntry because Supabase types might not perfectly match our interface yet
      const entry = data as unknown as JournalEntry;
      this.logger.debug({ journalEntryId: entry.id }, 'Found existing journal entry.');
      return entry;
    } else {
      return this._createNewJournalEntry(userId, formattedDate, isPublic);
    }
  }

  private async _createNewJournalEntry(userId: string, formattedDate: string, isPublic: boolean): Promise<JournalEntry> {
      this.logger.info({ userId, formattedDate, isPublic }, 'Creating new journal entry.');
      
      // Use 'any' to bypass strict type check on insert for now, until Database definitions are fully aligned
      const newEntryPayload: any = {
        user_id: userId,
        entry_date: formattedDate,
        is_public: isPublic,
        content: '',
        activity_log: [],
      };

      const { data: newEntry, error: createError } = await this.supabase
        .from('journal_entries')
        .insert(newEntryPayload)
        .select('*')
        .single();

      if (createError) {
        this.logger.error({ 
          err: createError, 
          userId, 
          formattedDate, 
          isPublic,
          errorDetails: createError.message,
          errorCode: createError.code,
          errorHint: createError.hint,
        }, 'Error creating new journal entry.');
        throw createError;
      }
      
      const entry = newEntry as unknown as JournalEntry;
      this.logger.info({ journalEntryId: entry.id }, 'Successfully created new journal entry.');
      return entry;
  }

  /**
   * Logs an activity to the journal's activity_log.
   * If the activity already exists (same id, type), it updates it.
   */
  private async _logActivity(
    userId: string,
    date: Date,
    entry: Omit<ActivityLogEntry, 'status'> & { status?: 'completed' | 'uncompleted'}
  ): Promise<void> {
    this.logger.info({ userId, date, entry }, 'Logging activity.');
    const journalEntry = await this._getOrCreateJournalEntry(userId, date, entry.is_public);
    const activityLog = journalEntry.activity_log || [];

    // For habits, we always want to append new entries (to support multiple completions/super streaks).
    // For other types (actions, targets), we update the existing entry if found (idempotency).
    const existingIndex = (entry.type === 'habit')
      ? -1
      : activityLog.findIndex(
          (item) => item.id === entry.id && item.type === entry.type
        );

    const newLogEntry: ActivityLogEntry = {
      ...entry,
      status: entry.status || 'completed', 
    };

    if (existingIndex > -1) {
      activityLog[existingIndex] = newLogEntry;
      this.logger.debug({ activityId: entry.id, type: entry.type }, 'Updating existing activity log entry.');
    } else {
      activityLog.push(newLogEntry);
      this.logger.debug({ activityId: entry.id, type: entry.type }, 'Adding new activity log entry.');
    }

    await this._updateActivityLog(journalEntry.id, activityLog);
    this.logger.info({ activityId: entry.id, type: entry.type }, 'Activity successfully logged.');
  }

  /**
   * Removes an activity from the journal's activity_log.
   */
  private async _removeActivity(userId: string, date: Date, itemId: string, itemType: ActivityLogEntry['type'], isPublic: boolean): Promise<void> {
    this.logger.info({ userId, date, itemId, itemType, isPublic }, 'Removing activity.');
    const journalEntry = await this._getOrCreateJournalEntry(userId, date, isPublic);
    let activityLog = journalEntry.activity_log || [];

    const initialLength = activityLog.length;
    activityLog = activityLog.filter(
      (item) => !(item.id === itemId && item.type === itemType)
    );

    if (activityLog.length < initialLength) { 
      this.logger.debug({ itemId, itemType }, 'Found and removing activity from log.');
      await this._updateActivityLog(journalEntry.id, activityLog);
      this.logger.info({ itemId, itemType }, 'Activity successfully removed.');
    } else {
      this.logger.debug({ itemId, itemType }, 'Activity not found in log, no removal needed.');
    }
  }

  /**
   * Updates the activity log in the database.
   */
  private async _updateActivityLog(journalId: string, activityLog: ActivityLogEntry[]): Promise<void> {
      // Use 'any' cast to bypass strict type check for now, as the generic Database types
      // might not be perfectly aligned with the Supabase client inference in this context.
      const updatePayload = { 
          activity_log: activityLog as any 
      };

      const { error } = await (this.supabase
        .from('journal_entries') as any)
        .update(updatePayload) 
        .eq('id', journalId);

      if (error) {
        this.logger.error({ err: error, journalEntryId: journalId }, 'Error updating activity log in DB.');
        throw error;
      }
  }

  /**
   * Fetches the activity log for a specific date and privacy status.
   */
  private async _getActivitiesForDate(userId: string, date: Date, isPublic: boolean): Promise<ActivityLogEntry[]> {
    const formattedDate = format(date, 'yyyy-MM-dd');
    this.logger.info({ userId, formattedDate, isPublic }, 'Fetching activities for date.');
    const { data, error } = await this.supabase
      .from('journal_entries')
      .select('activity_log')
      .eq('user_id', userId)
      .eq('entry_date', formattedDate)
      .eq('is_public', isPublic)
      .single();

    if (error && error.code !== 'PGRST116') {
      this.logger.error({ err: error, userId, formattedDate, isPublic }, 'Error fetching activities for date.');
      throw error;
    }

    // Safe access with optional chaining and type assertion
    const activities = ((data as any)?.activity_log as ActivityLogEntry[]) || [];
    this.logger.info({ count: activities.length }, 'Successfully fetched activities for date.');
    return activities;
  }

  /**
   * Updates the habit name in activity log entries within the journal.
   */
  private async _updateHabitNameInJournal(
    userId: string,
    habitId: string,
    oldHabitName: string,
    newHabitName: string,
    referenceDate: Date
  ): Promise<void> {
    this.logger.info({ userId, habitId, oldHabitName, newHabitName }, 'Updating habit name in journal entries.');

    const entriesToUpdate = await this._fetchPublicAndPrivateEntries(userId, referenceDate);
    
    for (const journalEntry of entriesToUpdate) {
        await this._updateEntryDescription(journalEntry, habitId, oldHabitName, newHabitName);
    }
  }

  private async _fetchPublicAndPrivateEntries(userId: string, date: Date): Promise<JournalEntry[]> {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const publicQuery = this.supabase.from('journal_entries').select('*').eq('user_id', userId).eq('entry_date', formattedDate).eq('is_public', true).single();
      const privateQuery = this.supabase.from('journal_entries').select('*').eq('user_id', userId).eq('entry_date', formattedDate).eq('is_public', false).single();

      const [publicEntryResult, privateEntryResult] = await Promise.allSettled([publicQuery, privateQuery]);
  
      const entries: JournalEntry[] = [];
      
      if (publicEntryResult.status === 'fulfilled') {
          // Explicitly cast the fulfilled value to the expected Supabase response structure
          const response = publicEntryResult.value as { data: unknown };
          if (response.data) {
              entries.push(response.data as JournalEntry);
          }
      }
      
      if (privateEntryResult.status === 'fulfilled') {
          const response = privateEntryResult.value as { data: unknown };
          if (response.data) {
              entries.push(response.data as JournalEntry);
          }
      }
      return entries;
  }

  private async _updateEntryDescription(journalEntry: JournalEntry, habitId: string, oldName: string, newName: string) {
      let activityLog = journalEntry.activity_log || [];
      let needsUpdate = false;

      const updatedActivityLog = activityLog.map(activity => {
          if (activity.type === 'habit' && String(activity.id) === habitId && String(activity.description) === oldName) {
              needsUpdate = true;
              return { ...activity, description: newName };
          }
          return activity;
      });

      if (needsUpdate) {
          await this._updateActivityLog(journalEntry.id, updatedActivityLog);
          this.logger.debug({ journalEntryId: journalEntry.id, habitId }, 'Successfully updated habit name in journal entry.');
      }
  }

  // Wrapped public methods for logging
  public getOrCreateJournalEntry = withLogging(this._getOrCreateJournalEntry.bind(this), 'JournalActivityService.getOrCreateJournalEntry');
  public logActivity = withLogging(this._logActivity.bind(this), 'JournalActivityService.logActivity');
  public removeActivity = withLogging(this._removeActivity.bind(this), 'JournalActivityService.removeActivity');
  public getActivitiesForDate = withLogging(this._getActivitiesForDate.bind(this), 'JournalActivityService.getActivitiesForDate');
  public updateHabitNameInJournal = withLogging(this._updateHabitNameInJournal.bind(this), 'JournalActivityService.updateHabitNameInJournal');
}