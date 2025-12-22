-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.actions (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL UNIQUE,
data jsonb NOT NULL DEFAULT '[]'::jsonb,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT actions_pkey PRIMARY KEY (id),
CONSTRAINT actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.habit_identities (
habit_id uuid NOT NULL,
identity_id uuid NOT NULL,
user_id uuid NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT habit_identities_pkey PRIMARY KEY (habit_id, identity_id),
CONSTRAINT habit_identities_identity_id_fkey FOREIGN KEY (identity_id) REFERENCES public.identities(id),
CONSTRAINT habit_identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
CONSTRAINT habit_identities_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(id)
);
CREATE TABLE public.habits (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
user_id uuid NOT NULL,
name text NOT NULL,
is_public boolean NOT NULL DEFAULT false,
streak integer NOT NULL DEFAULT 0,
longest_streak integer NOT NULL DEFAULT 0,
goal_value numeric,
goal_unit text,
habit_state text NOT NULL DEFAULT 'lively'::text,
junked_at timestamp with time zone,
last_non_today_streak integer NOT NULL DEFAULT 0,
last_non_today_state text CHECK (last_non_today_state = ANY (ARRAY['yesterday'::text, 'lively'::text, 'junked'::text])),
last_completed_date date,
last_resolved_date date,
CONSTRAINT habits_pkey PRIMARY KEY (id),
CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.identities (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
title text NOT NULL,
description text,
is_public boolean NOT NULL DEFAULT false,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT identities_pkey PRIMARY KEY (id),
CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.journal_entries (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
user_id uuid NOT NULL,
entry_date date NOT NULL,
content text,
is_public boolean NOT NULL DEFAULT false,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone,
activity_log jsonb NOT NULL DEFAULT '[]'::jsonb,
CONSTRAINT journal_entries_pkey PRIMARY KEY (id),
CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.targets (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL,
target_date date,
data jsonb NOT NULL DEFAULT '[]'::jsonb,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone NOT NULL DEFAULT now(),
CONSTRAINT targets_pkey PRIMARY KEY (id),
CONSTRAINT targets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
id uuid NOT NULL,
bio text,
timezone text NOT NULL DEFAULT 'UTC'::text,
grace_screen_shown_for_date date,
created_at timestamp with time zone NOT NULL DEFAULT now(),
updated_at timestamp with time zone,
username text NOT NULL UNIQUE,
motivations jsonb,
CONSTRAINT users_pkey PRIMARY KEY (id),
CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);