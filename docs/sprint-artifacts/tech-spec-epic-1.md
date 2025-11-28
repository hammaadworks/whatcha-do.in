# Epic Technical Specification: Core Application Foundations: User, Habit, and Todo Management

Date: 2025-11-20
Author: hammaadworks
Epic ID: 1
Status: Draft

---

## Overview

This technical specification details the foundational epic (Epic-1) of the "whatcha-doin" application, focusing on the core systems for user and profile management, recurring habit tracking, and one-off todo management. This epic lays the groundwork for an intuitive, keyboard-first experience aimed at empowering users to build and maintain positive routines. It encompasses the essential features that enable users to manage their daily tasks and habits, which are central to the application's vision of fostering personal growth and consistency through robust habit and todo management.

## Objectives and Scope

**In-Scope:**
*   **User & Profile Management (FR-1):** Implementation of user accounts with Magic Link authentication, user bio editing, and configuration of unique public IDs (slugs) for public profiles, displaying public habits, todos, and journal.
*   **Core Habit Management (FR-2):** Functionality for creating, editing, and deleting recurring habits, including public/private toggles, visible streak counters, quantitative goals with unit selection, and the ability to adjust goals without breaking streaks. Support for both broad and atomic habits.
*   **Core Todo Management (FR-3):** Implementation of one-off todo creation with an intelligent notepad concept, 2-level sub-todos, public/private toggles, and completion/deletion functionality.
*   **Main Interface & Core Logic (FR-4.1 - FR-4.10):** Development of the three-column habit layout ("Today", "Yesterday", "The Pile") with responsive interactions (drag-and-drop for desktop, tap-to-move for mobile), precise sorting rules, and the core logic governing daily state changes, the Grace Period, and the "Two-Day Rule" (Lively and Junked states, including the Junked Days Counter). This also includes the ability to undo habit completion.
*   **General UI & UX (FR-6.3, FR-6.4, FR-7.1):** Development of the application as a Single Page Application (SPA), inclusion of a prominent theme switcher, and the "Positive Urgency UI" for the 'Yesterday' column.

**Out-of-Scope (for Epic 1):**
*   Journaling System (FR-5, except as it pertains to logging completion details)
*   Motivational Quote Widget (FR-6.1)
*   Core Keyboard Shortcuts (FR-6.2)
*   Teleport-to-Journal Animation (FR-7.2)
*   Advanced Profiles or Data Visualizations (Growth Features)

## System Architecture Alignment

The implementation of Epic-1 will align with the established system architecture, leveraging Next.js for the frontend, Supabase for backend services (PostgreSQL, Authentication, Realtime), and Vercel for deployment. Core logic related to habit state changes, such as the Grace Period and the "Two-Day Rule", will utilize a hybrid approach combining client-side triggers with Supabase Database Functions to ensure data integrity and real-time accuracy. Data modeling will incorporate the extended `habits` table and the new `habit_completions` table to support quantitative goals and detailed completion logging. Row Level Security (RLS) will be fundamental in enforcing the separation of public and private user data, particularly for habits and todos. The project structure will follow the Next.js App Router conventions, with dedicated modules for authentication, habit management, and todo features, ensuring clear separation of concerns and maintainability.

## Detailed Design

### Services and Modules

| Service/Module         | Responsibilities                                                                                                 | Inputs/Outputs                                                                                             | Owner     |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :-------- |
| **Frontend (Next.js)** | UI Rendering, Client-side Logic, User Interaction                                                                | User input, API responses (Supabase)                                                                       | Frontend  |
| `app/(auth)`           | User authentication flows (Magic Link login, signup)                                                             | Email, Auth tokens                                                                                         | Frontend  |
| `app/(main)`           | Main application routes, layout, and components (Habits, Todos, Profile)                                         | User actions, Data from Supabase                                                                           | Frontend  |
| `components/`          | Reusable UI components (shadcn/ui, Aceternity UI), feature-specific components                                   | Props, Events                                                                                              | Frontend  |
| `lib/supabase`         | Supabase client initialization, data access, type definitions                                                    | Supabase client, DB types                                                                                  | Shared    |
| **Backend (Supabase)** | Data Persistence, Authentication, Realtime, Server-side Business Logic                                           | Client requests (PostgREST), Database Functions parameters                                                 | Backend   |
| `supabase/migrations`  | Database schema evolution                                                                                        | SQL migration scripts                                                                                      | Backend   |
| `supabase/functions`   | Server-side logic for "Two-Day Rule", Grace Period processing, streak calculation, public ID uniqueness validation | Habit data, User data, Session information                                                                 | Backend   |

### Data Models and Contracts

