# Story 0.1: DB Setup

Status: done

## Story

As a developer,
I want to create and commit the initial database schema migrations for all core entities,
so that the database is ready for application development.

## Acceptance Criteria

1.  A new Supabase migration file is created in the `supabase/migrations` directory.
2.  The migration includes `CREATE TABLE` statements for `users`, `habits`, `habit_completions`, `todos`, and `journal_entries`.
3.  All table and column names adhere to the `snake_case` naming convention specified in the architecture.
4.  Primary keys, foreign keys, and appropriate constraints (e.g., `NOT NULL`) are defined for all tables.
5.  Row Level Security (RLS) is enabled for all tables containing user-specific data.
6.  The migration successfully runs without errors in a local Supabase environment.

## Tasks / Subtasks

- [x] Task 1 (AC: #1, #2, #3, #4)
  - [x] Subtask 1.1: Draft the SQL for the `users` table, including profile information.
  - [x] Subtask 1.2: Draft the SQL for the `habits` and `habit_completions` tables.
  - [x] Subtask 1.3: Draft the SQL for the `todos` table, including the self-referencing `parent_todo_id`.
  - [x] Subtask 1.4: Draft the SQL for the `journal_entries` table.
- [x] Task 2 (AC: #5)
  - [x] Subtask 2.1: Define default RLS policies for all user-data tables, ensuring users can only access their own data.
- [x] Task 3 (AC: #6)
  - [x] Subtask 3.1: Create a new migration using the Supabase CLI.
  - [x] Subtask 3.2: Apply the migration to the local development database to verify it.

## Dev Notes

This story is foundational and has no UI component. The primary focus is on correctly implementing the data models defined in the architecture document. The developer agent must read the `Data Architecture` section of `docs/architecture.md` to get the precise schema details for each table.

### Learnings from Previous Story

This is the first story in the epic. No predecessor context is available.

### Project Structure Notes

- The migration file must be created in the `supabase/migrations/` directory as specified in the project structure.
- No other files should be modified in this story.

### References

- [Source: docs/architecture.md#Data-Architecture]
- [Source: docs/epics.md#Epic-1-User--Profile-Management]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/0-1-db-setup.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

#### Subtask 1.1: Draft SQL for `users` table
```sql
CREATE TABLE public.users (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    bio text,
    timezone text NOT NULL DEFAULT 'UTC',
    grace_screen_shown_for_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);
```

#### Subtask 1.2: Draft SQL for `habits` and `habit_completions` tables
```sql
CREATE TABLE public.habits (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    is_public boolean DEFAULT FALSE NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    last_streak integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    goal_value numeric,
    goal_unit text,
    last_recorded_mood integer,
    last_recorded_work_value numeric,
    last_recorded_work_unit text,
    pile_state text,
    junked_at timestamp with time zone,
    updated_at timestamp with time zone
);

CREATE TABLE public.habit_completions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id uuid REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    mood_score integer,
    work_value numeric,
    goal_at_completion numeric,
    duration_value numeric,
    duration_unit text,
    notes text
);
```

#### Subtask 1.3: Draft SQL for `todos` table
```sql
CREATE TABLE public.todos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    parent_todo_id uuid REFERENCES public.todos(id) ON DELETE CASCADE,
    description text NOT NULL,
    is_public boolean DEFAULT FALSE NOT NULL,
    is_completed boolean DEFAULT FALSE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);
```

#### Subtask 1.4: Draft SQL for `journal_entries` table
```sql
CREATE TABLE public.journal_entries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    entry_date date NOT NULL,
    content text,
    is_public boolean DEFAULT FALSE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    UNIQUE (user_id, entry_date)
);
```

#### Subtask 2.1: Draft SQL for RLS policies
```sql
-- Enable RLS for tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Policies for public.users table
CREATE POLICY "Users can view their own user data." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their own user data." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own user data." ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own user data." ON public.users FOR DELETE USING (auth.uid() = id);

-- Policies for public.habits table
CREATE POLICY "Users can view their own habits." ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habits." ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits." ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits." ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.habit_completions table
CREATE POLICY "Users can view their own habit completions." ON public.habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habit completions." ON public.habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habit completions." ON public.habit_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habit completions." ON public.habit_completions FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.todos table
CREATE POLICY "Users can view their own todos." ON public.todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own todos." ON public.todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos." ON public.todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos." ON public.todos FOR DELETE USING (auth.uid() = user_id);

-- Policies for public.journal_entries table
CREATE POLICY "Users can view their own journal entries." ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own journal entries." ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries." ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries." ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);
```

### Completion Notes
**Completed:** 2025-11-13
**Definition of Done:** All acceptance criteria met, code reviewed, tests passing

### Completion Notes List
- Implemented initial database schema for `users`, `habits`, `habit_completions`, `todos`, and `journal_entries` tables.
- Defined primary keys, foreign keys, and necessary constraints.
- Enabled Row Level Security (RLS) for all user-data tables with policies restricting access to owner's data.
- Created a new Supabase migration file and successfully applied it to the local development database.
- Resolved `uuid_generate_v4()` function not found error by adding `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` and `SET search_path = public, extensions;` to the migration.

### File List
- supabase/migrations/20251113093152_initial_schema_setup.sql

## Senior Developer Review (AI)

**Reviewer:** hammaadworks
**Date:** 2025-11-13
**Outcome:** APPROVE
**Summary:** The story "0.1: DB Setup" has been thoroughly implemented. All acceptance criteria are met, and all completed tasks have been verified. The database schema for core entities (`users`, `habits`, `habit_completions`, `todos`, `journal_entries`) is correctly defined with appropriate primary keys, foreign keys, and constraints. Row Level Security (RLS) policies are correctly applied to ensure data isolation. The migration was successfully created and applied to the local Supabase environment.

### Key Findings
No significant findings (High/Medium/Low severity) were identified during this review.

### Acceptance Criteria Coverage
| AC# | Description | Status | Evidence |
|---|---|---|---|
| 1 | A new Supabase migration file is created in the `supabase/migrations` directory. | IMPLEMENTED | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| 2 | The migration includes `CREATE TABLE` statements for `users`, `habits`, `habit_completions`, `todos`, and `journal_entries`. | IMPLEMENTED | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| 3 | All table and column names adhere to the `snake_case` naming convention specified in the architecture. | IMPLEMENTED | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| 4 | Primary keys, foreign keys, and appropriate constraints (e.g., `NOT NULL`) are defined for all tables. | IMPLEMENTED | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| 5 | Row Level Security (RLS) is enabled for all tables containing user-specific data. | IMPLEMENTED | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| 6 | The migration successfully runs without errors in a local Supabase environment. | IMPLEMENTED | `supabase db push` command output |
**Summary:** 6 of 6 acceptance criteria fully implemented.

### Task Completion Validation
| Task | Marked As | Verified As | Evidence |
|---|---|---|---|
| Task 1 (AC: #1, #2, #3, #4) | [x] | VERIFIED COMPLETE | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| Subtask 1.1: Draft the SQL for the `users` table, including profile information. | [x] | VERIFIED COMPLETE | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| Subtask 1.2: Draft the SQL for the `habits` and `habit_completions` tables. | [x] | VERIFIED COMPLETE | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| Subtask 1.3: Draft the SQL for the `todos` table, including the self-referencing `parent_todo_id`. | [x] | VERIFIED COMPLETE | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| Subtask 1.4: Draft the SQL for the `journal_entries` table. | [x] | VERIFIED COMPLETE | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| Task 2 (AC: #5) | [x] | VERIFIED COMPLETE | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| Subtask 2.1: Define default RLS policies for all user-data tables, ensuring users can only access their own data. | [x] | VERIFIED COMPLETE | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| Task 3 (AC: #6) | [x] | VERIFIED COMPLETE | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| Subtask 3.1: Create a new migration using the Supabase CLI. | [x] | VERIFIED COMPLETE | `supabase/migrations/20251113093152_initial_schema_setup.sql` |
| Subtask 3.2: Apply the migration to the local development database to verify it. | [x] | VERIFIED COMPLETE | `supabase db push` command output |
**Summary:** 10 of 10 completed tasks verified, 0 questionable, 0 falsely marked complete.

### Test Coverage and Gaps
As per the story's testing strategy, the primary validation was the successful application of the migration to a local Supabase instance. No unit or E2E tests were required for this foundational story.

### Architectural Alignment
The implementation fully aligns with the architectural decisions and consistency rules outlined in `docs/architecture.md`, particularly regarding data architecture, naming conventions, and the use of Supabase for backend services and RLS.

### Security Notes
RLS policies are correctly implemented using `auth.uid()`, providing robust data isolation for user-specific data. No security vulnerabilities were identified in the schema definition.

### Best-Practices and References
- PostgreSQL best practices for schema design and constraints.
- Supabase RLS best practices.
- Use of `uuid-ossp` extension for UUID generation.

### Action Items
**Code Changes Required:**
- None.

**Advisory Notes:**
- Note: No Epic Tech Spec was found for Epic 0. This did not impact the review of this foundational story, but it is noted for future reference.

