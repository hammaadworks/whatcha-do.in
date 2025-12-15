-- Migration to recreate habits table and drop habit_completions

-- 1. Drop the habit_completions table
DROP TABLE IF EXISTS public.habit_completions;

-- 2. Drop the existing habits table (and cascade to remove dependent FKs like in habit_identities)
DROP TABLE IF EXISTS public.habits CASCADE;

-- 3. Create the new habits table
CREATE TABLE public.habits (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  name text not null,
  is_public boolean not null default false,
  streak integer not null default 0,
  longest_streak integer not null default 0,
  goal_value numeric null,
  goal_unit text null,
  habit_state text not null default 'lively'::text,
  junked_at timestamp with time zone null,
  last_non_today_streak integer not null default 0,
  last_non_today_state text null,
  last_completed_date date null,
  last_resolved_date date null,
  constraint habits_pkey primary key (id),
  constraint habits_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint valid_last_non_today_state check (
    (
      last_non_today_state = any (
        array['yesterday'::text, 'lively'::text, 'junked'::text]
      )
    )
  )
) TABLESPACE pg_default;

-- 4. Enable Row Level Security
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies

-- Policy: Users can view their own habits or any public habits
CREATE POLICY "Users can view own or public habits" ON public.habits
    FOR SELECT USING (
        (auth.uid() = user_id) OR (is_public = true)
    );

-- Policy: Users can insert their own habits
CREATE POLICY "Users can insert own habits" ON public.habits
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Policy: Users can update their own habits
CREATE POLICY "Users can update own habits" ON public.habits
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Policy: Users can delete their own habits
CREATE POLICY "Users can delete own habits" ON public.habits
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Policy: Dev mode access (optional, consistent with other tables)
CREATE POLICY "Dev mode user can access all habits" ON public.habits
    FOR ALL USING (public.is_dev_mode()) WITH CHECK (public.is_dev_mode());


-- 6. Restore Foreign Key in habit_identities (if habit_identities table exists)
-- We check if the table exists first to avoid errors if it was manually dropped.
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'habit_identities') THEN
        -- Re-add the foreign key constraint if it doesn't exist
        -- Note: Dropping habits CASCADE usually removes the constraint.
        ALTER TABLE public.habit_identities
            ADD CONSTRAINT habit_identities_habit_id_fkey
            FOREIGN KEY (habit_id)
            REFERENCES public.habits(id)
            ON DELETE CASCADE;
    END IF;
END $$;