**Users Table:**
| Column                        | Type                   | Description                                                                                             |
| :---------------------------- | :--------------------- | :------------------------------------------------------------------------------------------------------ |
| `user_id`                     | `uuid` (PK)            | Unique identifier for the user (from Supabase Auth)                                                     |
| `email`                       | `text`                 | User's email address                                                                                    |
| `bio`                         | `text`                 | User's profile biography                                                                                |
| `timezone`                    | `text`                 | User's preferred timezone                                                                               |
| `grace_screen_shown_for_date` | `date`                 | Date for which the grace period screen was last shown                                                   |
| `username`                   | `text` (Unique, Index) | User-configurable unique public ID (slug)                                                               |

**Habits Table:**
| Column                      | Type                           | Description                                                                                                   |
| :-------------------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `habit_id`                  | `uuid` (PK)                    | Unique identifier for the habit                                                                               |
| `user_id`                   | `uuid` (FK to `users`)         | Owner of the habit                                                                                            |
| `name`                      | `text`                         | Name of the habit                                                                                             |
| `is_public`                 | `boolean`                      | Flag for public visibility                                                                                    |
| `current_streak`            | `integer`                      | Current consecutive completion streak                                                                         |
| `last_streak`               | `integer`                      | Last recorded streak before reset (for "Junked" habits)                                                       |
| `created_at`                | `timestamp with time zone`     | Timestamp of habit creation                                                                                   |
| `goal_value`                | `numeric`                      | Numerical part of the habit's quantitative goal                                                               |
| `goal_unit`                 | `text`                         | Unit of the habit's quantitative goal (e.g., 'pages', 'minutes')                                              |
| `last_recorded_mood`        | `integer`                      | Last recorded mood score (0-100)                                                                              |
| `last_recorded_work_value`  | `numeric`                      | Last recorded work value for a quantitative habit                                                             |
| `last_recorded_work_unit`   | `text`                         | Unit for last recorded work value                                                                             |
| `pile_state`                | `text` (`'Lively'`, `'Junked'`) | State of the habit if it's in 'The Pile' due to missed days                                                   |
| `junked_at`                 | `timestamp with time zone`     | Timestamp when the habit entered the 'Junked' state                                                           |

**Habit Completions Table (NEW):**
| Column                  | Type                       | Description                                                                                                   |
| :---------------------- | :------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `completion_id`         | `uuid` (PK)                | Unique identifier for the completion record                                                                   |
| `habit_id`              | `uuid` (FK to `habits`)    | The habit that was completed                                                                                  |
| `user_id`               | `uuid` (FK to `users`)     | User who completed the habit                                                                                  |
| `completed_at`          | `timestamp with time zone` | Exact timestamp of completion                                                                                 |
| `mood_score`            | `integer`                  | Mood score recorded during completion (0-100)                                                                 |
| `work_value`            | `numeric`                  | Quantitative work value achieved (e.g., 25 pages)                                                             |
| `goal_at_completion`    | `numeric`                  | The habit's `goal_value` at the moment of completion (for historical context)                                 |
| `duration_value`        | `numeric`                  | Duration of the activity                                                                                      |
| `duration_unit`         | `text`                     | Unit of duration (e.g., 'minutes', 'hours')                                                                   |
| `notes`                 | `text`                     | Free-form text notes for this specific completion                                                             |

**Todos Table:**
| Column           | Type                       | Description                                                     |
| :--------------- | :------------------------- | :-------------------------------------------------------------- |
| `todo_id`        | `uuid` (PK)                | Unique identifier for the todo                                  |
| `user_id`        | `uuid` (FK to `users`)     | Owner of the todo                                               |
| `parent_todo_id` | `uuid` (FK to `todos`)     | For 2-level sub-todos, references parent todo                   |
| `description`    | `text`                     | Description of the todo                                         |
| `is_public`      | `boolean`                  | Flag for public visibility                                      |
| `is_completed`   | `boolean`                  | Status of completion                                            |
| `created_at`     | `timestamp with time zone` | Timestamp of todo creation                                      |

### APIs and Interfaces

The primary API will be Supabase's auto-generated PostgREST API, providing RESTful access to the defined data models. Custom logic not covered by PostgREST will be exposed via Supabase Database Functions (PostgreSQL functions), which can be invoked directly from the client. All API interactions will adhere to a consistent JSON response format, returning data under a `data` key for success and an `error` object (with `message`, `code`, `details`) for failures.

**User & Profile Management APIs:**
*   `POST /auth/v1/magiclink`: Initiate Magic Link login (Supabase Auth).
*   `GET /{username}`: Retrieve public profile data.
*   `PUT /users/{user_id}`: Update user bio and `username`.
*   `public.check_username_uniqueness(p_username, text)`: Supabase DB Function to validate `username` uniqueness.

