CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET search_path = public, extensions;

-- Subtask 1.1: Draft SQL for `users` table
CREATE TABLE public.users (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    bio text,
    timezone text NOT NULL DEFAULT 'UTC',
    grace_screen_shown_for_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);

-- Subtask 1.2: Draft SQL for `habits` and `habit_completions` tables
CREATE TABLE public.habits (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    is_public boolean DEFAULT FALSE NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    last_streak integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    goal_value numeric,
    goal_unit text,
    last_recorded_mood integer,
    last_recorded_work_value numeric,
    last_recorded_work_unit text,
    pile_state text,
    junked_at timestamp with time zone,
    updated_at timestamp with time zone
);

CREATE TABLE public.habit_completions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id uuid REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    mood_score integer,
    work_value numeric,
    goal_at_completion numeric,
    duration_value numeric,
    duration_unit text,
    notes text
);

-- Subtask 1.3: Draft SQL for `todos` table
CREATE TABLE public.todos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    parent_todo_id uuid REFERENCES public.todos(id) ON DELETE CASCADE,
    description text NOT NULL,
    is_public boolean DEFAULT FALSE NOT NULL,
    is_completed boolean DEFAULT FALSE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);

-- Subtask 1.4: Draft SQL for `journal_entries` table
CREATE TABLE public.journal_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    entry_date date NOT NULL,
    content text,
    is_public boolean DEFAULT FALSE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    UNIQUE (user_id, entry_date)
);

-- Subtask 2.1: Draft SQL for RLS policies
-- Enable RLS for tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Policies for public.users table
CREATE POLICY "Users can view their own user data." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their own user data." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own user data." ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own user data." ON public.users FOR DELETE USING (auth.uid() = id);

-- Policies for public.habits table
CREATE POLICY "Users can view their own habits." ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habits." ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits." ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits." ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.habit_completions table
CREATE POLICY "Users can view their own habit completions." ON public.habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habit completions." ON public.habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habit completions." ON public.habit_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habit completions." ON public.habit_completions FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.todos table
CREATE POLICY "Users can view their own todos." ON public.todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own todos." ON public.todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos." ON public.todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos." ON public.todos FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.journal_entries table
CREATE POLICY "Users can view their own journal entries." ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own journal entries." ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries." ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries." ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);
