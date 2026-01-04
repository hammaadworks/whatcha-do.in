// lib/supabase/types.ts
export type ISODate = `${number}-${number}-${number}`;

import { HabitState } from "@/lib/enums.ts";

export interface Habit {
  id: string;
  user_id: string; // Added user_id
  name: string;
  is_public: boolean;
  goal_value: number | null;
  goal_unit: string | null;
  streak: number;
  undo_streak: number;
  longest_streak: number;
  undo_longest_streak: number;
  habit_state: HabitState;
  undo_habit_state: HabitState;
  junked_date: ISODate | null;
  undo_junked_date: ISODate | null;
  completed_date: Date | null;
  undo_completed_date: Date | null;
  processed_date: ISODate;
  created_at: string;
  updated_at: string;
  target_time?: string | null; // Added target_time
  descriptions?: string | null; // Added descriptions
  linked_identities?: { id: string; color?: string }[]; // Added linked_identities
}

export interface Todo {
  id: string;
  description: string;
  is_public: boolean;
  is_completed: boolean;
  created_at: string;
}

export interface CompletionsData {
  mood: number;
  work_value?: number;
  time_taken?: number;
  time_taken_unit?: string;
  notes?: string;
  attributed_date?: Date; // Optional: Dedicate completion to a specific date
}

export type ActivityLogEntry = {
  id: string; // UUID of the original item (ActionNode.id, HabitCompletion.id, TargetNode.id)
  type: "action" | "habit" | "target";
  description: string;
  timestamp: string; // ISO 8601 UTC string
  status: "completed" | "uncompleted";
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
        Insert: Omit<JournalEntry, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<JournalEntry, "id" | "created_at">>;
      };
      users: { // Add users table definition
        Row: User;
        Insert: Partial<User>;
        Update: Partial<User>;
      };
      // Add other tables as needed for Supabase types to be correct
      // For now, this minimal definition helps JournalActivityService compile
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
    CompositeTypes: Record<string, unknown>;
  };
}


export interface QuoteItem {
  id: string;
  text: string;
  author?: string; // Optional author
}

export interface PublicUserDisplay {
  id: string;
  username?: string;
  bio?: string; // Made optional
  timezone?: string; // Added timezone
  motivations?: QuoteItem[]; // Added motivations
  active_theme?: string; // Added active_theme
}

export interface PublicProfile extends PublicUserDisplay {
  email?: string; // Make optional as it's not always selected for public display
  habits: Habit[];
  todos: Todo[];
  journal_entries: JournalEntry[];
}

export interface User extends PublicUserDisplay {
  email?: string;
  motivations?: QuoteItem[];
  purchased_themes?: string[];
  is_pro?: boolean;
  created_at?: string;
  updated_at?: string;
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
  color?: string; // Added color
}

export interface IdentityWithCount extends Identity {
  backingCount: number;
}

export interface Target {
  id: string;
  user_id: string;
  target_date: string | null; // YYYY-MM-01 or NULL
  data: ActionNode[]; // Reusing ActionNode structure
  created_at: string;
  updated_at: string;
}
