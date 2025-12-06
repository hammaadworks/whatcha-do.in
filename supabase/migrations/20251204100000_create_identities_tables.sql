CREATE TABLE public.identities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    is_public boolean DEFAULT FALSE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.identities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own identities" ON public.identities
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own identities" ON public.identities
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own identities" ON public.identities
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own identities" ON public.identities
    FOR DELETE USING ((select auth.uid()) = user_id);

-- Dev Mode Policy
CREATE POLICY "Dev mode user can access all identities" ON public.identities
    FOR ALL USING (public.is_dev_mode()) WITH CHECK (public.is_dev_mode());

-- Trigger for updated_at
CREATE TRIGGER update_identities_updated_at
    BEFORE UPDATE ON public.identities
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- Habit Identities (Join Table)
CREATE TABLE public.habit_identities (
    habit_id uuid REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    identity_id uuid REFERENCES public.identities(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Denormalized for easier RLS
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (habit_id, identity_id)
);

-- Enable RLS
ALTER TABLE public.habit_identities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own habit links" ON public.habit_identities
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own habit links" ON public.habit_identities
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own habit links" ON public.habit_identities
    FOR DELETE USING ((select auth.uid()) = user_id);

-- Dev Mode Policy
CREATE POLICY "Dev mode user can access all habit links" ON public.habit_identities
    FOR ALL USING (public.is_dev_mode()) WITH CHECK (public.is_dev_mode());
