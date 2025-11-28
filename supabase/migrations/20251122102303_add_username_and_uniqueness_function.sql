-- Add username column to users table, allowing nulls initially
ALTER TABLE public.users
ADD COLUMN username TEXT;

-- Set a default username for existing users, especially the test user
UPDATE public.users
SET username = 'hammaadworks'
WHERE email = 'hammaadworks@gmail.com';

-- If there are other users, you might want to set a default for them too, e.g., using their user ID
UPDATE public.users
SET username = id::text
WHERE username IS NULL;

-- Now, add the UNIQUE constraint
ALTER TABLE public.users
ADD CONSTRAINT users_username_key UNIQUE (username);

-- And make the column NOT NULL
ALTER TABLE public.users
ALTER COLUMN username SET NOT NULL;

-- Create a function to check username uniqueness and check against reserved slugs
CREATE OR REPLACE FUNCTION public.check_username_uniqueness(p_username TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_unique BOOLEAN;
  is_reserved BOOLEAN;
BEGIN
  -- Check for uniqueness
  SELECT NOT EXISTS (
    SELECT 1 FROM public.users WHERE username = p_username
  ) INTO is_unique;

  -- Check against reserved slugs
  SELECT p_username IN ('auth', 'dashboard', 'journal', 'grace-period', 'api', 'profile', 'not-found') INTO is_reserved;

  RETURN is_unique AND NOT is_reserved;
END;
$$ LANGUAGE plpgsql;

-- Function to check if dev mode is enabled
CREATE OR REPLACE FUNCTION public.is_dev_mode()
RETURNS BOOLEAN AS $$
BEGIN
  -- This is a placeholder for a more secure dev mode check.
  -- In a real production environment, this should be handled with more care.
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- A permissive RLS policy for development, allowing the mock user to bypass RLS
-- This policy should be disabled or removed in production.
CREATE POLICY "Dev mode user can access all data"
ON public.users
FOR ALL
USING (public.is_dev_mode() AND (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e'))
WITH CHECK (public.is_dev_mode() AND (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e'));

CREATE POLICY "Dev mode user can access all habits"
ON public.habits
FOR ALL
USING (public.is_dev_mode() AND (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e'))
WITH CHECK (public.is_dev_mode() AND (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e'));

CREATE POLICY "Dev mode user can access all habit completions"
ON public.habit_completions
FOR ALL
USING (public.is_dev_mode() AND (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e'))
WITH CHECK (public.is_dev_mode() AND (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e'));

CREATE POLICY "Dev mode user can access all todos"
ON public.todos
FOR ALL
USING (public.is_dev_mode() AND (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e'))
WITH CHECK (public.is_dev_mode() AND (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e'));

CREATE POLICY "Dev mode user can access all journal entries"
ON public.journal_entries
FOR ALL
USING (public.is_dev_mode() AND (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e'))
WITH CHECK (public.is_dev_mode() AND (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e'));