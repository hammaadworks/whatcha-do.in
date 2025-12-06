// lib/supabase/types.ts


export interface Habit {
    id: string;
    user_id: string; // Added user_id
    name: string;
    is_public: boolean;
    current_streak: number;
    last_streak: number;
    goal_value: number | null;
    goal_unit: string | null;
    pile_state: string;
    junked_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Todo {
    id: string;
    description: string;
    is_public: boolean;
    is_completed: boolean;
    created_at: string;
}

export type ActivityLogEntry = {
  id: string; // UUID of the original item (ActionNode.id, HabitCompletion.id, TargetNode.id)
  type: 'action' | 'habit' | 'target';
  description: string;
  timestamp: string; // ISO 8601 UTC string
  status: 'completed' | 'uncompleted';
  is_public: boolean;
  details?: Record<string, any>; // Flexible for habit mood/notes, target progress, etc.
};

export interface JournalEntry {
    id: string;
    user_id: string;
    entry_date: string;
    content: string;
    is_public: boolean;
    created_at: string;
    activity_log: ActivityLogEntry[]; // New field
    updated_at: string; // Add updated_at as it's in the skeleton JournalEntry
}

// Placeholder for Supabase Database type - should ideally be generated.
export interface Database {
  public: {
    Tables: {
      journal_entries: {
        Row: JournalEntry; // Assuming JournalEntry structure matches the database table row
        Insert: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<JournalEntry, 'id' | 'created_at'>>;
      };
      // Add other tables as needed for Supabase types to be correct
      // For now, this minimal definition helps JournalActivityService compile
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export interface PublicUserDisplay {
    id: string;
    username?: string;
    bio?: string; // Made optional
    timezone?: string; // Added timezone
}

export interface PublicProfile extends PublicUserDisplay {
    email?: string; // Make optional as it's not always selected for public display
    habits: Habit[];
    todos: Todo[];
    journal_entries: JournalEntry[];
}

export interface ActionNode {
    id: string;
    description: string;
    completed: boolean;
    is_public?: boolean; // Add is_public flag
    completed_at?: string; // ISO timestamp
    children?: ActionNode[];
}

export interface Identity {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface Target {
    id: string;
    user_id: string;
    target_date: string | null; // YYYY-MM-01 or NULL
    data: ActionNode[]; // Reusing ActionNode structure
    created_at: string;
    updated_at: string;
}
