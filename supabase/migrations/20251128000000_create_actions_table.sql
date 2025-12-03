
-- Drop the existing todos table if it exists (this replaces the old relational structure)
DROP TABLE IF EXISTS public.todos CASCADE;

-- Create the new 'actions' table for document-oriented storage (unlimited nesting)
CREATE TABLE public.actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    data jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (user_id) -- Enforces one Action Tree per user (root container pattern)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

-- Policies for public.actions
-- 1. Users can view their own action tree
CREATE POLICY "Users can view their own action tree"
ON public.actions FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can create their own action tree (usually just one row per user)
CREATE POLICY "Users can create their own action tree"
ON public.actions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own action tree
CREATE POLICY "Users can update their own action tree"
ON public.actions FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Users can delete their own action tree
CREATE POLICY "Users can delete their own action tree"
ON public.actions FOR DELETE
USING (auth.uid() = user_id);


-- Dev Mode Policy (Temporary bypass for local development)
-- This allows the hardcoded mock user ID to bypass RLS if 'is_dev_mode()' is true.
-- NOTE: In production, is_dev_mode() should return false or be removed.

CREATE POLICY "Dev mode user can access all actions"
ON public.actions
FOR ALL
USING (
  public.is_dev_mode() AND 
  (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e')
)
WITH CHECK (
  public.is_dev_mode() AND 
  (current_setting('request.jwt.claims', true)::jsonb->>'sub' = '68be1abf-ecbe-47a7-bafb-46be273a2e')
);

-- Trigger to update 'updated_at' automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_actions_updated_at
    BEFORE UPDATE ON public.actions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
