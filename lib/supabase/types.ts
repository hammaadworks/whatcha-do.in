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

export interface JournalEntry {
    id: string;
    entry_date: string;
    content: string;
    is_public: boolean;
    created_at: string;
}

export interface PublicUserDisplay {
    id: string;
    username?: string;
    bio?: string; // Made optional
}

export interface PublicProfile extends PublicUserDisplay {
    email?: string; // Make optional as it's not always selected for public display
    habits: Habit[];
    todos: Todo[];
    journal_entries: JournalEntry[];
}
