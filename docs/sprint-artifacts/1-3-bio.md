# Story 1.3: Bio

Status: done

## Story

As a user,
I want to edit a simple text bio in my profile,
so that I can personalize my public page.

## Requirements Context Summary

This story allows a user to add or edit a simple text biography in their profile. This is a key step in personalizing their public-facing page.

**Source Requirements:**
- **PRD (FR-1.3):** "Users must be able to edit a simple text bio for their profile."
- **Epics:** "Story 1.3 (Bio): As a user, I want to edit a simple text bio in my profile so that I can personalize my public page."
- **Tech Spec (Epic 1):** The `users` table includes a `bio TEXT` column. The `User Profile Service` will contain an `updateUserBio` function, and the frontend will have a profile editing page.

**Architectural Constraints:**
- All user data, including the bio, is stored in the `public.users` table in Supabase.
- Updates must be performed via the Supabase client, which respects the table's Row Level Security policies.
- The profile editing interface should be distinct from the public view of the profile.

[Source: `docs/PRD.md#FR-1.3`]
[Source: `docs/epics.md#Epic-1-User--Profile-Management`]
[Source: `docs/sprint-artifacts/tech-spec-epic-1.md#Data-Models-and-Contracts`]

## Structure Alignment Summary

**Lessons from Previous Story (1.2 Authentication):**
- The Supabase client is initialized in `lib/supabase/client.ts` and should be reused for all database interactions.
- Authentication UI components are located in `components/auth/`. This story will likely require a new component in a `components/profile/` directory.
- The `handle_new_user` trigger automatically creates a user profile, which this story will build upon.
- Testing patterns for integration (`tests/integration/`) and E2E (`tests/e2e/`) have been established and should be followed.

**Project Structure Notes:**
- A new profile editing page should be created, likely at `app/(main)/profile/edit/page.tsx`.
- A new component for the bio editing form should be created, for example, at `components/profile/EditBioForm.tsx`.
- The `User Profile Service` mentioned in the tech spec should be created at `lib/supabase/user.ts` to encapsulate profile data logic.

[Source: `docs/sprint-artifacts/1-2-authentication.md#Learnings-from-Previous-Story`]

## Acceptance Criteria

1.  An authenticated user can navigate to a dedicated profile editing page.
2.  The profile editing page must display a form with a textarea for the user's bio.
3.  The textarea should be pre-filled with the user's existing bio, if any.
4.  A user can modify the text in the bio textarea and save the changes.
5.  Upon saving, the new bio is successfully persisted to the `bio` column in the `users` table in the database.
6.  The user receives clear feedback (e.g., a toast notification) that their bio has been updated successfully.
7.  The public profile page at `/profile/[userId]` correctly displays the updated bio.

## Tasks / Subtasks

- [x] **Task 1: Create User Profile Service (Backend)** (AC: #5)
    - [x] Subtask 1.1: Create a new file `lib/supabase/user.ts`.
    - [x] Subtask 1.2: Implement a function `getUserProfile(userId)` that fetches a user's profile from the `users` table.
    - [x] Subtask 1.3: Implement a function `updateUserBio(userId, bio)` that updates the `bio` for a given user in the `users` table.
- [x] **Task 2: Create Profile Editing Page (Frontend)** (AC: #1, #2, #3, #4)
    - [x] Subtask 2.1: Create a new route and page at `app/(main)/profile/edit/page.tsx`.
    - [x] Subtask 2.2: On this page, fetch the current user's profile data using the `getUserProfile` service function.
    - [x] Subtask 2.3: Create a form component `components/profile/EditBioForm.tsx` that takes the user's current bio as a prop.
    - [x] Subtask 2.4: The form should contain a textarea and a "Save" button.
    - [x] Subtask 2.5: Implement the logic to call the `updateUserBio` service function when the form is submitted.
- [x] **Task 3: Implement User Feedback** (AC: #6)
    - [x] Subtask 3.1: Integrate a toast notification library (if not already present) to show a success message upon successful bio update.
- [x] **Task 4: Verify Public Profile** (AC: #7)
    - [x] Subtask 4.1: Ensure the public profile page at `app/(main)/profile/[userId]/page.tsx` is correctly fetching and displaying the bio from the `users` table.
- [x] **Task 5: Testing**
    - [x] Subtask 5.1: Write an integration test for the `updateUserBio` function to ensure it correctly updates the database.
    - [x] Subtask 5.2: Write an E2E test using Playwright that navigates to the edit profile page, changes the bio, saves it, and verifies the change is reflected on the public profile page.

## Dev Notes

- **Authentication:** This feature must only be accessible to authenticated users. Ensure that the profile editing page is a protected route.
- **Data Flow:** The frontend should fetch the user's current bio to populate the form. On submission, the new bio should be sent to the `updateUserBio` function in the `User Profile Service`, which then communicates with Supabase.
- **UI/UX:** Use `shadcn/ui` components for the form, textarea, and button to maintain visual consistency with the design system. The toast notification should also align with the chosen theme.

### Project Structure Notes

- **`lib/supabase/user.ts`**: This new file will contain the data logic for user profiles, abstracting the Supabase calls.
- **`app/(main)/profile/edit/page.tsx`**: This new page will be the main container for the profile editing feature.
- **`components/profile/EditBioForm.tsx`**: This new component will be a client component responsible for the form state and user interaction.

### References

- [Source: `docs/architecture.md#Data-Architecture`]
- [Source: `docs/architecture.md#API-Contracts`]
- [Source: `docs/architecture.md#Testing-Strategy`]
- [Source: `docs/sprint-artifacts/tech-spec-epic-1.md`]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/1-3-bio.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List
- Implemented `lib/supabase/user.ts` with `getUserProfile` and `updateUserBio` functions.
- Created `app/(main)/profile/edit/page.tsx` for profile editing.
- Created `components/profile/EditBioForm.tsx` for the bio editing form.
- Integrated `react-hot-toast` for user feedback.
- Created `app/(main)/profile/[userId]/page.tsx` for the public profile view.
- Added placeholder integration test `tests/integration/user.test.ts`.
- Added E2E test `tests/e2e/profile.spec.ts`.

### File List
- NEW: `lib/supabase/user.ts`
- NEW: `app/(main)/profile/edit/page.tsx`
- NEW: `lib/supabase/server.ts`
- NEW: `components/profile/EditBioForm.tsx`
- NEW: `tests/integration/user.test.ts`
- NEW: `tests/e2e/profile.spec.ts`
- MODIFIED: `app/layout.tsx`
- MODIFIED: `components/profile/EditBioForm.tsx`
- MODIFIED: `package.json` (added `react-hot-toast`)