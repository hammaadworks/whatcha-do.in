# Real-Time Activity Journaling Strategy

## 1. Executive Summary

This document outlines the strategy for implementing real-time activity logging into the user's journal. The goal is to move from a batch-processed "Next Day Clearing" mechanism (where completed items are archived into the journal as text the following day) to an immediate, structured logging system. This new approach will store activity completions (from Actions, Habits, and Targets) in a dedicated, read-only `JSONB` column in the `journal_entries` table. This separation ensures that user-editable journal content remains untouched while providing an accurate, timestamped record of daily accomplishments.

## 2. Core Architectural Changes

### 2.1. Database Upgrade: `journal_entries.activity_log` (JSONB)

Instead of appending to the existing `content` (Markdown) column, a new `JSONB` column will be added to the `journal_entries` table. This column will store an array of structured activity objects for a given day and `is_public` status.

#### Migration SQL Example:

```sql
-- Migration: Add activity_log JSONB column to journal_entries
-- This assumes you have a journal_entries table. Adjust table name and schema if necessary.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'activity_log') THEN
        ALTER TABLE public.journal_entries
        ADD COLUMN activity_log JSONB NOT NULL DEFAULT '[]'::JSONB;

        -- Optional: Add a comment for documentation
        COMMENT ON COLUMN public.journal_entries.activity_log IS 'Stores structured, read-only activity logs (actions, habits, targets) for the day.';
    END IF;
END
$$;
```

#### `activity_log` Structure (JSONB Array):

Each object in the `activity_log` array represents a single completed or uncompleted activity.

```json
[
  {
    "id": "uuid-of-the-item",         // Unique ID of the ActionNode, HabitCompletion, or TargetNode
    "type": "action",                 // Discriminator: 'action', 'habit', or 'target'
    "description": "Task description or habit name",
    "timestamp": "2025-12-05T10:30:00Z", // ISO 8601 UTC timestamp of the log event (completion/uncompletion)
    "status": "completed",            // 'completed' or 'uncompleted'
    "is_public": true,                // Privacy status of the original item
    "details": {                      // Optional, item-type specific metadata
      // For Actions/Targets (could be empty or contain progress info)
      // For Habits (e.g., from HabitCompletionModal)
      "mood": "happy",
      "notes": "Felt great about this!",
      "value": 5,                     // e.g., for quantitative goals (5 pages, 10 reps)
      "unit": "pages"
    }
  },
  {
    "id": "another-item-uuid",
    "type": "habit",
    "description": "Morning Meditation",
    "timestamp": "2025-12-05T07:15:00Z",
    "status": "completed",
    "is_public": false,
    "details": {
      "mood": "calm",
      "duration": "10 minutes"
    }
  }
]
```

### 2.2. `JournalActivityService` (New Module: `lib/logic/JournalActivityService.ts`)

This service will abstract away the complexity of interacting with the `journal_entries.activity_log` column. It will handle fetching, manipulating, and updating the JSONB array for specific journal entries (identified by `user_id`, `entry_date`, and `is_public`).

#### `ActivityLogEntry` Type Definition:

```typescript
// lib/supabase/types.ts or new types/journal.ts
export type ActivityLogEntry = {
  id: string; // UUID of the original item (ActionNode.id, HabitCompletion.id, TargetNode.id)
  type: 'action' | 'habit' | 'target';
  description: string;
  timestamp: string; // ISO 8601 UTC string
  status: 'completed' | 'uncompleted';
  is_public: boolean;
  details?: Record<string, any>; // Flexible for habit mood/notes, target progress, etc.
};

// Also update JournalEntry if it's defined:
export type JournalEntry = {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  content: string; // Existing markdown content
  is_public: boolean;
  activity_log: ActivityLogEntry[]; // New field
  created_at: string;
  updated_at: string;
};
```

#### Skeleton `JournalActivityService.ts`:

