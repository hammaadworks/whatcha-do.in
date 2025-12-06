DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'activity_log') THEN
        ALTER TABLE public.journal_entries
        ADD COLUMN activity_log JSONB NOT NULL DEFAULT '[]'::JSONB;

        COMMENT ON COLUMN public.journal_entries.activity_log IS 'Stores structured, read-only activity logs (actions, habits, targets) for the day.';
    END IF;
END
$$;