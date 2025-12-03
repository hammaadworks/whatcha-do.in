-- Secure public.users by removing sensitive 'email' column and cleaning up RLS.

-- 1. Update trigger function to stop inserting email into public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    username_base TEXT;
    proposed_username TEXT;
    random_suffix TEXT;
    is_unique BOOLEAN;
BEGIN
    -- Extract the local part of the email
    username_base := LOWER(SPLIT_PART(NEW.email, '@', 1));
    proposed_username := username_base;

    -- Loop to ensure username uniqueness
    LOOP
        SELECT public.check_username_uniqueness(proposed_username) INTO is_unique;
        IF is_unique THEN
            EXIT;
        END IF;

        -- If not unique, append a random 3-digit number
        random_suffix := LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        proposed_username := username_base || '_' || random_suffix;
    END LOOP;

    -- Insert into public.users WITHOUT email
    INSERT INTO public.users (id, username)
    VALUES (NEW.id, proposed_username);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the 'email' column from public.users
-- We use IF EXISTS to be safe, though we know it exists.
ALTER TABLE public.users DROP COLUMN IF EXISTS email;

-- 3. Clean up RLS Policies
-- We want public.users to be:
-- - Readable by everyone (for public profiles)
-- - Editable only by the owner
-- - Insertable only by trigger (or owner if needed, but trigger handles it)

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Users can view their own user data." ON public.users;
DROP POLICY IF EXISTS "Allow all users to read public.users (application filters columns)" ON public.users;

-- Re-create policies
-- A. Public Read Access
CREATE POLICY "Public profiles are viewable by everyone"
ON public.users FOR SELECT
USING (true);

-- B. Owner Write Access (Update)
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING ((select auth.uid()) = id);

-- C. Owner Insert Access (if needed manually, though trigger handles it)
CREATE POLICY "Users can insert their own profile"
ON public.users FOR INSERT
WITH CHECK ((select auth.uid()) = id);

-- D. Owner Delete Access
CREATE POLICY "Users can delete their own profile"
ON public.users FOR DELETE
USING ((select auth.uid()) = id);