```typescript
// lib/logic/JournalActivityService.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types'; // Assuming types are generated
import { ActivityLogEntry, JournalEntry } from '../types/journal'; // Or wherever you define them
import { format } from 'date-fns';

type JournalUpsertPayload = Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'> & {
  id?: string; // ID can be optional for upsert
};

export class JournalActivityService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  /**
   * Fetches a journal entry for a given user, date, and privacy status.
   * Creates a new one if it doesn't exist.
   */
  private async getOrCreateJournalEntry(
    userId: string,
    date: Date,
    isPublic: boolean
  ): Promise<JournalEntry> {
    const formattedDate = format(date, 'yyyy-MM-dd');

    const { data, error } = await this.supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', formattedDate)
      .eq('is_public', isPublic)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
      console.error('Error fetching journal entry:', error);
      throw error;
    }

    if (data) {
      return data as JournalEntry; // Type assertion as Supabase typings might be looser
    } else {
      // Create a new entry if not found
      const newEntryPayload: JournalUpsertPayload = {
        user_id: userId,
        entry_date: formattedDate,
        is_public: isPublic,
        content: '', // Start with empty content
        activity_log: [],
      };
      const { data: newEntry, error: createError } = await this.supabase
        .from('journal_entries')
        .insert(newEntryPayload)
        .select('*')
        .single();

      if (createError) {
        console.error('Error creating new journal entry:', createError);
        throw createError;
      }
      return newEntry as JournalEntry;
    }
  }

  /**
   * Logs an activity to the journal's activity_log.
   * If the activity already exists (same id, type), it updates it.
   */
  public async logActivity(
    userId: string,
    date: Date,
    entry: Omit<ActivityLogEntry, 'timestamp' | 'status'> & { status?: 'completed' | 'uncompleted'}
  ): Promise<void> {
    const journalEntry = await this.getOrCreateJournalEntry(userId, date, entry.is_public);
    const activityLog = journalEntry.activity_log || [];

    const existingIndex = activityLog.findIndex(
      (item) => item.id === entry.id && item.type === entry.type
    );

    const newLogEntry: ActivityLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(), // Always use current time for logging
      status: entry.status || 'completed', // Default to completed if not specified
    };

    if (existingIndex > -1) {
      activityLog[existingIndex] = newLogEntry; // Update existing
    } else {
      activityLog.push(newLogEntry); // Add new
    }

    const { error } = await this.supabase
      .from('journal_entries')
      .update({ activity_log: activityLog })
      .eq('id', journalEntry.id);

    if (error) {
      console.error('Error updating activity log:', error);
      throw error;
    }
  }

  /**
   * Removes an activity from the journal's activity_log.
   */
  public async removeActivity(userId: string, date: Date, itemId: string, itemType: ActivityLogEntry['type'], isPublic: boolean): Promise<void> {
    const journalEntry = await this.getOrCreateJournalEntry(userId, date, isPublic);
    let activityLog = journalEntry.activity_log || [];

    const initialLength = activityLog.length;
    activityLog = activityLog.filter(
      (item) => !(item.id === itemId && item.type === itemType)
    );

    if (activityLog.length < initialLength) { // Only update if something was actually removed
      const { error } = await this.supabase
        .from('journal_entries')
        .update({ activity_log: activityLog })
        .eq('id', journalEntry.id);

      if (error) {
        console.error('Error removing activity from log:', error);
        throw error;
      }
    }
  }

  /**
   * Fetches the activity log for a specific date and privacy status.
   */
  public async getActivitiesForDate(userId: string, date: Date, isPublic: boolean): Promise<ActivityLogEntry[]> {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const { data, error } = await this.supabase
      .from('journal_entries')
      .select('activity_log')
      .eq('user_id', userId)
      .eq('entry_date', formattedDate)
      .eq('is_public', isPublic)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching activities for date:', error);
      throw error;
    }

    return (data?.activity_log as ActivityLogEntry[]) || [];
  }
}

// Example usage (somewhere in your app, after Supabase client is initialized)
// const supabase = createClient(...) // Your Supabase client
// const journalActivityService = new JournalActivityService(supabase);
```

### 2.3. Integration Points

The `JournalActivityService` will be integrated into the relevant hooks and components that handle the completion/uncompletion of Actions, Habits, and Targets. The `timestamp` for the log entry will always be the current time at which the `logActivity` or `removeActivity` method is called.

#### 2.3.1. Actions (`hooks/useActions.ts`)

Modify the `toggleAction` function to call the `JournalActivityService`.

