ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_entry_date_key;

ALTER TABLE public.journal_entries ADD CONSTRAINT journal_entries_unique_user_date_public UNIQUE (user_id, entry_date, is_public);
