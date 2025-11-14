# Story 2.3: Delete Habit

Status: drafted

## Story

As a user,
I want to delete a habit from "The Pile",
so that I can permanently remove activities I'm no longer tracking.

## Requirements Context Summary

This story enables users to delete existing habits from the application. The deletion is restricted to habits located in "The Pile" column, ensuring that active or recently missed habits are not accidentally removed. This directly addresses Functional Requirement FR-2.4 from the PRD.

**Key Functional Requirements:**
-   **FR-2.4 (PRD):** Users must be able to delete a habit, but only from "The Pile" column.

**Architectural Considerations:**
-   **Project Structure:** The habit deletion UI will reside within the `app/` and `components/` directories. Supabase client interactions will be handled via `lib/supabase/`.
-   **Data Model:** The `habits` table in Supabase (PostgreSQL) will be updated to remove the habit record.
-   **Naming Conventions:** Adhere to `PascalCase` for React components, `camelCase` for TypeScript variables/functions, `snake_case_plural` for database tables, and `snake_case` for database columns.
-   **Security:** Row Level Security (RLS) policies on the `habits` table must ensure that only the owner of a habit can delete it. Additionally, server-side validation should enforce that a habit can only be deleted if its `pile_state` is 'junked' or 'lively' (i.e., it is in "The Pile").
-   **Testing:** Unit tests (Vitest) for the Supabase service, integration tests (Vitest) for RLS and `pile_state` validation, and E2E tests (Playwright) for the UI flow.

## Structure Alignment Summary

This story will primarily involve modifications to existing components and services. The `HabitCard.tsx` component will be updated to include a delete interaction, and the `lib/supabase/habit.ts` service will be extended with a `deleteHabit` function. The `hooks/useHabits.ts` hook will integrate this new functionality.

**Learnings from Previous Story (2.2 Edit Habit):**
-   **Component Structure:** `HabitCard.tsx` is the component for displaying a single habit and will be modified for delete interactions.
-   **Service Pattern:** `lib/supabase/habit.ts` is the module for habit-related CRUD operations. A `deleteHabit` method will be added here.
-   **State Management:** `hooks/useHabits.ts` will manage the state of habits and integrate deletion functionality.
-   **Security:** Row Level Security (RLS) policies on the `habits` table are crucial for ensuring only the owner can modify/delete habits.
-   **UI/UX:** The UX Design Specification emphasizes "keyboard-first" and clear micro-interactions. The deletion flow should be intuitive and provide clear feedback, including a confirmation step.
-   **Testing Standards:** Follow existing `vitest` and `playwright` patterns, and ensure RLS is tested.

**Project Structure Notes for this Story:**
-   **UI Components:** The `HabitCard.tsx` component will be modified to include a delete button/icon, visible only when the habit is in "The Pile".
-   **Supabase Integration:** A function to delete habit data from the `habits` table will be required in `lib/supabase/habit.ts`.
-   **Database Schema:** The `habits` table schema already supports the necessary fields for identifying and deleting habits.

## Acceptance Criteria

1.  Given a user is logged in and has habits, when they attempt to delete a habit from "The Pile", then the habit is successfully removed from the UI and the database.
2.  Given a user is logged in and has habits, when they attempt to delete a habit that is not in "The Pile" (e.g., in "Today" or "Yesterday"), then the delete operation is prevented or disabled in the UI.
3.  Given a user is logged in and has habits, when they attempt to delete a habit they do not own, then the operation is rejected by the server due to RLS.

## Tasks / Subtasks

-   [x] **Task 1: Implement Habit Deletion UI** (AC: #1, #2)
    -   [x] Subtask 1.1: Modify `HabitCard.tsx` to include a delete button/icon, visible only when the habit is in "The Pile".
    -   [x] Subtask 1.2: Implement a confirmation dialog before permanent deletion.
-   [x] **Task 2: Implement Habit Deletion Service** (AC: #1, #3)
    -   [x] Subtask 2.1: Add `deleteHabit` method to `lib/supabase/habit.ts` to send a `DELETE` request to Supabase.
    -   [x] Subtask 2.2: Ensure `deleteHabit` includes logic to verify the habit's `pile_state` before deletion (server-side validation).
-   [x] **Task 3: Integrate Deletion Logic with UI** (AC: #1)
    -   [x] Subtask 3.1: Update `hooks/useHabits.ts` to call `HabitService.deleteHabit` and manage state.
    -   [x] Subtask 3.2: Implement optimistic UI updates for habit deletion.
    -   [x] Subtask 3.3: Handle error states and display feedback using `react-hot-toast`.
-   [ ] **Task 4: Testing** (AC: #1, #2, #3)
    -   [ ] Subtask 4.1: Write unit tests for `HabitService.deleteHabit`.
    -   [ ] Subtask 4.2: Write integration tests to verify RLS policies for habit deletion and `pile_state` validation.
    -   [ ] Subtask 4.3: Write E2E tests using Playwright for the habit deletion flow, including attempts to delete from incorrect columns.

## Dev Notes

- **Relevant architecture patterns and constraints:** Adhere to the established architecture for Supabase interactions, RLS, and UI component structure.
- **Source tree components to touch:** `components/habits/HabitCard.tsx`, `lib/supabase/habit.ts`, `hooks/useHabits.ts`.
- **Testing standards summary:** Follow the lean MVP testing strategy (Unit, Integration, E2E) as defined in `docs/architecture.md#Testing-Strategy`. Ensure RLS and `pile_state` validation are thoroughly tested.

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming): The changes will align with the existing `components/habits/`, `lib/supabase/`, and `hooks/` directories.
- Detected conflicts or variances (with rationale): None anticipated.

### References

- [Source: `docs/PRD.md#FR-2.4`]
- [Source: `docs/epics.md#Epic-2-Habit-Management-(Recurring-Habits)`]
- [Source: `docs/architecture.md#Data-Architecture`]
- [Source: `docs/architecture.md#API-Contracts`]
- [Source: `docs/architecture.md#Testing-Strategy`]
- [Source: `docs/ux-design-specification.md#Keyboard-First-Interaction`]
- [Source: `docs/sprint-artifacts/2-2-edit-habit.md#Dev-Agent-Record`]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-14:** Initial draft of story created.