```typescript
// hooks/useActions.ts (conceptual diff)
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { ActionNode, ActionTree } from '../lib/supabase/types';
import { updateActions } from '../lib/supabase/actions';
import { useAuth } from './useAuth';
import { JournalActivityService } from '../lib/logic/JournalActivityService'; // New import
import { useSupabase } from '../lib/supabase/supabase-provider'; // Assuming you have a way to get supabase client

export const useActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { supabase } = useSupabase(); // Get supabase client
  const journalActivityService = new JournalActivityService(supabase); // Initialize service

  // ... existing code ...

  const toggleActionMutation = useMutation({
    mutationFn: async ({ actionId, newCompletedStatus }: { actionId: string; newCompletedStatus: boolean }) => {
      if (!user) throw new Error('User not authenticated.');

      // Optimistic update (existing logic)
      queryClient.setQueryData(['actions', user.id], (oldData: ActionTree | undefined) => {
        if (!oldData) return undefined;
        return produce(oldData, (draft) => {
          const findAndToggle = (nodes: ActionNode[]): boolean => {
            for (const node of nodes) {
              if (node.id === actionId) {
                if (newCompletedStatus && node.children && node.children.some(child => !child.completed)) {
                  // If trying to complete parent with uncompleted children, prevent
                  return false;
                }
                node.completed = newCompletedStatus;
                node.completed_at = newCompletedStatus ? new Date().toISOString() : null;

                // --- NEW JOURNAL LOGIC (Start) ---
                journalActivityService.logActivity(
                    user.id,
                    new Date(), // Log for today
                    {
                      id: node.id,
                      type: 'action',
                      description: node.description,
                      is_public: node.is_public,
                      status: newCompletedStatus ? 'completed' : 'uncompleted',
                      // details can be added if action nodes have more attributes
                    }
                  );
                // --- NEW JOURNAL LOGIC (End) ---
                return true;
              }
              if (node.children && findAndToggle(node.children)) {
                // If a child was toggled, re-evaluate parent completion status
                node.completed = node.children.every(child => child.completed);
                return true;
              }
            }
            return false;
          };
          findAndToggle(draft.data);
        });
      });

      // Actual DB update (existing logic)
      const updatedTree = queryClient.getQueryData(['actions', user.id]) as ActionTree;
      return updateActions(user.id, updatedTree.data);
    },
    // ... existing onSuccess, onError ...
  });

  // ... rest of the hook ...
};
```

#### 2.3.2. Habits (`lib/supabase/habit.ts` & UI)

Habit management is slightly different due to the `habit_completions` table.

*   **Completion (Adding to Log):** Modify the `completeHabit` function.

    ```typescript
    // lib/supabase/habit.ts (conceptual diff)
    import { createClient } from './supabase-server'; // Or your client import
    import { JournalActivityService } from '../lib/logic/JournalActivityService'; // New import
    import { ActivityLogEntry } from '../types/journal'; // New import

    // ... existing habit types and functions ...

    export async function completeHabit(
      habitId: string,
      userId: string,
      details: { mood_score?: number; actual_value_achieved?: number; goal_at_completion?: number; duration_value?: number; duration_unit?: string; notes?: string; is_public: boolean }
    ) {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: userId,
          completed_at: new Date().toISOString(),
          mood_score: details.mood_score,
          actual_value_achieved: details.actual_value_achieved,
          goal_at_completion: details.goal_at_completion,
          duration_value: details.duration_value,
          duration_unit: details.duration_unit,
          notes: details.notes,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error completing habit:', error);
        throw error;
      }

      // --- NEW JOURNAL LOGIC (Start) ---
      const habitResponse = await supabase.from('habits').select('name').eq('id', habitId).single();
      const habitName = habitResponse.data?.name || 'Unknown Habit';

      const logEntryDetails: ActivityLogEntry['details'] = {
        mood: details.mood_score ? `Score: ${details.mood_score}` : undefined,
        notes: details.notes,
        value: details.actual_value_achieved,
        unit: details.duration_unit || details.goal_at_completion ? (details.goal_at_completion?.toString() + ' (goal)') : undefined,
        duration: details.duration_value ? `${details.duration_value} ${details.duration_unit}` : undefined,
      };

      const journalActivityService = new JournalActivityService(supabase);
      await journalActivityService.logActivity(
        userId,
        new Date(), // Log for today
        {
          id: data.id, // Use habit_completion ID as the unique ID for this log entry
          type: 'habit',
          description: habitName,
          is_public: details.is_public, // Pass public status from completion modal
          details: logEntryDetails,
        }
      );
      // --- NEW JOURNAL LOGIC (End) ---

      return data;
    }

    export async function deleteHabitCompletion(completionId: string, userId: string) {
      const supabase = createClient();

      // First, get details before deletion to pass to removeActivity
      const { data: completion, error: fetchError } = await supabase
        .from('habit_completions')
        .select('habit_id, completed_at')
        .eq('id', completionId)
        .single();

      if (fetchError || !completion) {
          console.error('Error fetching habit completion for deletion:', fetchError);
          throw fetchError;
      }

      // Determine public status (you'll need to fetch the habit itself or pass this info)
      // For simplicity here, assume you know its public status or fetch it
      const { data: habit, error: habitError } = await supabase.from('habits').select('is_public').eq('id', completion.habit_id).single();
      if (habitError || !habit) {
          console.error('Error fetching habit for deletion:', habitError);
          throw habitError;
      }

      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', completionId)
        .eq('user_id', userId); // Ensure only user's own completion can be deleted

      if (error) {
        console.error('Error deleting habit completion:', error);
        throw error;
      }

      // --- NEW JOURNAL LOGIC (Start) ---
      const completionDate = new Date(completion.completed_at); // Use the original completion date
      const journalActivityService = new JournalActivityService(supabase);
      await journalActivityService.removeActivity(
        userId,
        completionDate,
        completionId, // ID used for logging
        'habit',
        habit.is_public // Pass the original public status
      );
      // --- NEW JOURNAL LOGIC (End) ---

      return true;
    }
    ```

