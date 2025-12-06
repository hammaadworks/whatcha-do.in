CREATE TABLE public.targets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    target_date date, -- NULL for Future/Backlog, YYYY-MM-01 for Specific Month
    data jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (user_id, target_date)
);

-- Enable RLS
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own targets" ON public.targets
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own targets" ON public.targets
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own targets" ON public.targets
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own targets" ON public.targets
    FOR DELETE USING ((select auth.uid()) = user_id);

-- Dev Mode Policy
CREATE POLICY "Dev mode user can access all targets" ON public.targets
    FOR ALL USING (public.is_dev_mode()) WITH CHECK (public.is_dev_mode());

-- Trigger for updated_at
CREATE TRIGGER update_targets_updated_at
    BEFORE UPDATE ON public.targets
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
