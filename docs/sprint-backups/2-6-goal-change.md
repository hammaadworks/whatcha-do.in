# Story 2.6: Goal Change

Status: done

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/2-6-goal-change.context.xml

## Story

As a user,
I want to change the quantitative goal of a habit, and ensure its current streak remains unchanged,
so that I can adjust my targets without losing my progress.

## Requirements Context Summary

This story focuses on allowing users to modify the quantitative goals of their habits while preserving their current streak. This directly addresses FR-2.7 from the PRD and AC-2.7 from the Epic 2 Technical Specification.

**Key Functional Requirements:**
-   **FR-2.7 (PRD):** When a habit's goal is upgraded or downgraded, the existing streak must continue uninterrupted. The new `goal_value` becomes the requirement for continuing the streak from the moment of change.

**Architectural Considerations:**
-   **Data Model:** The `habits` table in Supabase (PostgreSQL) already supports `goal_value` (numeric) and `goal_unit` (text) columns, and `current_streak` (integer).
-   **Project Structure:** The goal editing UI will reside within `components/habits/EditHabitModal.tsx`. The logic for updating goals will reside in `lib/supabase/habit.ts` and be integrated into `hooks/useHabits.ts`.
-   **Naming Conventions:** Adhere to `PascalCase` for React components, `camelCase` for TypeScript variables/functions, `snake_case_plural` for database tables, and `snake_case` for database columns.
-   **Security:** Row Level Security (RLS) policies on the `habits` table must ensure only the owner can modify goal data.
-   **Testing:** Unit tests (Vitest) for client-side validation, integration tests (Vitest) for database updates and streak preservation, and E2E tests (Playwright) for UI display and behavior.

## Structure Alignment Summary

This story will primarily involve modifications to existing components and services. The `EditHabitModal.tsx` component will be updated. The `lib/supabase/habit.ts` service will be extended with logic to manage goal updates, and the `hooks/useHabits.ts` hook will integrate this new functionality.

**Learnings from Previous Story (2.5 Quantitative Goals):**
-   The `EditHabitModal.tsx` and `HabitCard.tsx` components are being updated to handle goal input and display. This story will build upon that.
-   The `lib/supabase/habit.ts` service is the central place for habit-related logic.
-   Comprehensive testing, including E2E, is crucial, especially for ensuring streak continuity.

**Project Structure Notes for this Story:**
-   **UI Components:** The `components/habits/EditHabitModal.tsx` component will be modified to allow modification of `goal_value` and `goal_unit`.
-   **Supabase Integration:** The `updateHabit` function in `lib/supabase/habit.ts` will be used to update `goal_value` and `goal_unit`.
-   **Database Schema:** The `habits` table schema already supports `goal_value`, `goal_unit`, and `current_streak` columns. No new migrations are anticipated.

## Acceptance Criteria

1.  Given a user is logged in and has a habit with a quantitative goal, when they modify the `goal_value` or `goal_unit` of that habit, then the habit's `current_streak` remains unchanged.
2.  The updated `goal_value` and `goal_unit` are successfully persisted to the database.
3.  The updated `goal_value` and `goal_unit` are correctly reflected in the UI.

## Tasks / Subtasks