#### 2.3.3. Targets (`hooks/useTargets.ts`)

Similar to Actions, modify the `toggleTarget` function.

```typescript
// hooks/useTargets.ts (conceptual diff)
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { ActionNode, TargetTree } from '../lib/supabase/types'; // Target uses ActionNode structure
import { updateTargets } from '../lib/supabase/targets';
import { useAuth } from './useAuth';
import { JournalActivityService } from '../lib/logic/JournalActivityService'; // New import
import { useSupabase } from '../lib/supabase/supabase-provider'; // Assuming client access

export const useTargets = (userId: string, targetDate: string | null) => {
  const queryClient = useQueryClient();
  const { supabase } = useSupabase();
  const journalActivityService = new JournalActivityService(supabase);

  // ... existing code ...

  const toggleTargetMutation = useMutation({
    mutationFn: async ({ targetId, newCompletedStatus }: { targetId: string; newCompletedStatus: boolean }) => {
      if (!userId) throw new Error('User ID is required.');

      // Optimistic update
      queryClient.setQueryData(['targets', userId, targetDate], (oldData: TargetTree | undefined) => {
        if (!oldData) return undefined;
        return produce(oldData, (draft) => {
          const findAndToggle = (nodes: ActionNode[]): boolean => {
            for (const node of nodes) {
              if (node.id === targetId) {
                if (newCompletedStatus && node.children && node.children.some(child => !child.completed)) {
                  return false;
                }
                node.completed = newCompletedStatus;
                node.completed_at = newCompletedStatus ? new Date().toISOString() : null;

                // --- NEW JOURNAL LOGIC (Start) ---
                journalActivityService.logActivity(
                    userId,
                    new Date(), // Log for today
                    {
                      id: node.id,
                      type: 'target',
                      description: node.description,
                      is_public: node.is_public,
                      status: newCompletedStatus ? 'completed' : 'uncompleted',
                    }
                  );
                // --- NEW JOURNAL LOGIC (End) ---
                return true;
              }
              if (node.children && findAndToggle(node.children)) {
                node.completed = node.children.every(child => child.completed);
                return true;
              }
            }
            return false;
          };
          findAndToggle(draft.data);
        });
      });

      // Actual DB update
      const updatedTree = queryClient.getQueryData(['targets', userId, targetDate]) as TargetTree;
      return updateTargets(userId, targetDate, updatedTree.data);
    },
    // ... existing onSuccess, onError ...
  });

  // ... rest of the hook ...
};
```

### 2.4. UI Rendering (`components/journal/JournalPageContent.tsx`)

The journal page will be updated to fetch both the `content` (Markdown) and `activity_log` for the selected day and privacy type. The `activity_log` will be rendered in a read-only section above the editable Markdown content.

#### UI Component Sketch:

```tsx
// components/journal/JournalPageContent.tsx (Conceptual Component Structure)
import React from 'react';
import { JournalEntry, ActivityLogEntry } from '../../types/journal'; // Assuming type path
import { format } from 'date-fns';
import { MarkdownRenderer } from '../shared/MarkdownRenderer'; // Assuming a Markdown renderer component

interface JournalPageContentProps {
  journalEntry: JournalEntry | null; // Can be null if no entry exists
  // ... other props for date selection, privacy toggle, etc.
}

const formatActivityLogEntry = (entry: ActivityLogEntry): string => {
  const time = format(new Date(entry.timestamp), 'hh:mm a');
  const details = entry.details ? Object.entries(entry.details)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ') : '';
  const detailString = details ? ` (${details})` : '';

  return `- [${entry.status === 'completed' ? 'x' : ' '}] ${time} ${entry.description}${detailString}`;
};

export const JournalPageContent: React.FC<JournalPageContentProps> = ({ journalEntry }) => {
  const activityLog = journalEntry?.activity_log || [];
  const userContent = journalEntry?.content || '';

  const actions = activityLog.filter(item => item.type === 'action');
  const habits = activityLog.filter(item => item.type === 'habit');
  const targets = activityLog.filter(item => item.type === 'target');

  return (
    <div className="journal-container">
      {/* Activity Log Section (Read-Only) */}
      <div className="activity-log-section p-4 bg-gray-100 dark:bg-gray-800 rounded-md mb-6">
        <h2 className="text-xl font-bold mb-3">Daily Activity Log</h2>
        {activityLog.length === 0 ? (
          <p className="text-gray-500">No activities logged for this day yet.</p>
        ) : (
          <>
            {actions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">## Actions</h3>
                <ul className="list-none pl-0">
                  {actions.map((action, index) => (
                    <li key={action.id || index} className="mb-1 text-sm">
                      {formatActivityLogEntry(action)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {habits.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">## Habits</h3>
                <ul className="list-none pl-0">
                  {habits.map((habit, index) => (
                    <li key={habit.id || index} className="mb-1 text-sm">
                      {formatActivityLogEntry(habit)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {targets.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">## Targets</h3>
                <ul className="list-none pl-0">
                  {targets.map((target, index) => (
                    <li key={target.id || index} className="mb-1 text-sm">
                      {formatActivityLogEntry(target)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Editable Journal Content */}
      <div className="user-journal-section">
        <h2 className="text-xl font-bold mb-3">My Thoughts</h2>
        {/* Replace with your actual Markdown editor component */}
        <textarea
          value={userContent}
          onChange={(e) => { /* Handle content change and save */ }}
          className="w-full p-4 border rounded-md min-h-[300px]"
          placeholder="Write your daily reflections here..."
        />
        {/* Or if using a rich text editor/Markdown editor component */}
        {/* <MarkdownEditor value={userContent} onChange={handleUserContentChange} /> */}
      </div>
    </div>
  );
};
```

### 2.5. Revision to "Next Day Clearing" Logic (`lib/logic/actionLifecycle.ts`)

The `processActionLifecycle` function, which is responsible for archiving completed items into the journal's `content` and then deleting them from active lists, will be modified.

*   **Current Behavior:**
    1.  Identifies completed actions/targets from previous days.
    2.  Formats them into text.
    3.  Appends this text to `journal_entries.content`.
    4.  Deletes the items from the `actions` or `targets` JSONB tree.

*   **New Behavior:**
    1.  Identifies completed actions/targets from previous days.
    2.  **SKIPS** appending them to `journal_entries.content` (as they are now logged in real-time to `activity_log`).
    3.  **ONLY** deletes the items from the `actions` or `targets` JSONB tree.

This change ensures that `activity_log` is the single source of truth for real-time completion records, avoiding duplication and confusion.

### 2.6. Key Considerations

*   **Supabase Client:** Ensure the `SupabaseClient` is correctly instantiated and passed to the `JournalActivityService`. If using `supabase-provider`, retrieve it from there.
*   **Timezones:** All timestamps for `ActivityLogEntry` should be ISO 8601 UTC strings. When displaying, these should be converted to the user's local timezone (which is already a project decision, ADR 010).
*   **Error Handling:** Implement robust error handling within the `JournalActivityService` and its callers, particularly around database operations and JSONB manipulation.
*   **Performance:** Manipulating `JSONB` arrays (especially filtering and updating) is generally efficient in PostgreSQL. However, for extremely high volumes of activities per day, consider potential performance implications, though unlikely for this application's scale.
*   **Type Safety:** Leverage TypeScript interfaces (`ActivityLogEntry`, `JournalEntry`) to ensure type safety throughout the implementation.

This detailed plan, including code snippets and examples, should provide a clear roadmap for the developer working on this feature.