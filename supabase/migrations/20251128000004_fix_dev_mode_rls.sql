
-- Update Dev Mode policies to be permissive for ANON role (since we can't sign a real JWT in mock mode)
-- This relies purely on the 'is_dev_mode()' function returning TRUE.

-- 1. ACTIONS
DROP POLICY IF EXISTS "Dev mode user can access all actions" ON public.actions;
CREATE POLICY "Dev mode user can access all actions"
ON public.actions FOR ALL
USING (public.is_dev_mode())
WITH CHECK (public.is_dev_mode());

-- 2. USERS
DROP POLICY IF EXISTS "Dev mode user can access all data" ON public.users;
CREATE POLICY "Dev mode user can access all data"
ON public.users FOR ALL
USING (public.is_dev_mode())
WITH CHECK (public.is_dev_mode());

-- 3. HABITS
DROP POLICY IF EXISTS "Dev mode user can access all habits" ON public.habits;
CREATE POLICY "Dev mode user can access all habits"
ON public.habits FOR ALL
USING (public.is_dev_mode())
WITH CHECK (public.is_dev_mode());

-- 4. HABIT COMPLETIONS
DROP POLICY IF EXISTS "Dev mode user can access all habit completions" ON public.habit_completions;
CREATE POLICY "Dev mode user can access all habit completions"
ON public.habit_completions FOR ALL
USING (public.is_dev_mode())
WITH CHECK (public.is_dev_mode());

-- 5. TODOS (REMOVED - Table dropped)

-- 6. JOURNAL ENTRIES
DROP POLICY IF EXISTS "Dev mode user can access all journal entries" ON public.journal_entries;
CREATE POLICY "Dev mode user can access all journal entries"
ON public.journal_entries FOR ALL
USING (public.is_dev_mode())
WITH CHECK (public.is_dev_mode());