**Habit Management APIs:**
*   `GET /habits`: Retrieve all user habits.
*   `POST /habits`: Create a new habit.
*   `PUT /habits/{habit_id}`: Update habit details (name, public/private status, goal).
*   `DELETE /habits/{habit_id}`: Delete a habit (restricted to "The Pile" state via RLS/function).
*   `POST /habit_completions`: Record a habit completion with mood, work, duration, notes.
*   `POST /rpc/undo_habit_completion`: Supabase Function to undo habit completion and update streak.
*   `POST /rpc/process_grace_period`: Supabase Function to handle grace period logic and state changes.
*   `POST /rpc/enforce_two_day_rule`: Supabase Function to manage "Two-Day Rule" state transitions (`Lively`, `Junked`).

**Todo Management APIs:**
*   `GET /todos`: Retrieve all user todos.
*   `POST /todos`: Create a new todo (potentially with `parent_todo_id`).
*   `PUT /todos/{todo_id}`: Update todo description, public/private status, completion status.
*   `DELETE /todos/{todo_id}`: Delete a todo.

### Workflows and Sequencing

1.  **User Account Creation & Profile Setup:**
    *   User initiates Magic Link login (client calls Supabase Auth).
    *   Upon successful authentication, `user_id` is established.
    *   User configures `username` and `bio` via UI.
    *   Client calls `check_username_uniqueness` (Supabase DB Function) to validate `username`.
    *   Client calls `PUT /users/{user_id}` to update profile.

2.  **Habit Creation:**
    *   User types habit name in "The Pile" UI.
    *   User optionally clicks `+ Add Goal`, inputs `goal_value` and `goal_unit`.
    *   Client calls `POST /habits` to create new habit.

3.  **Habit Completion:**
    *   User moves habit to "Today" column (client-side UI update).
    *   Completion modal triggers (client-side).
    *   User inputs `mood_score`, `work_value`, `duration`, `notes`.
    *   Client calls `POST /habit_completions` to record completion.
    *   Client updates habit's `current_streak`, `last_recorded_mood`, `last_recorded_work_value`, `last_recorded_work_unit` via `PUT /habits/{habit_id}`.

4.  **Daily State Change & Grace Period (Client-Side Triggered, Server-Side Logic):**
    *   At 12:00 AM local time, on app open, client checks `grace_screen_shown_for_date`.
    *   If `grace_screen_shown_for_date` is before current date and pending habits exist from yesterday:
        *   Client displays Grace Period screen.
        *   User interacts with Grace Period (marks habits complete for yesterday).
        *   Client calls `POST /rpc/process_grace_period` (Supabase Function) with user's actions.
    *   Regardless of Grace Period, the client (or a scheduled Supabase Function) calls `POST /rpc/enforce_two_day_rule` to manage `Lively` and `Junked` states for habits in "The Pile".

5.  **"Two-Day Rule" Enforcement (Supabase Function `enforce_two_day_rule`):**
    *   Identifies habits in "Yesterday" not completed.
    *   Moves them to "The Pile" and sets `pile_state = 'Lively'`.
    *   After 24 hours in 'Lively' state, transitions to `pile_state = 'Junked'`, resets `current_streak`, and sets `last_streak`.

6.  **Undo Habit Completion:**
    *   User long-presses a habit in "Today" (client-side).
    *   Client calls `POST /rpc/undo_habit_completion` (Supabase Function).
    *   Function reverts `current_streak`, moves habit back to "Yesterday" or "The Pile" based on original state.

7.  **Todo Management:**
    *   User creates/edits/completes/deletes todos via UI.
    *   Client calls `GET`, `POST`, `PUT`, `DELETE` operations on `/todos` endpoint.

## Non-Functional Requirements

### Performance

*   **Public Profile Load Time (NFR-1.1):** Public profile pages will achieve fast load times, especially on mobile and in-app browsers, through Next.js's SSR/SSG capabilities, image optimization, code splitting, lazy loading, and Vercel's CDN caching and edge deployments.
*   **Real-time Data Synchronization (NFR-1.2):** The real-time data synchronization will be efficient with low latency, utilizing Supabase Realtime and optimized database queries, ensuring it does not degrade overall application performance. Client-side caching and optimistic UI updates will enhance perceived performance.

### Security

*   **Authentication (NFR-2.1):** Supabase Auth will securely implement Magic Link authentication, ensuring single-use tokens with short expiry times.
*   **Authorization (NFR-2.2):** Strict separation of public and private data will be enforced using PostgreSQL Row Level Security (RLS) at the database level, preventing unauthorized access and data leakage.
*   **Data Encryption:** Data at rest in Supabase PostgreSQL will be encrypted, and data in transit will be secured with TLS/SSL.
*   **API Security:** Supabase's PostgREST API will be secured via JWTs issued by Supabase Auth.
*   **Server-Side Validation:** Critical business logic within Supabase Database Functions will prevent client-side manipulation and maintain data integrity.
*   **Public ID Security:** Reserved system slugs will be enforced to prevent routing conflicts.

### Reliability/Availability

