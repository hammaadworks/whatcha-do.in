# Story 1.4: Implement Default Username Generation at Signup and App Header

Status: ready-for-dev

## Story

As a new user/developer,
I want a unique username automatically generated for me upon signup and a reusable app header that displays a login button when I'm not authenticated,
so that I can have a seamless onboarding experience with a ready-to-use profile URL and a clear authentication status.

## Acceptance Criteria

1.  A Supabase Database Function is created that triggers on a new user insert into `auth.users`.
2.  The function extracts the local part of the new user's email (before the '@').
3.  The function checks if the extracted username already exists in `public.users`.
4.  If the username is unique, it is inserted into the `username` column for the new user.
5.  If the username is not unique, a random 3-digit number is appended, and this new username is inserted.
6.  A reusable `AppHeader` component is created at `components/layout/AppHeader.tsx`.
7.  The `AppHeader` component displays a "Login" button on the top left if the user is not authenticated.
8.  The `AppHeader` is integrated into the main application layout (`app/layout.tsx`).
9.  Navigating to a `/[username]` route where the username does not exist in the database renders the custom 404 page.

## Tasks / Subtasks

- [x] **Task 1: Create Supabase migration for username generation (AC: #1, #2, #3, #4, #5)**
  - [x] Subtask 1.1: Create a new SQL migration file in `supabase/migrations`.
  - [x] Subtask 1.2: Write a PostgreSQL function to handle unique username generation from the `new.email` record.
  - [x] Subtask 1.3: Write a trigger to execute the function after an insert on `auth.users`.
  - [x] Subtask 1.4: Apply the migration using `supabase db push`.
- [x] **Task 2: Create the `AppHeader` component (AC: #6, #7)**
  - [x] Subtask 2.1: Create the file `components/layout/AppHeader.tsx`.
  - [x] Subtask 2.2: Implement the component to use the `useAuth` hook to check the session.
  - [x] Subtask 2.3: Render a `Button` (e.g., `ShimmerButton`) with the text "Login" if no session exists. The button should link to the login page.
- [x] **Task 3: Integrate the `AppHeader` component (AC: #8)**
  - [x] Subtask 3.1: Read the existing `app/layout.tsx`.
  - [x] Subtask 3.2: Modify `app/layout.tsx` to import and render the `AppHeader` component within the main `body` tag, before the `main` content.
- [x] **Task 4: Implement username validation on profile page (AC: #9)**
  - [x] Subtask 4.1: In `app/[username]/page.tsx`, fetch user data from Supabase based on the `username` URL parameter.
  - [x] Subtask 4.2: If no user data is returned, call the `notFound()` function from `next/navigation` to trigger the 404 page.

## Dev Notes

- The username generation logic will be encapsulated in a PostgreSQL function and trigger for atomicity and security, as per the architecture.
- The `AppHeader` component must be a client component (`'use client'`) as it relies on the `useAuth` hook.
- The UI for the `AppHeader` should leverage existing `shadcn/ui` or `Aceternity UI` components to maintain visual consistency. A `ShimmerButton` is recommended for the login button.
- The check for a valid username on the `/[username]` page should be done on the server-side within the page component to prevent rendering a layout for an invalid user and to properly trigger the 404 page.
- **Files to create:** `components/layout/AppHeader.tsx`, `supabase/migrations/YYYYMMDDHHMMSS_add_username_generation_trigger.sql`
- **Files to modify:** `app/layout.tsx`, `app/[username]/page.tsx`

### Project Structure Notes

- The new `AppHeader` component will be placed in `components/layout/` to maintain the project's organization of layout-specific components.

### References

- [Source: `docs/epics.md#Story-1.4` (Username Generation)](../../epics.md#story-14-implement-default-username-generation-at-signup)
- [Source: `docs/architecture.md#Data-Architecture` (Database Functions)](../../architecture.md#data-architecture)
- [Source: `docs/PRD.md#Web-App-Specific-Requirements` (UI Libraries)](../../PRD.md#web-app-specific-requirements)

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/1-4-implement-default-username-generation-at-signup.context.xml`

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
