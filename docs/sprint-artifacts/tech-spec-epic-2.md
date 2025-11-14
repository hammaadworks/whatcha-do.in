# Epic Technical Specification: Habit Management (Recurring Habits)

Date: 2025-11-14
Author: hammaadworks
Epic ID: 2
Status: Draft

---

## Overview

This technical specification outlines the implementation details for Epic 2: Habit Management. This epic introduces the core functionality for creating, tracking, and managing recurring habits, which is central to the "whatcha-doin" application's purpose as an identity-building toolkit. The features developed in this epic will enable users to define their habits, track their consistency via a streak counter, and manage them within the main three-column interface ("Today", "Yesterday", "The Pile").

## Objectives and Scope

**In Scope:**
- Creating new habits with an optional quantitative goal.
- Editing a habit's name and public/private status.
- Deleting habits from "The Pile".
- A visible streak counter on each habit that resets according to the "Two-Day Rule".
- Setting and modifying quantitative goals (number and unit) for a habit.
- Ensuring streak continuity when a habit's goal is changed.

**Out of Scope:**
- Journaling or data entry upon habit completion (covered in Epic 5).
- The main three-column UI layout itself (covered in Epic 4).
- User authentication and profiles (covered in Epic 1).
- Any social sharing features.

## System Architecture Alignment

The implementation of Epic 2 will align with the established serverless architecture. All habit data, including names, streaks, goals, and privacy status, will be stored in the `habits` table within the Supabase PostgreSQL database. Business logic for creating, updating, and deleting habits will be handled through the auto-generated PostgREST API, with data access secured by Row Level Security (RLS) policies. Client-side logic, managed within Next.js components and hooks, will handle user interactions and API calls to Supabase. The `current_streak` and `last_streak` fields in the `habits` table will be central to implementing the streak logic.

## Detailed Design

### Services and Modules

- **`HabitCard` (React Component):** A client-side component to display a single habit, its name, streak, and public/private status. It will handle drag-and-drop events for moving between columns.
- **`HabitService` (Client-side Module):** A TypeScript module in `lib/supabase/` that encapsulates all Supabase API calls for habit-related CRUD operations (create, read, update, delete).
- **`useHabits` (React Hook):** A custom hook that manages the state of the habits, fetches them using `HabitService`, and provides them to the UI components. It will also handle optimistic updates.
- **Supabase `habits` table:** The single source of truth for all habit data.
- **Supabase PostgREST API:** Provides the RESTful interface to the `habits` table.

### Data Models and Contracts

The core data model is the `habits` table in Supabase.

```sql
CREATE TABLE habits (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE NOT NULL,
  current_streak INT DEFAULT 0 NOT NULL,
  last_streak INT DEFAULT 0 NOT NULL,
  goal_value INT,
  goal_unit TEXT,
  pile_state TEXT DEFAULT 'junked' NOT NULL, -- 'lively', 'junked'
  junked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON habits FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public habits are viewable by everyone" ON habits FOR SELECT USING (is_public = TRUE);
```

### APIs and Interfaces

All interactions will use the Supabase PostgREST API.

- **Create Habit:** `POST /rest/v1/habits`
  - Body: `{ name, is_public, goal_value, goal_unit }`
- **Read Habits:** `GET /rest/v1/habits?user_id=eq.{user_id}`
- **Update Habit:** `PATCH /rest/v1/habits?id=eq.{habit_id}`
  - Body: `{ name, is_public, goal_value, goal_unit, current_streak, pile_state, etc. }`
- **Delete Habit:** `DELETE /rest/v1/habits?id=eq.{habit_id}`

### Workflows and Sequencing

**Create Habit Workflow:**
1.  User types a name in the inline input in "The Pile".
2.  User optionally clicks "+ Add Goal" to set a `goal_value` and `goal_unit`.
3.  On pressing `Enter` or clicking "Add", the `HabitService` sends a `POST` request to the Supabase API.
4.  The `useHabits` hook optimistically updates the UI to show the new habit.
5.  On API success, the UI is confirmed. On failure, the optimistic update is reverted and an error is shown.

**Edit Habit Workflow:**
1.  User clicks an "edit" icon on a `HabitCard`.
2.  A modal opens with fields for `name` and `is_public`.
3.  On save, the `HabitService` sends a `PATCH` request to Supabase.
4.  The `useHabits` hook optimistically updates the relevant `HabitCard`.

## Non-Functional Requirements

### Performance

- **NFR-1.1:** API calls for creating, updating, and deleting habits must complete in under 500ms.
- **NFR-1.2:** Client-side state updates should be optimistic to ensure the UI feels instantaneous, with data being synchronized with the backend asynchronously.

