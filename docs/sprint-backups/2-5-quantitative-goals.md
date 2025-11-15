# Story 2.5: Quantitative Goals

Status: drafted

## Story

As a user,
I want to set and modify a quantitative goal for a habit by providing a number and selecting a unit from a list (e.g., "pages", "minutes") or entering my own custom unit,
so I can track specific, measurable outcomes.

## Requirements Context Summary

This story enables users to set and modify quantitative goals for their habits, enhancing the specificity and measurability of habit tracking. It directly addresses FR-2.6 and FR-2.7 from the PRD, and AC-2.7 and AC-2.8 from the Epic 2 Technical Specification.

**Key Functional Requirements:**
-   **FR-2.6 (PRD):** Users must be able to set and modify a quantitative goal for a habit (e.g., "Read 5 pages"). The goal consists of a number and a unit. The unit can be selected from a predefined list (e.g., `minutes`, `hours`, `pages`, `reps`, `sets`, `questions`) or can be a custom value defined by the user.
-   **FR-2.7 (PRD):** When a habit's goal is upgraded or downgraded, the existing streak must continue uninterrupted. The new `goal_value` becomes the requirement for continuing the streak from the moment of change.

**Architectural Considerations:**
-   **Data Model:** The `habits` table in Supabase (PostgreSQL) already supports `goal_value` (numeric) and `goal_unit` (text) columns.
-   **Project Structure:** The goal editing UI will reside within `components/habits/EditHabitModal.tsx`. The display of goals will be in `components/habits/HabitCard.tsx`. Logic for updating goals will reside in `lib/supabase/habit.ts` and be integrated into `hooks/useHabits.ts`.
-   **Naming Conventions:** Adhere to `PascalCase` for React components, `camelCase` for TypeScript variables/functions, `snake_case_plural` for database tables, and `snake_case` for database columns.
-   **Security:** Row Level Security (RLS) policies on the `habits` table must ensure only the owner can modify goal data.
-   **Testing:** Unit tests (Vitest) for client-side validation, integration tests (Vitest) for database updates and streak preservation, and E2E tests (Playwright) for UI display and behavior.

## Structure Alignment Summary

This story will primarily involve modifications to existing components and services. The `EditHabitModal.tsx` and `HabitCard.tsx` components will be updated. The `lib/supabase/habit.ts` service will be extended with logic to manage goal updates, and the `hooks/useHabits.ts` hook will integrate this new functionality.

**Learnings from Previous Story (2.4 Streak Counter):**
-   The `habits` table already contains `current_streak` and `last_streak` columns, and the streak logic is being implemented. This story must ensure that modifying `goal_value` does not inadvertently affect the `current_streak`.
-   The `HabitCard.tsx` is being updated for streak display, so goal display should be integrated harmoniously.
-   The `lib/supabase/habit.ts` service is the central place for habit-related logic.
-   Comprehensive testing, including E2E, is crucial.

## Acceptance Criteria

1.  Users can set a quantitative goal for a habit, consisting of a number and a unit.
2.  The unit for the quantitative goal can be selected from a predefined list (e.g., `minutes`, `hours`, `pages`, `reps`, `sets`, `questions`) or a custom value entered by the user.
3.  Users can modify an existing quantitative goal (number and unit) for a habit.
4.  When a habit's quantitative goal is modified, its `current_streak` remains unchanged.
5.  The `goal_value` and `goal_unit` are correctly displayed on the habit card.

## Tasks / Subtasks

-   [ ] **Task 1: Implement Goal Editing UI** (AC: #1, #2, #3)
    -   [ ] Subtask 1.1: Modify `components/habits/EditHabitModal.tsx` to include input fields for `goal_value` (number) and `goal_unit` (dropdown/text).
    -   [ ] Subtask 1.2: Populate `goal_unit` dropdown with predefined list (e.g., `minutes`, `hours`, `pages`, `reps`, `sets`, `questions`).
    -   [ ] Subtask 1.3: Implement logic for "Custom..." unit input, allowing user to type a custom unit.
    -   [ ] Subtask 1.4: Implement client-side validation for `goal_value` (e.g., positive number) and `goal_unit` (not empty if custom).
-   [ ] **Task 2: Implement Habit Update Service for Goals** (AC: #1, #3, #4)
    -   [ ] Subtask 2.1: Modify `updateHabit` method in `lib/supabase/habit.ts` to accept and update `goal_value` and `goal_unit`.
    -   [ ] Subtask 2.2: Ensure `updateHabit` does not modify `current_streak` when `goal_value` or `goal_unit` are updated.
-   [ ] **Task 3: Integrate Goal Update Logic with UI** (AC: #1, #3, #4)
    -   [ ] Subtask 3.1: Update `hooks/useHabits.ts` to call `HabitService.updateHabit` with new goal data.
    -   [ ] Subtask 3.2: Implement optimistic UI updates for goal changes.
    -   [ ] Subtask 3.3: Handle error states and display feedback using `react-hot-toast`.
-   [ ] **Task 4: Update Habit Card UI to Display Goals** (AC: #5)
    -   [ ] Subtask 4.1: Modify `components/habits/HabitCard.tsx` to display the `goal_value` and `goal_unit` (e.g., "5 pages").
-   [ ] **Task 5: Testing** (AC: #1, #2, #3, #4, #5)
    -   [ ] Subtask 5.1: Write unit tests for client-side goal validation.
    -   [ ] Subtask 5.2: Write integration tests for `HabitService.updateHabit` to verify `goal_value` and `goal_unit` updates and `current_streak` preservation.
    -   [ ] Subtask 5.3: Write E2E tests using Playwright for the habit goal editing flow, verifying UI display and streak continuity.

## Dev Notes

- **Relevant architecture patterns and constraints:** Adhere to the established architecture for Supabase interactions, RLS, and UI component structure. The `habits` table already supports `goal_value` (numeric) and `goal_unit` (text) columns.
- **Source tree components to touch:** `components/habits/EditHabitModal.tsx`, `components/habits/HabitCard.tsx`, `lib/supabase/habit.ts`, `hooks/useHabits.ts`.
- **Testing standards summary:** Follow the lean MVP testing strategy (Unit, Integration, E2E) as defined in `docs/architecture.md#Testing-Strategy`. Ensure goal modification logic, streak preservation, and UI display are thoroughly tested.

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming): The changes will align with the existing `components/habits/`, `lib/supabase/`, and `hooks/` directories.
- Detected conflicts or variances (with rationale): None anticipated.

### References

- [Source: `docs/PRD.md#FR-2.6`]
- [Source: `docs/PRD.md#FR-2.7`]
- [Source: `docs/epics.md#Epic-2-Habit-Management-(Recurring-Habits)`]
- [Source: `docs/architecture.md#Data-Modeling-(Habits-&-Completions)`]
- [Source: `docs/architecture.md#API-Contracts`]
- [Source: `docs/architecture.md#Testing-Strategy`]
- [Source: `docs/ux-design-specification.md#Habit-Management-(Identity-Momentum-Board)`]
- [Source: `docs/sprint-artifacts/tech-spec-epic-2.md#Acceptance-Criteria-(Authoritative)`]
- [Source: `docs/sprint-artifacts/2-4-streak-counter.md#Dev-Agent-Record`]

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
