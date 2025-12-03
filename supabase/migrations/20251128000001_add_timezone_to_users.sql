
-- Add timezone column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC' NOT NULL;

-- Add comment to explain the column usage
COMMENT ON COLUMN public.users.timezone IS 'User preferred timezone (e.g. America/New_York) for calculating daily habit deadlines.';