### Security

- **NFR-2.1:** All API requests to modify habit data must be authenticated and authorized using Supabase's JWT and Row Level Security (RLS) policies.
- **NFR-2.2:** The `user_id` for all new habits must be derived from the authenticated user's session on the server-side (`auth.uid()`) to prevent users from creating habits for others.

### Reliability/Availability

- **NFR-3.1:** The Supabase database will be the source of truth. In case of a conflict between client-side optimistic updates and the database state, the database state will always win.
- **NFR-3.2:** The application should handle network interruptions gracefully, queuing any habit modifications and retrying when the connection is restored.

### Observability

- **NFR-4.1:** Any errors occurring during habit CRUD operations (both client-side and server-side) must be logged to Sentry, including the user ID and relevant request data for debugging.
- **NFR-4.2:** Critical failures (e.g., inability to connect to the Supabase API) will trigger an alert to the Lark chat webhook.

## Dependencies and Integrations

- **`@supabase/supabase-js`:** The primary client library for interacting with the Supabase backend (PostgREST API and Realtime).
- **`@supabase/ssr`:** Provides server-side rendering support for Supabase authentication and data fetching within Next.js.
- **`next`:** The core React framework for the application.
- **`react` / `react-dom`:** The UI library for building components.
- **`zustand`:** A small, fast, and scalable state-management solution that will be used for managing global client-side state, such as the user's session and habits.
- **`react-hot-toast`:** Will be used for displaying non-critical success/failure feedback to the user, aligning with the defined error handling strategy.

## Acceptance Criteria (Authoritative)

1.  **AC-2.1:** A user can create a new habit with only a name, and it defaults to being public.
2.  **AC-2.2:** A user can create a new habit with a name and a quantitative goal (number and unit).
3.  **AC-2.3:** A user can edit an existing habit's name.
4.  **AC-2.4:** A user can toggle an existing habit's visibility between public and private.
5.  **AC-2.5:** A user can delete a habit, but only when it is in "The Pile".
6.  **AC-2.6:** Each habit card must display a streak counter, which starts at 0 for new habits.
7.  **AC-2.7:** A user can change the `goal_value` of a habit, and its `current_streak` remains unchanged.
8.  **AC-2.8:** The unit for a quantitative goal can be selected from a predefined list or a custom string can be entered.

## Traceability Mapping

| Acceptance Criterion | Spec Section(s) | Component(s)/API(s) | Test Idea |
| :--- | :--- | :--- | :--- |
| AC-2.1, AC-2.2 | Detailed Design | `HabitService`, `useHabits`, `POST /rest/v1/habits` | Unit test `HabitService.createHabit`. E2E test the creation form. |
| AC-2.3, AC-2.4 | Detailed Design | `HabitCard`, `HabitService`, `PATCH /rest/v1/habits` | Unit test `HabitService.updateHabit`. E2E test the edit modal. |
| AC-2.5 | Detailed Design | `HabitCard`, `HabitService`, `DELETE /rest/v1/habits` | E2E test deleting a habit from "The Pile". Verify delete is disabled elsewhere. |
| AC-2.6 | Data Models | `HabitCard`, `habits.current_streak` | Visual inspection of the `HabitCard` component. |
| AC-2.7, AC-2.8 | Data Models | `HabitService`, `PATCH /rest/v1/habits` | E2E test editing a goal and verifying the streak is not reset. |

## Risks, Assumptions, Open Questions

- **Risk:** The logic for the "Two-Day Rule" and streak continuity is complex. If implemented incorrectly on the client-side, it could lead to data integrity issues.
  - **Mitigation:** Core streak logic will be validated server-side via Supabase database functions where possible. Comprehensive integration tests will be written to cover edge cases.
- **Assumption:** Users will understand the difference between a habit's `current_streak` and `last_streak`.
  - **Mitigation:** The UI will need to be clear about this distinction, possibly with tooltips or a help section.
- **Question:** How should the predefined list of units for quantitative goals be managed?
  - **Next Step:** For the MVP, this will be a hardcoded array in the client-side code. For future versions, this could be a table in the database.

## Test Strategy Summary

- **Unit Tests (Vitest):**
  - Test the `HabitService` methods for correct API call formatting.
  - Test the `useHabits` hook's state management logic (optimistic updates, error handling).
- **Integration Tests (Vitest):**
  - Write tests to directly invoke the Supabase API (bypassing the UI) to confirm that RLS policies are correctly applied for all habit operations.
  - Test the streak continuity logic when goals are changed.
- **End-to-End Tests (Playwright):
  - A test script will simulate the full user journey: creating a habit, editing its goal, completing it over several days to build a streak, letting the streak break, and restarting it.
