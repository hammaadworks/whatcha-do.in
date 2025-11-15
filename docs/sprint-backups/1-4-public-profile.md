# Story 1.4: Public Profile

Status: done

## Story

As a user,
I want a shareable public profile page that displays my bio, public habits, public todos, and public journal entries,
so that I can share my progress and journey with others.

## Requirements Context Summary

This story focuses on creating the public-facing profile page for a user. This page will be shareable and will display all of the user's public information in one place.

**Source Requirements:**
- **PRD (FR-1.4):** "Each user must have a public profile page accessible via a shareable, unique URL."
- **PRD (FR-1.5):** "The public profile page must display the user's bio, all public habits, all public todos, and the public journal."
- **Epics:** "Story 1.4 (Public Profile): As a user, I want a shareable public profile page that displays my bio, public habits, public todos, and public journal entries so that I can share my progress and journey with others."
- **Tech Spec (Epic 1):** A `Public Profile Page` will be created at `app/(main)/profile/[userId]/page.tsx`.

**Architectural Constraints:**
- The public profile page should be rendered using Next.js SSR or SSG to ensure fast load times (NFR-1.1).
- Data fetching must respect Row Level Security policies to only show public data.

[Source: `docs/PRD.md#FR-1.4`]
[Source: `docs/PRD.md#FR-1.5`]
[Source: `docs/epics.md#Epic-1-User--Profile-Management`]
[Source: `docs/sprint-artifacts/tech-spec-epic-1.md#Detailed-Design`]

## Structure Alignment Summary

**Lessons from Previous Story (1.3 Bio):**
- The previous story file (`1-3-bio.md`) was found to be incomplete, so no specific learnings could be extracted. This story will proceed based on the available architecture and PRD documents.

**Project Structure Notes:**
- The public profile page will be created at `app/(main)/profile/[userId]/page.tsx` as specified in the tech spec.
- This page will be a server component to allow for SSR/SSG.
- Data fetching logic should be encapsulated in the `lib/supabase/user.ts` service, with new functions to get public habits, todos, and journal entries for a user.

## Acceptance Criteria

1.  A public profile page is accessible at a URL structure of `/profile/[userId]`.
2.  The page correctly fetches and displays the user's bio.
3.  The page correctly fetches and displays a list of the user's public habits.
4.  The page correctly fetches and displays a list of the user's public todos.
5.  The page correctly fetches and displays the user's public journal entries.
6.  If a user has no public items of a certain type (e.g., no public habits), a message indicating this is shown instead of an empty list.
7.  The page is server-side rendered (SSR) or statically generated (SSG) to ensure fast initial load times.
8.  Data fetching for the page must only retrieve public data and be protected by Row Level Security.

## Tasks / Subtasks

- [x] **Task 1: Extend User Profile Service (Backend)** (AC: #2, #3, #4, #5, #8)
    - [x] Subtask 1.1: In `lib/supabase/user.ts`, create a function `getPublicProfileData(userId)` that fetches the user's bio and all public habits, todos, and journal entries.
    - [x] Subtask 1.2: Ensure the Supabase queries in this function filter for items where `is_public = true`.
- [x] **Task 2: Create Public Profile Page (Frontend)** (AC: #1, #2, #3, #4, #5, #6, #7)
    - [x] Subtask 2.1: Create the dynamic route and page at `app/(main)/profile/[userId]/page.tsx`.
    - [x] Subtask 2.2: This page should be a server component that fetches the public profile data using the `getPublicProfileData` function.
    - [x] Subtask 2.3: Create a component `components/profile/PublicProfileView.tsx` to display the profile data passed from the page.
    - [x] Subtask 2.4: Implement the UI to display the bio.
    - [x] Subtask 2.5: Implement the UI to display the list of public habits.
    - [x] Subtask 2.6: Implement the UI to display the list of public todos.
    - [x] Subtask 2.7: Implement the UI to display the public journal entries.
    - [x] Subtask 2.8: Handle the case where lists are empty and display an appropriate message.
- [x] **Task 3: Testing**
    - [x] Subtask 3.1: Write an integration test for the `getPublicProfileData` function to ensure it only fetches public data.
    - [ ] Subtask 3.2: Write an E2E test with Playwright that navigates to a public profile URL and verifies that the bio and other public information are correctly displayed.

## Dev Notes

- **Performance:** To meet NFR-1.1, this page should be a Next.js Server Component that fetches data on the server. This will allow for either SSR or SSG, providing a fast initial load.
- **Data Fetching:** The `getPublicProfileData` function should make a single, efficient query to Supabase to get all the necessary data, rather than multiple separate queries. This can be achieved by using Supabase's ability to fetch related data.
- **Security:** Ensure that all data fetching for the public profile page is done in a way that respects RLS. The queries should not require the user to be authenticated, but the RLS policies on the tables will ensure only public data is returned.

### Project Structure Notes

- **`lib/supabase/user.ts`**: This file will be extended with the `getPublicProfileData` function.
- **`app/(main)/profile/[userId]/page.tsx`**: This new dynamic route will be the entry point for the public profile.
- **`components/profile/PublicProfileView.tsx`**: This new component will handle the presentation logic for the public profile.

### References

- [Source: `docs/architecture.md#Performance-Considerations`]
- [Source: `docs/architecture.md#Security-Architecture`]
- [Source: `docs/sprint-artifacts/tech-spec-epic-1.md`]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/1-4-public-profile.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