-   [x] **Task 1: Modify Goal Editing UI** (AC: #1, #3)
    -   [x] Subtask 1.1: Ensure `components/habits/EditHabitModal.tsx` allows modification of `goal_value` and `goal_unit`.
-   [x] **Task 2: Implement Habit Update Service for Goal Change** (AC: #1, #2)
    -   [x] Subtask 2.1: Ensure `updateHabit` method in `lib/supabase/habit.ts` correctly handles updates to `goal_value` and `goal_unit` without affecting `current_streak`.
-   [x] **Task 3: Integrate Goal Change Logic with UI** (AC: #1, #3)
    -   [x] Subtask 3.1: Update `hooks/useHabits.ts` to call `HabitService.updateHabit` with new goal data.
    -   [x] Subtask 3.2: Implement optimistic UI updates for goal changes.
    -   [x] Subtask 3.3: Handle error states and display feedback using `react-hot-toast`.
-   [ ] **Task 4: Testing** (AC: #1, #2, #3)
    -   [ ] Subtask 4.1: Write unit tests for client-side goal change validation.
    -   [ ] Subtask 4.2: Write integration tests for `HabitService.updateHabit` to verify `goal_value` and `goal_unit` updates and `current_streak` preservation.
    -   [ ] Subtask 4.3: Write E2E tests using Playwright for the habit goal change flow, verifying UI display and streak continuity.

## Dev Notes

- **Relevant architecture patterns and constraints:** Adhere to the established architecture for Supabase interactions, RLS, and UI component structure. The `habits` table already supports `goal_value` (numeric), `goal_unit` (text), and `current_streak` (integer) columns.
- **Source tree components to touch:** `components/habits/EditHabitModal.tsx`, `lib/supabase/habit.ts`, `hooks/useHabits.ts`.
- **Testing standards summary:** Follow the lean MVP testing strategy (Unit, Integration, E2E) as defined in `docs/architecture.md#Testing-Strategy`. Ensure goal modification logic, streak preservation, and UI display are thoroughly tested.

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming): The changes will align with the existing `components/habits/`, `lib/supabase/`, and `hooks/` directories.
- Detected conflicts or variances (with rationale): None anticipated.

### References

- [Source: `docs/PRD.md#FR-2.7`]
- [Source: `docs/epics.md#Epic-2-Habit-Management-(Recurring-Habits)`]
- [Source: `docs/architecture.md#Data-Modeling-(Habits-&-Completions)`]
- [Source: `docs/architecture.md#API-Contracts`]
- [Source: `docs/architecture.md#Testing-Strategy`]
- [Source: `docs/ux-design-specification.md#Habit-Management-(Identity-Momentum-Board)`]
- [Source: `docs/sprint-artifacts/tech-spec-epic-2.md#Acceptance-Criteria-(Authoritative)`]
- [Source: `docs/sprint-artifacts/2-5-quantitative-goals.md#Dev-Agent-Record`]

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

---

### Senior Developer Review (AI) - Story 2.6: Goal Change

**Summary:**
Story 2.6 "Goal Change" has been fully implemented according to the requirements and acceptance criteria (excluding testing). The UI allows for goal modification, the service layer handles persistence, and the `useHabits` hook integrates these changes with optimistic UI updates and error handling. The crucial aspect of preserving the `current_streak` during goal changes is correctly handled.

**Key Findings:**
*   No significant issues or deviations from the plan were found. The implementation is clean and follows established patterns.

**Acceptance Criteria Coverage:**

| AC Number | Description                                                                                                   | Status      | Comment                                                                                                                                                                                                                                           |
| :-------- | :------------------------------------------------------------------------------------------------------------ | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1      | Given a user is logged in and has a habit with a quantitative goal, when they modify the `goal_value` or `goal_unit` of that habit, then the habit's `current_streak` remains unchanged. | **MET**     | The `updateHabit` function in `lib/supabase/habit.ts` does not modify `current_streak`. The UI and `useHabits` hook correctly pass only the goal-related fields for update.                                                                           |
| AC-2      | The updated `goal_value` and `goal_unit` are successfully persisted to the database.                          | **MET**     | The `updateHabit` function in `lib/supabase/habit.ts` correctly updates these fields in the database.                                                                                                                                             |
| AC-3      | The updated `goal_value` and `goal_unit` are correctly reflected in the UI.                                   | **MET**     | The `EditHabitModal.tsx` allows input, and `hooks/useHabits.ts` performs optimistic updates and fetches fresh data, ensuring UI reflection.                                                                                                         |

**Task Completion Validation:**

| Task/Subtask Number | Description                                                                                                                                | Status      | Comment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task 1              | Modify Goal Editing UI                                                                                                                     | **COMPLETED** | `components/habits/EditHabitModal.tsx` allows modification of `goal_value` and `goal_unit`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Subtask 1.1         | Ensure `components/habits/EditHabitModal.tsx` allows modification of `goal_value` and `goal_unit`.                                       | **COMPLETED** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Task 2              | Implement Habit Update Service for Goal Change                                                                                             | **COMPLETED** | `updateHabit` method in `lib/supabase/habit.ts` correctly handles updates to `goal_value` and `goal_unit` without affecting `current_streak`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Subtask 2.1         | Ensure `updateHabit` method in `lib/supabase/habit.ts` correctly handles updates to `goal_value` and `goal_unit` without affecting `current_streak`. | **COMPLETED** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Task 3              | Integrate Goal Change Logic with UI                                                                                                        | **COMPLETED** | `hooks/useHabits.ts` calls `HabitService.updateHabit` with new goal data, implements optimistic UI updates, and handles error states with `react-hot-toast`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Subtask 3.1         | Update `hooks/useHabits.ts` to call `HabitService.updateHabit` with new goal data.                                                         | **COMPLETED** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Subtask 3.2         | Implement optimistic UI updates for goal changes.                                                                                          | **COMPLETED** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Subtask 3.3         | Handle error states and display feedback using `react-hot-toast`.                                                                          | **COMPLETED** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Task 4              | Testing                                                                                                                                    | **CANCELLED** | As per user instruction.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Subtask 4.1         | Write unit tests for client-side goal change validation.                                                                                   | **CANCELLED** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Subtask 4.2         | Write integration tests for `HabitService.updateHabit` to verify `goal_value` and `goal_unit` updates and `current_streak` preservation. | **CANCELLED** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Subtask 4.3         | Write E2E tests using Playwright for the habit goal change flow, verifying UI display and streak continuity.                               | **CANCELLED** |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

**Architectural Alignment:**
The implementation adheres to the established architectural patterns, with UI components handling user input, service layers managing database interactions, and hooks orchestrating state and logic.

**Security Notes:**
RLS policies on the `habits` table are crucial and assumed to be in place to prevent unauthorized goal modifications.

**Best-Practices and References:**
*   **Optimistic UI updates:** Properly implemented in `hooks/useHabits.ts`.
*   **Error Handling and Toasts:** Consistent use of `react-hot-toast` for user feedback.
*   **`useCallback`:** Used for memoizing functions in `hooks/useHabits.ts`.

**Action Items (Suggestions):**
*   None. The implementation is complete and correct as per the story's scope.