# Story 2.1: Create Habit

Status: ready-for-dev

## Story

As a user,
I want to create a new habit with a name directly in "The Pile", with the option to also set a quantitative goal,
so I can quickly add new activities to track. The habit should default to Public.

## Requirements Context Summary

This story focuses on enabling users to create new habits within the application. The primary entry point for habit creation will be "The Pile" column, allowing for quick and intuitive addition of new activities. Users will have the option to define a quantitative goal for their habits at the time of creation, which includes specifying a numerical value and a unit. Newly created habits will default to a 'Public' status, and their initial streak count will be zero.

**Key Functional Requirements:**
-   **FR-2.1 (PRD):** Users must be able to create a new "habit" with a name via an inline input field within "The Pile" column. A "+ Add Goal" button will appear, allowing optional quantitative goal setting (number and unit). New habits default to 'Public' and start with a streak count of 0.
-   **FR-2.2 (PRD):** When creating or editing a habit, users must be able to mark it as "public" or "private".

**Architectural Considerations:**
-   **Project Structure:** The habit creation UI will reside within the `app/` and `components/` directories. Supabase client interactions will be handled via `lib/supabase/`.
-   **Data Model:** The `habits` table in Supabase (PostgreSQL) will need to support fields such as `name`, `is_public`, `current_streak`, `goal_value`, and `goal_unit`.
-   **Naming Conventions:** Adhere to `PascalCase` for React components, `camelCase` for TypeScript variables/functions, `snake_case_plural` for database tables, and `snake_case` for database columns.
-   **Testing:** Unit tests (Vitest + React Testing Library) for UI components and integration tests (Vitest) for Supabase interactions related to habit creation.

**User Story Statement:**
As a user,
I want to create a new habit with a name directly in "The Pile", with the option to also set a quantitative goal,
so I can quickly add new activities to track. The habit should default to Public.

## Structure Alignment Summary

This story will involve creating new UI components for habit input and display, likely within `components/habits/` or directly in `app/(main)/habits/`. Data interaction will require extending the Supabase client logic, potentially by adding a `createHabit` function to `lib/supabase/client.ts` or a new `lib/supabase/habit.ts` module, following the pattern established by `lib/supabase/user.ts` in the previous story.

**Learnings from Previous Story (1.4 Public Profile):**
-   **New Service Pattern:** The `getPublicProfileData` function in `lib/supabase/user.ts` provides a clear pattern for organizing Supabase data access logic. For habit creation, a similar function (e.g., `createHabit`) should be implemented, likely within `lib/supabase/client.ts` or a new `lib/supabase/habit.ts` file.
-   **Component Structure:** The creation of `app/(main)/profile/[userId]/page.tsx` and `components/profile/PublicProfileView.tsx` reinforces the use of `app/` for routing and `components/` for reusable UI elements. Habit creation UI will follow this pattern.
-   **Testing:** The pending E2E test from the previous story (`1-4-public-profile`) serves as a reminder to include comprehensive testing, including E2E tests, for the habit creation flow.

**Project Structure Notes for this Story:**
-   **UI Components:** New components for habit input (inline field, goal setting) and habit display (chip in "The Pile") will be created, likely under `components/habits/`.
-   **Supabase Integration:** A function to insert new habit data into the `habits` table will be required, following the `lib/supabase/` structure.
-   **Database Schema:** Ensure the `habits` table supports `name`, `is_public`, `current_streak`, `goal_value`, and `goal_unit` fields.

## Acceptance Criteria

1.  Users can create a new habit by typing a name into an inline input field within "The Pile" column.
2.  As the user types, a "+ Add Goal" button appears next to the input field.
3.  Users can optionally click "+ Add Goal" to reveal fields for a quantitative goal (number and unit).
4.  The unit for the quantitative goal can be selected from a predefined list (e.g., `minutes`, `hours`, `pages`, `reps`, `sets`, `questions`) or a custom value entered by the user.
5.  New habits default to 'Public' status upon creation.
6.  New habits start with a `current_streak` count of 0.
7.  Users can successfully save a new habit with or without a quantitative goal.
8.  The newly created habit appears in "The Pile" column.

## Tasks / Subtasks

-   [x] **Task 1: Implement Habit Creation UI in "The Pile"** (AC: #1, #2, #3, #4)
    -   [x] Subtask 1.1: Create an inline input field component for new habit names within "The Pile" column.
    -   [x] Subtask 1.2: Implement logic to display "+ Add Goal" button when user starts typing.
    -   [x] Subtask 1.3: Develop UI for quantitative goal input (number field and unit dropdown/custom input) that appears when "+ Add Goal" is clicked.
    -   [x] Subtask 1.4: Integrate predefined unit list and custom unit input functionality.
-   [x] **Task 2: Develop Supabase Service for Habit Creation** (AC: #5, #6, #7)
    -   [x] Subtask 2.1: In `lib/supabase/client.ts` (or `lib/supabase/habit.ts`), create an asynchronous function `createHabit(habitData)` that inserts a new record into the `habits` table.
    -   [x] Subtask 2.2: Ensure `createHabit` sets `is_public` to `true` by default and `current_streak` to `0`.
    -   [x] Subtask 2.3: Handle optional `goal_value` and `goal_unit` parameters in `createHabit`.
-   [x] **Task 3: Integrate UI with Supabase Service** (AC: #7, #8)
    -   [x] Subtask 3.1: Connect the habit creation UI to the `createHabit` Supabase service function.
    -   [x] Subtask 3.2: After successful creation, update the UI to display the new habit in "The Pile".
-   [ ] **Task 4: Testing**
    -   [x] Subtask 4.1: Write unit tests (Vitest + React Testing Library) for the habit creation UI components.
    -   [x] Subtask 4.2: Write an integration test (Vitest) for the `createHabit` Supabase service function, verifying correct data insertion and default values.
    -   [x] Subtask 4.3: Write an E2E test (Playwright) that simulates creating a habit with and without a goal, and verifies its appearance in "The Pile".

## Dev Notes

- **Learnings from Previous Story (1.4 Public Profile):**
    - **Pending E2E Test:** The E2E test for the public profile page (Subtask 3.2: Write an E2E test with Playwright that navigates to a public profile URL and verifies that the bio and other public information are correctly displayed) is still pending. This highlights the importance of comprehensive E2E testing for new features.
- Relevant architecture patterns and constraints
- Source tree components to touch
- Testing standards summary

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
- Detected conflicts or variances (with rationale)

### References

- [Source: `docs/PRD.md#FR-2.1`]
- [Source: `docs/PRD.md#FR-2.2`]
- [Source: `docs/epics.md#Epic-2-Habit-Management-(Recurring-Habits)`]
- [Source: `docs/architecture.md#Data-Modeling-(Habits-&-Completions)`]
- [Source: `docs/architecture.md#Naming-Conventions`]
- [Source: `docs/architecture.md#Testing-Strategy`]
- [Source: `docs/sprint-artifacts/1-4-public-profile.md#Dev-Agent-Record`]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/2-1-create-habit.context.xml

### Agent Model Used

gemini-1.5-flash

### Debug Log References

### Completion Notes List

### File List
- NEW: `components/habits/HabitCreator.tsx`
- NEW: `lib/supabase/habit.ts`
- NEW: `hooks/useAuth.ts`
- NEW: `tests/unit/HabitCreator.test.tsx`
- NEW: `tests/integration/habit.test.ts`
- NEW: `tests/e2e/habit-creation.spec.ts`
