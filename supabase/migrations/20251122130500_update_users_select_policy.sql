-- Drop the existing restrictive SELECT RLS policy on public.users
DROP POLICY IF EXISTS "Users can view their own user data." ON public.users;

-- Create a new SELECT RLS policy on public.users that allows all users to read.
-- This relies on the application layer to filter specific columns (e.g., username, bio)
-- for public consumption, preventing sensitive data like email from being exposed.
CREATE POLICY "Allow all users to read public.users (application filters columns)"
ON public.users FOR SELECT
USING (true);