The application will leverage the inherent reliability of managed services like Supabase (PostgreSQL, Auth, Realtime) and Vercel (deployment). Supabase Database Functions will enforce critical business rules server-side, contributing to data integrity and consistent application behavior. The architecture is designed for high availability through these cloud-native platforms.

### Observability

*   **Error Reporting:** Frontend errors will be captured by Sentry, while backend errors will be logged in Supabase. Critical alerts will be forwarded to a Lark chat webhook.
*   **Structured Logging:** Structured logging with standard levels (DEBUG, INFO, WARN, ERROR, FATAL) will be implemented across the application to ensure maintainability, debuggability, and centralized visibility of application health.

## Dependencies and Integrations

**Frontend Dependencies:**
*   **Next.js (v16.0.2):** React framework for building the SPA.
*   **React (v19.2.0), React-DOM (v19.2.0):** Core UI library.
*   **TypeScript (v5):** Statically typed superset of JavaScript.
*   **Tailwind CSS (v4):** Utility-first CSS framework for styling.
*   **`@radix-ui/react-*` (various versions):** Headless UI components (e.g., `alert-dialog`, `dialog`, `label`, `select`, `slot`, `switch`).
*   **`lucide-react` (v0.553.0):** Icon library.
*   **`class-variance-authority` (v0.7.1), `clsx` (v2.1.1), `tailwind-merge` (v3.4.0), `tailwindcss-animate` (v1.0.7), `tw-animate-css` (v1.4.0):** Utilities for managing CSS classes and animations.
*   **`next-themes` (v0.4.6):** Theme management for Next.js.
*   **`motion` (v12.23.24), `cobe` (v0.6.5):** Animation libraries (Aceternity UI likely builds on these).
*   **`zustand` (v5.0.8):** State management library.
*   **`react-hot-toast` (v2.6.0):** For toast notifications.

**Backend/Data Dependencies:**
*   **`@supabase/supabase-js` (v2.81.1), `@supabase/ssr` (v0.7.0):** Supabase client libraries for interacting with the backend.
*   **Supabase (Managed Service):** PostgreSQL database, Authentication (Magic Link), Realtime, PostgREST API, Database Functions.

**Development Dependencies:**
*   **Vitest (v4.0.8), `@testing-library/jest-dom` (v6.9.1), `@testing-library/react` (v16.3.0), `jsdom` (v27.2.0):** Unit and integration testing frameworks.
*   **Playwright (v1.56.1):** End-to-end testing framework.
*   **ESLint (v9), `eslint-config-next`:** Linting for code quality.
*   **`tsconfig-paths` (v4.2.0):** For path aliases in TypeScript.

**Integrations:**
*   **Vercel:** Deployment platform for Next.js application.
*   **GitHub Actions:** For Continuous Integration and Continuous Deployment (CI/CD).

## Acceptance Criteria (Authoritative)

