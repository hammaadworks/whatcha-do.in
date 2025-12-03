
-- Optimize RLS policies by wrapping auth.uid() in a subquery to prevent per-row re-evaluation.

-- 1. USERS Table
DROP POLICY IF EXISTS "Users can view their own user data." ON public.users;
DROP POLICY IF EXISTS "Users can create their own user data." ON public.users;
DROP POLICY IF EXISTS "Users can update their own user data." ON public.users;
DROP POLICY IF EXISTS "Users can delete their own user data." ON public.users;

CREATE POLICY "Users can view their own user data." ON public.users FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can create their own user data." ON public.users FOR INSERT WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Users can update their own user data." ON public.users FOR UPDATE USING ((select auth.uid()) = id);
CREATE POLICY "Users can delete their own user data." ON public.users FOR DELETE USING ((select auth.uid()) = id);

-- 2. HABITS Table
DROP POLICY IF EXISTS "Users can view their own habits." ON public.habits;
DROP POLICY IF EXISTS "Users can create their own habits." ON public.habits;
DROP POLICY IF EXISTS "Users can update their own habits." ON public.habits;
DROP POLICY IF EXISTS "Users can delete their own habits." ON public.habits;

CREATE POLICY "Users can view their own habits." ON public.habits FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own habits." ON public.habits FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own habits." ON public.habits FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own habits." ON public.habits FOR DELETE USING ((select auth.uid()) = user_id);

-- 3. HABIT COMPLETIONS Table
DROP POLICY IF EXISTS "Users can view their own habit completions." ON public.habit_completions;
DROP POLICY IF EXISTS "Users can create their own habit completions." ON public.habit_completions;
DROP POLICY IF EXISTS "Users can update their own habit completions." ON public.habit_completions;
DROP POLICY IF EXISTS "Users can delete their own habit completions." ON public.habit_completions;

CREATE POLICY "Users can view their own habit completions." ON public.habit_completions FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own habit completions." ON public.habit_completions FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own habit completions." ON public.habit_completions FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own habit completions." ON public.habit_completions FOR DELETE USING ((select auth.uid()) = user_id);

-- 4. ACTIONS Table (Replacing Todos)
DROP POLICY IF EXISTS "Users can view their own action tree" ON public.actions;
DROP POLICY IF EXISTS "Users can create their own action tree" ON public.actions;
DROP POLICY IF EXISTS "Users can update their own action tree" ON public.actions;
DROP POLICY IF EXISTS "Users can delete their own action tree" ON public.actions;

CREATE POLICY "Users can view their own action tree" ON public.actions FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own action tree" ON public.actions FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own action tree" ON public.actions FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own action tree" ON public.actions FOR DELETE USING ((select auth.uid()) = user_id);

-- 5. JOURNAL ENTRIES Table
DROP POLICY IF EXISTS "Users can view their own journal entries." ON public.journal_entries;
DROP POLICY IF EXISTS "Users can create their own journal entries." ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries." ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries." ON public.journal_entries;

CREATE POLICY "Users can view their own journal entries." ON public.journal_entries FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create their own journal entries." ON public.journal_entries FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own journal entries." ON public.journal_entries FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own journal entries." ON public.journal_entries FOR DELETE USING ((select auth.uid()) = user_id);