1.  **FR-1.1 - User Account Creation:** User can successfully create an account using a Magic Link sent to their email.
2.  **FR-1.2 - Login/Logout:** User can log in and log out of the application.
3.  **FR-1.3 - Bio Editing:** User can edit and save their profile biography.
4.  **FR-1.4 - Public ID Configuration:** User can configure a unique public ID (slug) consisting of alphanumeric characters, hyphens, and underscores. The system validates uniqueness.
5.  **FR-1.5 - Public Profile Display:** A user's public profile page (`/[username]`) displays their bio, all public habits and their streaks, all public todos, and the complete, searchable Public Journal.
6.  **FR-2.1 - Habit Creation:** User can create a new habit with a name via an inline input in "The Pile". Optionally, a quantitative goal can be set (number and unit) before creation. New habits default to 'Public' and start with 0 streak.
7.  **FR-2.2 - Habit Privacy Toggle:** User can mark a habit as "public" or "private" during creation or editing.
8.  **FR-2.3 - Habit Editing:** User can edit an existing habit's name and public/private status.
9.  **FR-2.4 - Habit Deletion:** User can delete a habit only when it is in "The Pile" column.
10. **FR-2.5 - Streak Counter Display:** Each habit chip displays a visible streak counter badge.
11. **FR-2.6 - Quantitative Goal Setting:** User can set and modify a quantitative goal for a habit, consisting of a number and a unit from a predefined list or a custom unit.
12. **FR-2.7 - Goal Change Streak Continuity:** When a habit's goal is changed, the existing streak continues uninterrupted, with the new goal applying from the moment of change.
13. **FR-2.8 - Broad/Atomic Habit Support:** The system supports logging details for broad habits within the completion flow without requiring separate habit definitions.
14. **FR-3.1 - Todo Creation:** User can create new todos with text descriptions, including 2-level deep sub-todos using the `Tab` key.
15. **FR-3.2 - Todo Privacy Toggle:** User can mark a todo as "public" or "private" via a `🌐/🔒` toggle on hover.
16. **FR-3.3 - Todo Completion:** User can mark a todo as complete.
17. **FR-3.4 - Todo Deletion:** User can delete a todo.
18. **FR-4.1 - Main UI Layout (Desktop):** The main UI displays "Today", "Yesterday" side-by-side on the top row and "The Pile" full-width on the bottom row, with drag-and-drop for habits.
19. **FR-4.1 - Main UI Layout (Mobile):** The main UI displays "Today", then "Yesterday", then "The Pile" stacked vertically, with tap-to-move for habits.
20. **FR-4.1 - Column Sorting:** All columns sort habit chips by public first, then highest streak (desc), then name (asc). "The Pile" sorts by "Lively" first, then Public, then highest last streak (desc), then name (asc).
21. **FR-4.2 - Daily State Change:** At 12:00 am (user's local timezone), habits completed the previous day appear in the "Yesterday" column.
22. **FR-4.3 - Yesterday to Today Move:** User can move a habit from "Yesterday" to "Today" to mark it complete for the current day and continue its streak.
23. **FR-4.4 - Grace Period Trigger:** If the app is opened on a new day with pending habits from the *immediately preceding* day, the "End of Day Summary" screen is presented.
24. **FR-4.4.1 - Grace Period Completion:** User can mark pending habits from the previous day as complete on the summary screen.
25. **FR-4.4.2 - Grace Period Add Habit:** User can add new or existing habits to the previous day's record from the summary screen.
26. **FR-4.4.3 - Grace Period Confirmation:** After confirming the summary, the daily state change cycle runs with the corrected data.
27. **FR-4.5 - Two-Day Rule (True):** A habit's streak is only broken after two consecutive missed days.
28. **FR-4.6 - Miss Day 1 ("Lively" State):** If a habit in "Yesterday" is not completed, it moves to "The Pile" at midnight and enters a "Lively" state for 24 hours.
29. **FR-4.6.1 - Lively Habit Streak Continuity:** Moving a "Lively" habit to "Today" continues its original streak uninterrupted.
30. **FR-4.7 - Miss Day 2 ("Junked" State):** If a "Lively" habit is not rescued within 24 hours, it transitions to a permanent "Junked" state.
31. **FR-4.7.1 - Junked Habit Streak Reset:** When a habit becomes "Junked", its `current_streak` is reset to zero, and `last_streak` saves the previous value.
32. **FR-4.7.2 - Junked Habit New Streak:** Moving a "Junked" habit to "Today" resets its streak to 1.
33. **FR-4.8 - Junked Days Counter:** "Junked" habits display a counter indicating days neglected (e.g., "-7").
34. **FR-4.9 - Yesterday Read-Only:** Habits in the 'Yesterday' column cannot be deleted or edited.
35. **FR-4.10 - Undo Completion:** Long-pressing a habit in 'Today' allows undoing completion, reverting streak and moving the habit to "Yesterday" (if streak > 1) or "The Pile" (if streak was 1).
36. **FR-6.3 - SPA Functionality:** The application functions as a Single Page Application (SPA), providing fluid user experience without full-page reloads.
37. **FR-6.4 - Theme Switcher:** The application includes a prominent theme switcher for light ("Zenith") and dark ("Monolith") themes.
38. **FR-7.1 - Positive Urgency UI:** The 'Yesterday' column features an "Ambient Animated Background" with a slow, shifting gradient, and a tooltip on hover displays time remaining.

## Traceability Mapping

| AC # | Acceptance Criteria                                                                                                                                                                                              | Spec Section(s)                      | Component(s)/API(s)                                                                                                                          | Test Idea                                                                                               |
|:-----|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:-------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------|
| 1    | User can successfully create an account using a Magic Link sent to their email.                                                                                                                                  | FR-1.1                               | `Supabase Auth`, `app/(auth)/logins`, `Auth.tsx`                                                                                             | E2E: User completes Magic Link signup flow.                                                             |
| 2    | User can log in and log out of the application.                                                                                                                                                                  | FR-1.2                               | `Supabase Auth`, `app/(auth)/logins`, `Auth.tsx`, `LogoutButton.tsx`                                                                         | E2E: User logs in with valid credentials, logs out.                                                     |
| 3    | User can edit and save their profile biography.                                                                                                                                                                  | FR-1.3                               | `EditBioForm.tsx`, `PUT /users/{user_id}`                                                                                                    | Unit: `EditBioForm` state updates on input. E2E: User updates bio, change persists.                     |
| 4    | User can configure a unique public ID (slug) consisting of alphanumeric characters, hyphens, and underscores. The system validates uniqueness.                                                                   | FR-1.4, `architecture.md` (ADR 017)  | `EditBioForm.tsx`, `PUT /users/{user_id}`, `POST /rpc/check_username_uniqueness`                                                             | E2E: User sets valid unique public ID. E2E: User attempts to set invalid/non-unique ID, receives error. |
| 5    | A user's public profile page (`/[username]`) displays their bio, all public habits and their streaks, all public todos, and the complete, searchable Public Journal.                                             | FR-1.5, `architecture.md` (ADR 017)  | `[username]/page.tsx`, `PublicPage.tsx`, `GET /users`, `GET /habits`, `GET /todos`, `GET /journal_entries` (with RLS for public data) | E2E: View another user's public profile, verify displayed data.                                         |
| 6    | User can create a new habit with a name via an inline input in "The Pile". Optionally, a quantitative goal can be set (number and unit) before creation. New habits default to 'Public' and start with 0 streak. | FR-2.1                               | `HabitCreator.tsx`, `POST /habits`                                                                                                           | E2E: Create habit with name only. E2E: Create habit with name and goal.                                 |
| 7    | User can mark a habit as "public" or "private" during creation or editing.                                                                                                                                       | FR-2.2                               | `HabitCreator.tsx`, `EditHabitModal.tsx`, `POST /habits`, `PUT /habits/{habit_id}`                                                           | E2E: Create a private habit. E2E: Edit habit to change privacy.                                         |
| 8    | User can edit an existing habit's name and public/private status.                                                                                                                                                | FR-2.3                               | `EditHabitModal.tsx`, `PUT /habits/{habit_id}`                                                                                               | E2E: Edit habit name.                                                                                   |
| 9    | User can delete a habit only when it is in "The Pile" column.                                                                                                                                                    | FR-2.4                               | `HabitCard.tsx`, `DELETE /habits/{habit_id}` (RLS/function prevents deletion from other columns)                                             | E2E: Delete habit from The Pile. E2E: Attempt to delete habit from Today/Yesterday (should fail).       |
| 10   | Each habit chip displays a visible streak counter badge.                                                                                                                                                         | FR-2.5                               | `HabitCard.tsx`                                                                                                                              | UI: Verify streak counter visible on `HabitCard`.                                                       |
| 11   | User can set and modify a quantitative goal for a habit, consisting of a number and a unit from a predefined list or a custom unit.                                                                              | FR-2.6                               | `HabitCreator.tsx`, `EditHabitModal.tsx`, `PUT /habits/{habit_id}`                                                                           | E2E: Set new quantitative goal. E2E: Modify existing goal.                                              |
| 12   | When a habit's goal is changed, the existing streak continues uninterrupted, with the new goal applying from the moment of change.                                                                               | FR-2.7                               | `PUT /habits/{habit_id}` (server-side logic)                                                                                                 | E2E: Change goal for habit with existing streak, ensure streak persists.                                |
| 13   | The system supports logging details for broad habits within the completion flow without requiring separate habit definitions.                                                                                    | FR-2.8                               | Completion Modal (Future story), `POST /habit_completions`                                                                                   | E2E: (Future) Log details for a broad habit.                                                            |
| 14   | User can create new todos with text descriptions, including 2-level deep sub-todos using the `Tab` key.                                                                                                          | FR-3.1                               | Todo input component, `POST /todos`                                                                                                          | E2E: Create top-level todo. E2E: Create 2-level sub-todo.                                               |
| 15   | User can mark a todo as "public" or "private" via a `🌐/🔒` toggle on hover.                                                                                                                                     | FR-3.2                               | Todo component, `PUT /todos/{todo_id}`                                                                                                       | E2E: Create public/private todo. E2E: Change todo privacy.                                              |
| 16   | User can mark a todo as complete.                                                                                                                                                                                | FR-3.3                               | Todo component, `PUT /todos/{todo_id}`                                                                                                       | E2E: Mark todo as complete.                                                                             |
| 17   | User can delete a todo.                                                                                                                                                                                          | FR-3.4                               | Todo component, `DELETE /todos/{todo_id}`                                                                                                    | E2E: Delete todo.                                                                                       |
| 18   | The main UI displays "Today", "Yesterday" side-by-side on the top row and "The Pile" full-width on the bottom row, with drag-and-drop for habits.                                                                | FR-4.1, `ux-design-specification.md` | `app/(main)/dashboard/page.tsx` (desktop layout)                                                                                             | E2E: Verify desktop layout. E2E: Drag habit from Today to Yesterday.                                    |
| 19   | The main UI displays "Today", then "Yesterday", then "The Pile" stacked vertically, with tap-to-move for habits.                                                                                                 | FR-4.1, `ux-design-specification.md` | `app/(main)/dashboard/page.tsx` (mobile layout)                                                                                              | E2E: Verify mobile layout. E2E: Tap-to-move habit from Today to Yesterday.                              |
| 20   | All columns sort habit chips by public first, then highest streak (desc), then name (asc). "The Pile" sorts by "Lively" first, then Public, then highest last streak (desc), then name (asc).                    | FR-4.1                               | Client-side sorting logic, `GET /habits` (with potential server-side ordering)                                                               | E2E: Verify sorting in all columns.                                                                     |
| 21   | At 12:00 am (user's local timezone), habits completed the previous day appear in the "Yesterday" column.                                                                                                         | FR-4.2                               | Client-side date check, Supabase Functions (`process_grace_period`, `enforce_two_day_rule`)                                                  | E2E: Simulate daily rollover, verify habits move.                                                       |
| 22   | User can move a habit from "Yesterday" to "Today" to mark it complete for the current day and continue its streak.                                                                                               | FR-4.3                               | Client-side UI interaction, `POST /habit_completions`                                                                                        | E2E: Move habit from Yesterday to Today, verify streak update.                                          |
| 23   | If the app is opened on a new day with pending habits from the *immediately preceding* day, the "End of Day Summary" screen is presented.                                                                        | FR-4.4, `architecture.md` (ADR 007)  | `app/(main)/grace-period/page.tsx`, client-side trigger, Supabase Function (`process_grace_period`)                                          | E2E: Simulate missed habits from yesterday, open app, verify Grace Period screen appears.               |
| 24   | User can mark pending habits from the previous day as complete on the summary screen.                                                                                                                            | FR-4.4.1                             | `app/(main)/grace-period/page.tsx`, `POST /rpc/process_grace_period`                                                                         | E2E: Mark yesterday's habits complete via Grace Period screen.                                          |
| 25   | User can add new or existing habits to the previous day's record from the summary screen.                                                                                                                        | FR-4.4.2                             | `app/(main)/grace-period/page.tsx`, `POST /rpc/process_grace_period`                                                                         | E2E: Add habit for yesterday via Grace Period screen.                                                   |
| 26   | After confirming the summary, the daily state change cycle runs with the corrected data.                                                                                                                         | FR-4.4.3                             | `app/(main)/grace-period/page.tsx`, `POST /rpc/process_grace_period`                                                                         | E2E: Confirm Grace Period, verify daily state update.                                                   |
| 27   | A habit's streak is only broken after two consecutive missed days.                                                                                                                                               | FR-4.5, `architecture.md` (ADR 007)  | Supabase Function (`enforce_two_day_rule`)                                                                                                   | E2E: Simulate two consecutive missed days, verify streak breaks.                                        |
| 28   | If a habit in "Yesterday" is not completed, it moves to "The Pile" at midnight and enters a "Lively" state for 24 hours.                                                                                         | FR-4.6, `architecture.md` (ADR 007)  | Supabase Function (`enforce_two_day_rule`)                                                                                                   | E2E: Simulate missed habit, verify 'Lively' state in The Pile.                                          |
| 29   | Moving a "Lively" habit to "Today" continues its original streak uninterrupted.                                                                                                                                  | FR-4.6.1                             | Client-side UI interaction, `POST /habit_completions` (with server-side streak check)                                                        | E2E: Move 'Lively' habit to Today, verify streak continuity.                                            |
| 30   | If a "Lively" habit is not rescued within 24 hours, it transitions to a permanent "Junked" state.                                                                                                                | FR-4.7, `architecture.md` (ADR 007)  | Supabase Function (`enforce_two_day_rule`)                                                                                                   | E2E: Simulate 'Lively' habit un-rescued, verify 'Junked' state.                                         |
| 31   | When a habit becomes "Junked", its `current_streak` is reset to zero, and `last_streak` saves the previous value.                                                                                                | FR-4.7.1                             | Supabase Function (`enforce_two_day_rule`)                                                                                                   | E2E: Verify streak reset and `last_streak` saved for 'Junked' habit.                                    |
| 32   | Moving a "Junked" habit to "Today" resets its streak to 1.                                                                                                                                                       | FR-4.7.2                             | Client-side UI interaction, `POST /habit_completions` (with server-side streak reset)                                                        | E2E: Move 'Junked' habit to Today, verify streak resets to 1.                                           |
| 33   | "Junked" habits display a counter indicating days neglected (e.g., "-7").                                                                                                                                        | FR-4.8                               | `HabitCard.tsx` (client-side calculation/display)                                                                                            | UI: Verify 'Junked Days Counter' is displayed.                                                          |
| 34   | Habits in the 'Yesterday' column cannot be deleted or edited.                                                                                                                                                    | FR-4.9                               | Client-side UI logic, RLS/function on `DELETE /habits`, `PUT /habits`                                                                        | E2E: Attempt to delete/edit habit in Yesterday (should fail).                                           |
| 35   | Long-pressing a habit in 'Today' allows undoing completion, reverting streak and moving the habit to "Yesterday" (if streak > 1) or "The Pile" (if streak was 1).                                                | FR-4.10                              | Client-side UI interaction, `POST /rpc/undo_habit_completion`                                                                                | E2E: Undo completion of a habit, verify state transition.                                               |
| 36   | The application functions as a Single Page Application (SPA), providing fluid user experience without full-page reloads.                                                                                         | FR-6.3                               | Next.js App Router                                                                                                                           | E2E: Navigate between pages, verify no full page reloads.                                               |
| 37   | The application includes a prominent theme switcher for light ("Zenith") and dark ("Monolith") themes.                                                                                                           | FR-6.4, `ux-design-specification.md` | `AnimatedThemeToggler.tsx`, `next-themes`                                                                                                    | UI: Toggle theme switcher, verify theme changes.                                                        |
| 38   | The 'Yesterday' column features an "Ambient Animated Background" with a slow, shifting gradient, and a tooltip on hover displays time remaining.                                                                 | FR-7.1, `ux-design-specification.md` | `app/(main)/dashboard/page.tsx` (Yesterday column component), CSS animations                                                                 | UI: Verify animated background and tooltip on hover in 'Yesterday' column.                              |

## Risks, Assumptions, Open Questions

**Risks:**
*   **Complexity of Novel UX Patterns:** Implementing features like the "Positive Urgency UI" and the nuances of the "Two-Day Rule" and "Grace Period" logic, especially across client-side and Supabase Database Functions, may introduce unexpected complexity and bugs.
*   **Performance Bottlenecks with Supabase:** While Supabase is scalable, inefficient database queries or excessive real-time subscriptions could lead to performance issues, particularly for "The Pile" column with complex sorting logic or public profiles with high traffic.
*   **Security Vulnerabilities in RLS:** Incorrectly configured Row Level Security policies could lead to unauthorized data access, despite the robust nature of RLS. Thorough testing is critical.
*   **Client-Side Timezone Dependence:** Relying on client-side timezones for initiating daily state changes and Grace Period could lead to inconsistencies if not handled robustly, especially with users changing timezones or manipulating client-side clocks.
*   **Reserved Slugs Conflicts:** Ensuring comprehensive prevention of `username` conflicts with system routes (e.g., `/auth`, `/me`) requires careful management to avoid routing issues.

**Assumptions:**
*   **Supabase Free Tier Scalability:** The current Supabase free tier will be sufficient for MVP development and initial user load.
*   **Next.js App Router Maturity:** The Next.js App Router is sufficiently mature and stable for building complex SPAs, and its conventions will streamline development.
*   **Shadcn/UI & Aceternity UI Integration:** Integration of `shadcn/ui` and `Aceternity UI` will be straightforward and provide the desired aesthetic and functionality without significant customization effort.
*   **User Timezone Consistency:** Users will either not frequently change their device's timezone or the application will handle such changes gracefully without data inconsistencies.
*   **API Rate Limits:** Supabase API rate limits will be adequate for the planned usage patterns within this epic.

**Open Questions:**
*   How will the "Intelligent Notepad" for Todos (FR-3.1) handle rich text formatting or markdown? (Currently assumed plain text).
*   What is the specific behavior and UI for adding a new or existing habit to the previous day's record within the "Grace Period" screen (FR-4.4.2)?
*   Are there any specific accessibility requirements beyond WCAG 2.1 Level AA for keyboard navigation for specific components?
*   How will `goal_at_completion` be used for historical analysis or reporting? (Beyond current storage).
*   What is the error handling strategy for Supabase Database Functions specifically for user-facing errors vs. internal logging?

## Test Strategy Summary

The test strategy for Epic-1 will focus on ensuring the stability and correctness of core functional requirements and critical data flows, aligning with the pragmatic MVP approach.

*   **Unit Tests (Vitest & React Testing Library):**
    *   **Scope:** Individual utility functions (e.g., date/time calculations, sorting logic), isolated React components (e.g., `HabitCard`, `HabitCreator`, `EditBioForm`).
    *   **Focus:** Verifying the correctness of algorithms, component rendering, and isolated state changes.
*   **Integration Tests (Vitest):**
    *   **Scope:** Interactions between frontend components and Supabase client, Supabase Database Functions in isolation, and data layer operations.
    *   **Focus:** Ensuring data is correctly persisted and retrieved, API contracts are met, and server-side logic (e.g., Two-Day Rule enforcement, Grace Period processing) behaves as expected.
*   **End-to-End (E2E) Tests (Playwright):**
    *   **Scope:** Critical user journeys, including user signup, login/logout, habit creation, habit completion, updating public profile, and navigating core UI sections.
    *   **Focus:** Validating that the entire application flow works seamlessly from a user's perspective, covering both happy paths and key error scenarios (e.g., invalid public ID). Special attention will be given to the "Grace Period" and "Two-Day Rule" transitions.
*   **CI/CD Integration:** All unit, integration, and E2E tests will be integrated into GitHub Actions to ensure automated validation on every code change.
*   **Manual Testing:** Extensive manual testing will be performed, particularly for the novel UX patterns (e.g., "Positive Urgency UI") and responsive layouts, which are difficult to fully automate.
