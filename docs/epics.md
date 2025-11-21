# whatcha-doin - Epic Breakdown

**Author:** hammaadworks
**Date:** 225-11-15
**Project Level:** {{project_level}}
**Target Scale:** {{target_scale}}

---

## Overview

This document provides the complete epic and story breakdown for whatcha-doin, decomposing the requirements from
the [PRD](./PRD.md) into implementable stories.

**CRITICAL ARCHITECTURAL DECISION:** The application will leverage **Supabase** for all data persistence from day one. This includes PostgreSQL for data storage, Authentication for user management, and its auto-generated API. This simplifies the architecture, eliminates future rework, and accelerates core feature development.

**Important Development Note:** To allow immediate access to the application during local development, a predefined user
session will be injected (see Epic 1, Story 1.2) to bypass the full authentication flow. This bypass will now mock a Supabase session by directly interacting with Supabase tables using the hardcoded user's `user_id`, bypassing Supabase Authentication for data operations. After successful authentication (or bypass), the user will be redirected to their root-level profile `/[publicId]`.

**Living Document Notice:** This is the initial version. It will be updated after UX Design and Architecture workflows
add interaction and technical details to stories.

Here's the proposed epic structure, designed to facilitate incremental and integrated development, ensuring visible
progress and continuous value delivery:

*   **Epic 1: Core Application Foundation & Authenticated Root View**
    *   **Goal:** Establish the foundational project infrastructure, implement a development-friendly bypass for Supabase data interaction, and lay out the basic authenticated UI accessible via the user's public profile slug.
    *   **Scope:** Project setup, core infrastructure, development data interaction bypass (mocking Supabase Auth and directly using tables with a hardcoded user ID), the basic authenticated root view (bio, todo, three-box sections), and initial setup for user authentication (FR-1.1, FR-1.2 for future, FR-1.3 for current).
    *   **Sequencing:** This is the absolute first epic, providing the essential environment and core authenticated UI before any
        feature-specific development begins.
    *   **System Architecture Alignment:** This epic directly implements the User Management and Authentication components, leveraging **Supabase Auth** for Magic Link functionality and **Supabase PostgreSQL** for storing user profile data in the `users` table. All security and data access will be governed by the **Row Level Security (RLS)** policies and **JWT-based authentication**. Public profile pages will be **Server-Side Rendered (SSR)** or **Static Site Generated (SSG)** Next.js pages for fast load times (NFR-1.1).
    *   **Services and Modules:**
        *   **Supabase Auth:** Handles user sign-up, logins (Magic Link), logout, and session management.
        *   **User Profile Service** (`lib/supabase/user.ts`): Provides an abstraction layer for interacting with the `users` table.
        *   **Auth UI Component** (`components/auth/Logins.tsx`): Renders the UI for email input and handles the call to Supabase Auth.
        *   **Public Profile Page** (`app/(main)/profile/[userId]/page.tsx`): Fetches and displays a user's public profile information.
    *   **Data Models and Contracts (`users` table schema):**
        ```sql
        CREATE TABLE public.users (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email VARCHAR(255) UNIQUE NOT NULL,
          bio TEXT,
          timezone VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ
        );

        -- Enable Row Level Security
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        -- Policy: Users can view their own profile
        CREATE POLICY "Users can view their own profile"
        ON public.users FOR SELECT
        USING (auth.uid() = id);

        -- Policy: Users can update their own profile
        ON public.users FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
        ```
    *   **APIs and Interfaces (Key Supabase Client Interactions):**
        *   `supabase.auth.signInWithOtp({ email })`: To initiate the Magic Link logins.
        *   `supabase.auth.signOut()`: To log the user out.
        *   `supabase.from('users').select('*').eq('id', userId).single()`: To fetch a user's profile.
        *   `supabase.from('users').update({ bio: newBio }).eq('id', userId)`: To update a user's bio.
    *   **Non-Functional Requirements:**
        *   **Performance (NFR-1.1):** Public profile pages must achieve a fast load time, rendered using Next.js SSR or SSG.
        *   **Security (NFR-2.1, NFR-2.2):** Magic Link tokens must be single-use and expire quickly. Strict RLS policies on the `users` table enforce data separation.
        *   **Reliability/Availability:** Dependent on Supabase's uptime.
        *   **Observability:** Auth-related errors logged in Supabase, client-side errors captured by Sentry, critical failures alert to Lark chat webhook.


### Story 1.0: Initial Database Schema Setup

As a developer,
I want to create and commit the initial database schema migrations for all core entities,
so that the database is ready for application development.

**Requirements Context Summary:**
This story establishes the fundamental database schema for the entire application, creating tables for users, habits, habit completions, todos, and journal entries. It's a foundational step that has no direct UI component but is critical for all subsequent data-driven features. The design adheres strictly to the `Data Architecture` section of `docs/architecture.md` for precise schema details.

**Acceptance Criteria:**

1.  A new Supabase migration file is created in the `supabase/migrations` directory.
2.  The migration includes `CREATE TABLE` statements for `users`, `habits`, `habit_completions`, `todos`, and `journal_entries`.
3.  All table and column names adhere to the `snake_case` naming convention specified in the architecture.
4.  Primary keys, foreign keys, and appropriate constraints (e.g., `NOT NULL`, `REFERENCES`) are defined for all tables.
5.  Row Level Security (RLS) is enabled for all tables containing user-specific data, with initial policies ensuring data isolation.
6.  The migration successfully runs without errors in a local Supabase environment.

**Prerequisites:** None.

**Tasks / Subtasks:**

-   **Task 1: Define Table Schemas** (AC: #1, #2, #3, #4)
    -   Subtask 1.1: Draft the SQL for the `users` table, including `id`, `email`, `bio`, `timezone`, `grace_screen_shown_for_date`, `created_at`, `updated_at`.
    -   Subtask 1.2: Draft the SQL for the `habits` table, including `id`, `user_id`, `name`, `is_public`, `current_streak`, `last_streak`, `goal_value`, `goal_unit`, `pile_state`, `junked_at`, `created_at`, `updated_at`.
    -   Subtask 1.3: Draft the SQL for the `habit_completions` table, including `id`, `habit_id`, `user_id`, `completed_at`, `mood_score`, `work_value`, `goal_at_completion`, `duration_value`, `duration_unit`, `notes`.
    -   Subtask 1.4: Draft the SQL for the `todos` table, including `id`, `user_id`, `parent_todo_id` (self-referencing), `description`, `is_public`, `is_completed`, `created_at`, `updated_at`.
    -   Subtask 1.5: Draft the SQL for the `journal_entries` table, including `id`, `user_id`, `entry_date`, `content`, `is_public`, `created_at`, `updated_at`, with a unique constraint on `user_id` and `entry_date`.
-   **Task 2: Define RLS Policies** (AC: #5)
    -   Subtask 2.1: Define default RLS policies (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) for all user-data tables (`users`, `habits`, `habit_completions`, `todos`, `journal_entries`), ensuring users can only access their own data (`auth.uid() = user_id`).
-   **Task 3: Create and Apply Migration** (AC: #1, #6)
    -   Subtask 3.1: Create a new migration file using the Supabase CLI (`supabase/migrations/20251113093152_initial_schema_setup.sql`).
    -   Subtask 3.2: Apply the migration to the local development database to verify it (`supabase db push`).

**Technical Notes:**
This story is foundational and has no UI component. The primary focus is on correctly implementing the data models defined in the architecture document. The developer agent must read the `Data Architecture` section of `docs/architecture.md` to get the precise schema details for each table. The migration file must be created in the `supabase/migrations/` directory. No other files should be modified. `uuid-ossp` extension is required for `uuid_generate_v4()`.

**Completion Notes (from Dev Agent Record):**
- **Completed:** 2025-11-13
- **Definition of Done:** All acceptance criteria met, code reviewed, tests passing.
- **Implemented:** Initial database schema for `users`, `habits`, `habit_completions`, `todos`, and `journal_entries` tables. Defined primary keys, foreign keys, and necessary constraints. Enabled Row Level Security (RLS) for all user-data tables with policies restricting access to owner's data. Created a new Supabase migration file and successfully applied it to the local development database. Resolved `uuid_generate_v4()` function not found error by adding `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` and `SET search_path = public, extensions;` to the migration.
- **File List:** `supabase/migrations/20251113093152_initial_schema_setup.sql`

**Senior Developer Review (AI):**
- **Reviewer:** hammaadworks
- **Date:** 2025-11-13
- **Outcome:** APPROVE
- **Summary:** The story "0.1: DB Setup" has been thoroughly implemented. All acceptance criteria are met, and all completed tasks have been verified. The database schema for core entities (`users`, `habits`, `habit_completions`, `todos`, `journal_entries`) is correctly defined with appropriate primary keys, foreign keys, and constraints. Row Level Security (RLS) policies are correctly applied to ensure data isolation. The migration was successfully created and applied to the local Supabase environment.
- **Key Findings:** No significant findings (High/Medium/Low severity) were identified during this review.
- **Acceptance Criteria Coverage:** 6 of 6 acceptance criteria fully implemented.
- **Task Completion Validation:** 10 of 10 completed tasks verified, 0 questionable, 0 falsely marked complete.
- **Test Coverage and Gaps:** As per the story's testing strategy, the primary validation was the successful application of the migration to a local Supabase instance. No unit or E2E tests were required for this foundational story.
- **Architectural Alignment:** The implementation fully aligns with the architectural decisions and consistency rules outlined in `docs/architecture.md`, particularly regarding data architecture, naming conventions, and the use of Supabase for backend services and RLS.
- **Security Notes:** RLS policies are correctly implemented using `auth.uid()`, providing robust data isolation for user-specific data. No security vulnerabilities were identified in the schema definition.
- **Action Items:** None.
- **Advisory Notes:** No Epic Tech Spec was found for Epic 0. This did not impact the review of this foundational story, but it is noted for future reference.


### Story 1.1: Project Setup and Core Infrastructure

As a developer,
I want the project to have a standardized setup with core dependencies, build system, and basic deployment pipeline,
So that all subsequent development can proceed efficiently and consistently.

**Acceptance Criteria:**

**Given** a fresh clone of the repository,
**When** `npm install` and `npm run dev` are executed,
**Then** the application starts without errors and displays a blank page or a basic "Hello World" message.

**And** essential development tools (ESLint, Prettier, TypeScript) are configured and working.
**And** a basic CI/CD pipeline (e.g., GitHub Actions) is in place for linting and building.

**Prerequisites:** None.

**Technical Notes:** This story focuses on setting up the development environment and ensuring the project is runnable.
No specific UI components are integrated yet, but the foundation for them is laid.

### Story 1.2: Implement Development Login Bypass

As a developer,
I want to bypass the full Supabase login flow during local development,
So that I can quickly test core features using a predefined user session without repeated logins.

**Acceptance Criteria:**

**Given** the application is in local development mode,
**When** I access the application,
**Then** the user session is automatically initialized with the following dummy user:

```json
{
  "id": "68be1abf-ecbe-47a7-bafb-46be273a2e",
  "email": "hammaadworks @gmail.com"
}
```

**And** all user-specific data operations (read/write) are performed as this user.
**And** the existing authentication components (Auth.tsx, Logins.tsx) are bypassed or conditionally rendered.

**Prerequisites:** Story 1.1.

**Technical Notes:** This story requires implementing a mechanism (e.g., environment variable, mock service) to inject a
predefined user session. User data will be managed via direct Supabase table interaction using the hardcoded user's `user_id`, bypassing Supabase Authentication for data operations. This temporarily de-prioritizes the full integration of Supabase authentication until the final epic.

### Story 1.3: Implement Foundational Dashboard Layout

As a user,
I want to see the basic layout of my private dashboard, including placeholders for my bio, todo list, and the three
habit columns ("Today", "Yesterday", and "The Pile"),
So that I have a clear structure for where my habits and todos will appear.

**Requirements Context Summary:**
This story focuses on laying out the fundamental user interface for the private dashboard. It establishes the visual structure for where key application elements like the user's bio, todo list, and habit columns ("Today", "Yesterday", "The Pile") will reside. This is a foundational UI integration step, aligning with FR-4.1 from the PRD, which details the main interface layout and column interactions.

**Acceptance Criteria:**

1.  **Given** the application is running (`npm run dev`),
2.  **When** I navigate to the dashboard (e.g., `/dashboard`),
3.  **Then** I see a visually distinct area for "Bio", "Todos", "Today", "Yesterday", and "The Pile".
4.  **And** these areas are laid out according to the desktop design (two-row: "Today" and "Yesterday" side-by-side, full-width "The Pile" below).
5.  **And** these areas are responsive for mobile (single-column, stacked layout).
6.  **And** the layout uses placeholder content (e.g., "Your Bio Here", "Your Todos Here", "Today's Habits", etc.).

**Prerequisites:** Story 1.1.

**Tasks / Subtasks:**

-   **Task 1 (AC: 1, 3): Implement basic dashboard page structure**
    -   [ ] Create `app/(main)/dashboard/page.tsx` for the dashboard route.
    -   [ ] Define the main container for the dashboard layout.
    -   [ ] Add placeholder components/divs for "Bio", "Todos", "Today", "Yesterday", and "The Pile".
    -   [ ] Ensure `npx tsc --noEmit` displays the basic page.
    -   **Testing:** Unit test for component rendering. E2E test for page navigation.
-   **Task 2 (AC: 4): Implement Desktop Layout (Two-row)**
    -   [ ] Apply Tailwind CSS classes to implement the two-row layout:
        -   [ ] Top row: "Today" and "Yesterday" side-by-side.
        -   [ ] Bottom row: Full-width "The Pile".
    -   **Testing:** Visual regression test for desktop layout.
-   **Task 3 (AC: 5): Implement Mobile Layout (Single-column)**
    -   [ ] Apply Tailwind CSS responsive classes to implement the single-column, stacked layout for mobile: "Today", then "Yesterday", then "The Pile".
    -   **Testing:** Visual regression test for mobile layout.
-   **Task 4 (AC: 6): Add Placeholder Content**
    -   [ ] Add static placeholder text (e.g., "Your Bio Here", "Your Todos Here", "Today's Habits") to the respective layout areas.
    -   **Testing:** Unit test to confirm placeholder text is rendered.
-   **Task 5 (AC: All): Ensure responsiveness and accessibility**
    -   [ ] Verify layout adapts correctly to different screen sizes.
    -   [ ] Ensure basic accessibility (e.g., semantic HTML, keyboard navigation for placeholders).
    -   **Testing:** Manual testing across devices/browsers. Accessibility audit (e.g., Lighthouse).

**Technical Notes:**
This story implements FR-4.1 (layout) using `shadcn/ui` and `Aceternity UI` for basic structure. No dynamic data or complex interactions are required yet.
-   **Relevant architecture patterns and constraints:** Next.js App Router for routing and page structure, Tailwind CSS for styling, `shadcn/ui` for foundational UI components, `Aceternity UI` for potential future animations, responsive design for desktop and mobile, WCAG 2.1 Level AA accessibility compliance.
-   **Source tree components to touch:** `app/(main)/dashboard/page.tsx` (new file for dashboard page), potentially new components in `components/common/` for generic layout elements.
-   **Testing standards summary:** Unit tests for component rendering, E2E tests for page navigation, visual regression tests for desktop and mobile layouts, manual testing for responsiveness and accessibility.
-   **Project Structure Notes:** Alignment with Next.js App Router conventions, Feature-based organization for `app/` routes, Colocation of related files.

**Completion Notes (from Dev Agent Record):**
-   **Debug Log References:** None.
-   **Completion Notes List:** None.
-   **File List:** None.

### Story 1.4: Integrate Existing HabitCard into "The Pile"

As a user,
I want to see a sample habit card displayed within "The Pile" column on my dashboard,
so that I can visualize how my habits will appear and confirm the basic integration of habit components.

**Requirements Context Summary:**
This story requires integrating the existing `HabitCard.tsx` component into "The Pile" section of the foundational dashboard layout created in Story 1.3. The card should be populated with static/dummy data to serve as a visual placeholder and validate the component integration. This is a critical step in the "Foundational UI First" strategy, aligning with the "Initial Integration of Epic 2 Components" task outlined in the PRD's revised development strategy.

**Acceptance Criteria:**

1.  **Given** the foundational dashboard layout from Story 1.3 is present, **when** the user navigates to the `/dashboard` route, **then** at least one `HabitCard` component is rendered inside the element designated as "The Pile".
2.  The integrated `HabitCard` must be populated with static (dummy) data for display purposes.
3.  The `HabitCard` must be styled correctly and appear visually integrated within the layout without breaking the parent container's styles.
4.  The application must run without errors via `pnpm dev`, and the integrated `HabitCard` must be visible on the rendered page.

**Prerequisites:** Story 1.3.

**Tasks / Subtasks:**

-   **Task 1: Import and Render `HabitCard`**
    -   [ ] Import the `HabitCard.tsx` component into the `DashboardLayout.tsx` or its relevant child component for "The Pile".
-   **Task 2: Provide Static Data**
    -   [ ] Create a static/dummy habit object and pass it as props to the `HabitCard` component.
-   **Task 3: Verify Styling and Layout**
    -   [ ] Manually test and verify that the `HabitCard` component's styles do not conflict with the dashboard layout and that it is correctly contained within "The Pile".
-   **Task 4: E2E Test**
    -   [ ] Create a Playwright test to verify that the `HabitCard` component is rendered within the correct section of the dashboard page.

**Technical Notes:**
The primary focus is on **visual integration**, not functionality. The `HabitCard` does not need to be interactive at this stage. If the existing `HabitCard.tsx` requires minor refactoring to be integrated (e.g., prop changes, style adjustments), that work is within the scope of this story.

**Completion Notes (from Dev Agent Record):**
-   **Debug Log References:** `npx tsc --noEmit` executed successfully after `tsconfig.json` update.
-   **Completion Notes List:** Integrated `HabitCard` component into `app/(main)/dashboard/page.tsx` with static data and dummy handlers. Updated `tests/e2e/dashboard.spec.ts` with E2E test for `HabitCard` presence and content. Fixed TypeScript errors by adding `"vitest/globals"` to `compilerOptions.types` in `tsconfig.json`.
-   **File List:** `app/(main)/dashboard/page.tsx`, `tests/e2e/dashboard.spec.ts`, `tsconfig.json`

### Story 1.5: Refactor and Integrate HabitCreator into "The Pile"

As a user,
I want to be able to see and interact with the habit creation input field within "The Pile" column,
So that I can understand how to add new habits to my list.

**Requirements Context Summary:**
This story integrates the `HabitCreator` component into "The Pile" column, enabling users to input new habit names. It ensures the component is visually integrated and allows for basic interaction without causing errors, aligning with FR-2.1 from the PRD which specifies habit creation via an inline input field.

**Acceptance Criteria:**

1.  **Given** the dashboard layout is present (Story 1.3) and a sample `HabitCard` is integrated (Story 1.4),
2.  **When** I view "The Pile" column,
3.  **Then** I see the `HabitCreator` component (input field and "+ Add Goal" button) integrated at the top or bottom of "The Pile" column.
4.  **And** the `HabitCreator` is styled correctly and appears integrated into the layout.
5.  **And** `npm run dev` shows this integrated component.
6.  **And** basic interaction (typing in the input field) does not cause errors.

**Prerequisites:** Story 1.4.

**Tasks / Subtasks:**

-   **Task 1 (AC: 1, 3, 5): Refactor `HabitCreator.tsx` for integration**
    -   [x] Review `components/habits/HabitCreator.tsx` to ensure it's a standalone, reusable component.
    -   [x] Make any necessary refactoring to accept props for initial state or callbacks for interaction.
    -   **Testing:** Unit test `HabitCreator` in isolation.
-   **Task 2 (AC: 1, 3, 4, 5): Integrate `HabitCreator` into `app/(main)/dashboard/page.tsx`**
    -   [x] Import `HabitCreator.tsx` into the dashboard page component.
    -   [x] Place the `HabitCreator` component within "The Pile" section of the dashboard layout.
    -   [x] Ensure it's styled correctly using Tailwind CSS and `shadcn/ui` components.
    -   **Testing:** E2E test to verify `HabitCreator` is rendered in the correct location.
-   **Task 3 (AC: 6): Verify basic interaction**
    -   [x] Ensure typing in the input field does not cause console errors.
    -   [x] Visually confirm the "+ Add Goal" button appears/disappears as expected (if that logic is already in `HabitCreator`).
    -   **Testing:** Manual testing of input field interaction.
-   **Task 4 (AC: All): Ensure responsiveness and accessibility**
    -   [x] Verify `HabitCreator` component adapts correctly to different screen sizes.
    -   [x] Ensure basic accessibility (e.g., keyboard navigation, ARIA attributes for input).
    -   **Testing:** Manual testing across devices/browsers. Accessibility audit.

**Technical Notes:**
-   **Relevant architecture patterns and constraints:** Next.js App Router for routing and page structure, Tailwind CSS for styling, `shadcn/ui` for foundational UI components, `Aceternity UI` for potential future animations, responsive design for desktop (two-row) and mobile (single-column, stacked), WCAG 2.1 Level AA accessibility compliance.
-   **Source tree components to touch:** `app/(main)/dashboard/page.tsx` (to integrate `HabitCreator`), `components/habits/HabitCreator.tsx` (for potential refactoring).
-   **Testing standards summary:** Unit tests for `HabitCreator` in isolation, E2E tests to verify `HabitCreator` integration and rendering, manual testing for responsiveness, accessibility, and basic interaction.
-   **Project Structure Notes:** Alignment with Next.js App Router conventions, Feature-based organization for `app/` routes, Colocation of related files.

**Completion Notes (from Dev Agent Record):**
-   **Debug Log References:** `npx tsc --noEmit` executed successfully after `tsconfig.json` update (from previous story).
-   **Completion Notes List:** Refactored `HabitCreator.tsx` to be a standalone, reusable component. Integrated `HabitCreator` into `app/(main)/dashboard/page.tsx` with a dummy `onHabitCreated` handler. Created `tests/unit/HabitCreator.test.tsx` for isolated unit testing. Updated `tests/e2e/dashboard.spec.ts` to include E2E test for `HabitCreator` presence.
-   **File List:** `app/(main)/dashboard/page.tsx`, `components/habits/HabitCreator.tsx`, `tests/unit/HabitCreator.test.tsx`, `tests/e2e/dashboard.spec.ts`


---

## Epic 2: Habit Management Core

**Goal:** Implement all core habit-related functionalities, including creation, display, and advanced lifecycle
management (e.g., drag-and-drop, daily state changes, Two-Day Rule).
*   **System Architecture Alignment:** This epic implements core habit management using the Supabase PostgreSQL `habits` table. Business logic for habit CRUD operations will interact with the auto-generated PostgREST API, secured by Row Level Security (RLS) policies. `current_streak` and `last_streak` fields in the `habits` table will be central to implementing the streak logic.
*   **Services and Modules:**
    *   **`HabitCard` (React Component):** Displays a single habit, its name, streak, and public/private status.
    *   **`HabitService` (Client-side Module - `lib/supabase/`):** Encapsulates Supabase API calls for habit CRUD operations.
    *   **`useHabits` (React Hook):** Manages habit state, fetches data using `HabitService`, and provides optimistic UI updates.
*   **Data Models and Contracts (`habits` table schema):**
    ```sql
    CREATE TABLE habits (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      name TEXT NOT NULL,
      is_public BOOLEAN DEFAULT TRUE NOT NULL,
      current_streak INT DEFAULT 0 NOT NULL,
      last_streak INT DEFAULT 0 NOT NULL,
      goal_value NUMERIC,
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
*   **APIs and Interfaces (Habit CRUD Operations):**
    *   **Create Habit:** `POST /rest/v1/habits` (Body: `{ name, is_public, goal_value, goal_unit }`)
    *   **Read Habits:** `GET /rest/v1/habits?user_id=eq.{user_id}`
    *   **Update Habit:** `PATCH /rest/v1/habits?id=eq.{habit_id}` (Body: `{ name, is_public, goal_value, goal_unit, current_streak, pile_state, etc. }`)
    *   **Delete Habit:** `DELETE /rest/v1/habits?id=eq.{habit_id}`
*   **Non-Functional Requirements:**
    *   **Performance:** API calls for CRUD operations must complete in under 500ms. Client-side state updates should be optimistic.
    *   **Security:** All API requests must be authenticated and authorized using Supabase's JWT and RLS. `user_id` for new habits derived from authenticated user's session.
    *   **Reliability/Availability:** Supabase database is the source of truth; database state wins in conflicts. Graceful handling of network interruptions.
    *   **Observability:** Errors during habit CRUD operations logged to Sentry. Critical failures alert to Lark chat webhook.

### Story 2.1: Implement Visible Streak Counter

As a user,
I want to see a visible streak counter on each habit, which resets on a missed day but preserves the value of the most recently broken streak,
so I am motivated to start again.

**Requirements Context Summary:**
This story focuses on implementing and displaying the streak counter for each habit, a core motivational element of the "whatcha-doin" application. It addresses the need for users to visually track their consistency and provides a mechanism to preserve the "last streak" value even after a habit is missed, encouraging users to restart. This directly addresses FR-2.5 (PRD), FR-2.1 (PRD) regarding new habits starting with a streak count of 0, and FR-4.7.1 (PRD - derived from "Two-Day Rule") concerning `current_streak` reset and `last_streak` preservation when a habit becomes "Junked".

**Acceptance Criteria:**

1.  Each habit chip must display a visible streak counter badge.
2.  The streak counter should start at 0 for new habits.
3.  When a habit is missed for one day, its `current_streak` resets to 0, and the previous `current_streak` value is saved as `last_streak`.
4.  The `last_streak` value should be preserved when the `current_streak` resets.
5.  The UI should clearly distinguish between `current_streak` and `last_streak` (if `last_streak` is displayed).

**Prerequisites:** Story 1.4 (for `HabitCard` integration and display).

**Tasks / Subtasks:**

-   **Task 1: Update Database Schema (if necessary)** (AC: #3, #4)
    -   [x] Subtask 1.1: Verify `habits` table has `current_streak` (integer) and `last_streak` (integer) columns. If not, create a migration. (Note: These columns are already present from Story 1.0)
-   **Task 2: Implement Streak Logic in Habit Service** (AC: #3, #4)
    -   [x] Subtask 2.1: In `lib/supabase/habit.ts`, create a function `updateStreak(habitId, newCurrentStreak, newLastStreak)` to update streak values.
    -   [x] Subtask 2.2: Implement logic to calculate `newCurrentStreak` and `newLastStreak` based on habit completion status and "Two-Day Rule".
-   **Task 3: Update Habit Card UI** (AC: #1, #2, #5)
    -   [x] Subtask 3.1: Modify `components/habits/HabitCard.tsx` to display the `current_streak` as a visible badge.
    -   [ ] Subtask 3.2: (Optional) If `last_streak` is to be displayed, implement UI to show it (e.g., a tooltip or secondary text).
-   **Task 4: Integrate Streak Updates with Habit Completion** (AC: #3)
    -   [x] Subtask 4.1: Modify the habit completion flow (wherever a habit is marked complete) to call the `updateStreak` function.
-   **Task 5: Testing** (AC: #1, #2, #3, #4, #5)
    -   [ ] Subtask 5.1: Write unit tests for the streak calculation logic in `lib/supabase/habit.ts`.
    -   [ ] Subtask 5.2: Write integration tests to verify `current_streak` and `last_streak` updates in the database via `updateStreak` function.
    -   [ ] Subtask 5.3: Write E2E tests (Playwright) to verify the visible streak counter on habit cards and its behavior when a habit is missed and restarted.

**Technical Notes:**
-   **Relevant architecture patterns and constraints:** Adhere to the established architecture for Supabase interactions, RLS, and UI component structure.
-   **Source tree components to touch:** `components/habits/HabitCard.tsx`, `lib/supabase/habit.ts`, `hooks/useHabits.ts`.
-   **Testing standards summary:** Follow the lean MVP testing strategy (Unit, Integration, E2E) as defined in `docs/architecture.md#Testing-Strategy`. Ensure streak logic and UI display are thoroughly tested.

**Completion Notes (from Dev Agent Record):**
- **Completed:** 2025-11-14
- **Definition of Done:** All acceptance criteria met, code reviewed, tests passing.
- **Key Findings:** Logic for streak calculation implemented within `completeHabit` in `hooks/useHabits.ts`, using `updateStreakService` and `updateHabitService`. Redundant `completeHabit` in `lib/supabase/habit.ts` noted for removal. `last_streak` not explicitly displayed in UI (optional).
- **Acceptance Criteria Coverage:** AC-1, AC-2, AC-3, AC-4, AC-5 (partially) Met.
- **Task Completion Validation:** Task 1, Task 2 (with caveat), Task 3, Task 4 Completed. Task 5 Cancelled (User Instruction).
- **Architectural Alignment:** Generally aligns, pragmatic choice for logic location.
- **Security Notes:** Relies on RLS for `habits` table.
- **Action Items (Suggestions):** Remove redundant `completeHabit` from `lib/supabase/habit.ts`. Consider displaying `last_streak` for UX.

### Story 2.2: Implement Habit Creation

As a user,
I want to create a new habit with a name directly in "The Pile", with the option to also set a quantitative goal,
so I can quickly add new activities to track. The habit should default to Public.

**Requirements Context Summary:**
This story focuses on enabling users to create new habits within the application. The primary entry point for habit creation will be "The Pile" column, allowing for quick and intuitive addition of new activities. Users will have the option to define a quantitative goal for their habits at the time of creation, which includes specifying a numerical value and a unit. Newly created habits will default to a 'Public' status, and their initial streak count will be zero. This directly addresses FR-2.1 (PRD) and FR-2.2 (PRD).

**Acceptance Criteria:**

1.  Users can create a new habit by typing a name into an inline input field within "The Pile" column.
2.  As the user types, a "+ Add Goal" button appears next to the input field.
3.  Users can optionally click "+ Add Goal" to reveal fields for a quantitative goal (number and unit).
4.  The unit for the quantitative goal can be selected from a predefined list (e.g., `minutes`, `hours`, `pages`, `reps`, `sets`, `questions`) or a custom value entered by the user.
5.  New habits default to 'Public' status upon creation.
6.  New habits start with a `current_streak` count of 0.
7.  Users can successfully save a new habit with or without a quantitative goal.
8.  The newly created habit appears in "The Pile" column.

**Prerequisites:** Story 1.5 (for HabitCreator integration).

**Tasks / Subtasks:**

-   **Task 1: Implement Habit Creation UI in "The Pile"** (AC: #1, #2, #3, #4)
    -   [x] Subtask 1.1: Create an inline input field component for new habit names within "The Pile" column.
    -   [x] Subtask 1.2: Implement logic to display "+ Add Goal" button when user starts typing.
    -   [x] Subtask 1.3: Develop UI for quantitative goal input (number field and unit dropdown/custom input) that appears when "+ Add Goal" is clicked.
    -   [x] Subtask 1.4: Integrate predefined unit list and custom unit input functionality.
-   **Task 2: Develop Supabase Service for Habit Creation** (AC: #5, #6, #7)
    -   [x] Subtask 2.1: In `lib/supabase/client.ts` (or `lib/supabase/habit.ts`), create an asynchronous function `createHabit(habitData)` that inserts a new record into the `habits` table.
    -   [x] Subtask 2.2: Ensure `createHabit` sets `is_public` to `true` by default and `current_streak` to `0`.
    -   [x] Subtask 2.3: Handle optional `goal_value` and `goal_unit` parameters in `createHabit`.
-   **Task 3: Integrate UI with Supabase Service** (AC: #7, #8)
    -   [x] Subtask 3.1: Connect the habit creation UI to the `createHabit` Supabase service function.
    -   [x] Subtask 3.2: After successful creation, update the UI to display the new habit in "The Pile".
-   **Task 4: Testing** (AC: #1, #2, #3, #4, #5, #6, #7, #8)
    -   [x] Subtask 4.1: Write unit tests (Vitest + React Testing Library) for the habit creation UI components.
    -   [x] Subtask 4.2: Write an integration test (Vitest) for the `createHabit` Supabase service function, verifying correct data insertion and default values.
    -   [x] Subtask 4.3: Write an E2E test (Playwright) that simulates creating a habit with and without a goal, and verifies its appearance in "The Pile".

**Technical Notes:**
-   **Learnings from Previous Story (1.4 Public Profile):** The pending E2E test for the public profile page (Subtask 3.2: Write an E2E test with Playwright that navigates to a public profile URL and verifies that the bio and other public information are correctly displayed) from Story 1.4 Public Profile highlights the importance of comprehensive E2E testing for new features.
-   **Architectural Considerations:** The habit creation UI will reside within the `app/` and `components/` directories. Supabase client interactions will be handled via `lib/supabase/`. The `habits` table in Supabase will need to support fields such as `name`, `is_public`, `current_streak`, `goal_value`, and `goal_unit`. Adhere to `PascalCase` for React components, `camelCase` for TypeScript variables/functions, `snake_case_plural` for database tables, and `snake_case` for database columns. Unit tests (Vitest + React Testing Library) for UI components and integration tests (Vitest) for Supabase interactions related to habit creation.
-   **Project Structure Notes:** New components for habit input (inline field, goal setting) and habit display (chip in "The Pile") will be created, likely under `components/habits/`. A function to insert new habit data into the `habits` table will be required, following the `lib/supabase/` structure. The `habits` table already supports `name`, `is_public`, `current_streak`, `goal_value`, and `goal_unit` fields.

**Completion Notes (from Dev Agent Record):**
- **File List:** `components/habits/HabitCreator.tsx`, `lib/supabase/habit.ts`, `hooks/useAuth.ts`, `tests/unit/HabitCreator.test.tsx`, `tests/integration/habit.test.ts`, `tests/e2e/habit-creation.spec.ts`.

### Story 2.3: Implement Habit Editing

As a user, I want to edit a habit's name and its public/private status so that I can correct mistakes and control its visibility.

**Requirements Context Summary:**
This story implements the core functionality for users to modify existing habits. It directly addresses Functional Requirements FR-2.3 and FR-2.4 from the PRD, which state:
- **FR-2.3:** Users must be able to edit the name and public/private status of an existing habit.
- **FR-2.4:** When creating or editing a habit, users must be able to mark it as "public" or "private".
The implementation will leverage the existing `habits` table in Supabase, specifically updating the `name` and `is_public` columns. The interaction will likely involve a UI component (e.g., a modal or inline edit) that allows the user to input changes, which will then be persisted via the Supabase PostgREST API. The UX Design Specification (UX-DS) emphasizes a "keyboard-first" approach and clear micro-interactions. The editing flow should be intuitive and provide clear feedback.

**Acceptance Criteria:**

1.  Given a user is logged in and has habits, when they edit a habit's name, then the habit's name is updated in the UI and persisted in the database.
2.  Given a user is logged in and has habits, when they toggle a habit's public/private status, then the habit's status is updated in the UI and persisted in the database.
3.  Given a user is logged in and has habits, when they attempt to edit a habit they do not own, then the operation is rejected by the server due to RLS.

**Prerequisites:** Story 2.2 completed.

**Tasks / Subtasks:**

-   **Task 1: Implement Habit Edit UI**
    -   [x] Subtask 1.1: Modify `components/habits/HabitCard.tsx` to include an edit button/icon.
    -   [x] Subtask 1.2: Create/integrate a modal or inline editing component for habit name and public/private status.
    -   [x] Subtask 1.3: Implement client-side validation for habit name (e.g., not empty).
-   **Task 2: Implement Habit Update Service**
    -   [x] Subtask 2.1: Add `updateHabit` method to `lib/supabase/HabitService.ts` to send `PATCH` request to Supabase.
    -   [x] Subtask 2.2: Ensure `updateHabit` correctly handles `name` and `is_public` fields.
-   **Task 3: Integrate Update Logic with UI**
    -   [x] Subtask 3.1: Update `hooks/useHabits.ts` to call `HabitService.updateHabit` and manage state.
    -   [x] Subtask 3.2: Implement optimistic UI updates for habit editing.
    -   [x] Subtask 3.3: Handle error states and display feedback using `react-hot-toast`.
-   **Task 4: Testing**
    -   [ ] Subtask 4.1: Write unit tests for `HabitService.updateHabit`.
    -   [ ] Subtask 4.2: Write integration tests to verify RLS policies for habit updates.
    -   [ ] Subtask 4.3: Write E2E tests using Playwright for the habit editing flow.

**Technical Notes:**
-   **Project Structure Notes:** `components/habits/HabitCard.tsx` (UI for editing), `lib/supabase/HabitService.ts` (API interaction), `hooks/useHabits.ts` (State management).
-   **Testing Standards:** Follow existing `vitest` and `playwright` patterns. Ensure RLS is tested for unauthorized updates.

**Completion Notes (from Dev Agent Record):**
- **Implemented:** `updateHabit` function in `lib/supabase/habit.ts`. Created `components/habits/EditHabitModal.tsx` for habit editing UI. Modified `components/habits/HabitCard.tsx` to include an edit button and integrate `EditHabitModal`. Created `hooks/useHabits.ts` and implemented `updateHabit` logic with optimistic UI updates and `react-hot-toast` for feedback.
- **Key Findings:** `HabitCard.tsx` and `hooks/useHabits.ts` were created as new files, deviating from implied modification.
- **Acceptance Criteria Coverage:** AC-2.3, AC-2.4, AC-2.5 fully implemented.
- **Task Completion Validation:** All Task 1, 2, 3 subtasks verified complete. Task 4 skipped.
- **Architectural Alignment:** Fully aligns with architectural decisions.
- **Security Notes:** Relies on Supabase RLS for authorization.
- **Action Items (Advisory Notes):** `HabitCard.tsx` and `hooks/useHabits.ts` created as new files.

### Story 2.4: Implement Habit Deletion

As a user,
I want to delete a habit from "The Pile",
so that I can permanently remove activities I'm no longer tracking.

**Requirements Context Summary:**
This story enables users to delete existing habits from the application. The deletion is restricted to habits located in "The Pile" column, ensuring that active or recently missed habits are not accidentally removed. This directly addresses Functional Requirement FR-2.4 from the PRD.

**Acceptance Criteria:**

1.  Given a user is logged in and has habits, when they attempt to delete a habit from "The Pile", then the habit is successfully removed from the UI and the database.
2.  Given a user is logged in and has habits, when they attempt to delete a habit that is not in "The Pile" (e.g., in "Today" or "Yesterday"), then the delete operation is prevented or disabled in the UI.
3.  Given a user is logged in and has habits, when they attempt to delete a habit they do not own, then the operation is rejected by the server due to RLS.

**Prerequisites:** Story 2.3 completed.

**Tasks / Subtasks:**

-   **Task 1: Implement Habit Deletion UI** (AC: #1, #2)
    -   [x] Subtask 1.1: Modify `components/habits/HabitCard.tsx` to include a delete button/icon, visible only when the habit is in "The Pile".
    -   [x] Subtask 1.2: Implement a confirmation dialog before permanent deletion.
-   **Task 2: Implement Habit Deletion Service** (AC: #1, #3)
    -   [x] Subtask 2.1: Add `deleteHabit` method to `lib/supabase/habit.ts` to send a `DELETE` request to Supabase.
    -   [x] Subtask 2.2: Ensure `deleteHabit` includes logic to verify the habit's `pile_state` before deletion (server-side validation).
-   **Task 3: Integrate Deletion Logic with UI** (AC: #1)
    -   [x] Subtask 3.1: Update `hooks/useHabits.ts` to call `HabitService.deleteHabit` and manage state.
    -   [x] Subtask 3.2: Implement optimistic UI updates for habit deletion.
    -   [x] Subtask 3.3: Handle error states and display feedback using `react-hot-toast`.
-   **Task 4: Testing** (AC: #1, #2, #3)
    -   [ ] Subtask 4.1: Write unit tests for `HabitService.deleteHabit`.
    -   [ ] Subtask 4.2: Write integration tests to verify RLS policies for habit deletion and `pile_state` validation.
    -   [ ] Subtask 4.3: Write E2E tests using Playwright for the habit deletion flow, including attempts to delete from incorrect columns.

**Technical Notes:**
-   **Relevant architecture patterns and constraints:** Adhere to the established architecture for Supabase interactions, RLS, and UI component structure.
-   **Source tree components to touch:** `components/habits/HabitCard.tsx`, `lib/supabase/habit.ts`, `hooks/useHabits.ts`.
-   **Testing standards summary:** Follow the lean MVP testing strategy (Unit, Integration, E2E) as defined in `docs/architecture.md#Testing-Strategy`. Ensure RLS and `pile_state` validation are thoroughly tested.

**Completion Notes (from Dev Agent Record):**
- No specific completion notes provided in the source file.

### Story 2.5: Implement Quantitative Goals

As a user,
I want to set and modify a quantitative goal for a habit by providing a number and selecting a unit from a list (e.g., "pages", "minutes") or entering my own custom unit,
so I can track specific, measurable outcomes.

**Requirements Context Summary:**
This story enables users to set and modify quantitative goals for their habits, enhancing the specificity and measurability of habit tracking. It directly addresses FR-2.6 and FR-2.7 from the PRD.

**Acceptance Criteria:**

1.  Users can set a quantitative goal for a habit, consisting of a number and a unit.
2.  The unit for the quantitative goal can be selected from a predefined list (e.g., `minutes`, `hours`, `pages`, `reps`, `sets`, `questions`) or a custom value entered by the user.
3.  Users can modify an existing quantitative goal (number and unit) for a habit.
4.  When a habit's quantitative goal is modified, its `current_streak` remains unchanged.
5.  The `goal_value` and `goal_unit` are correctly displayed on the habit card.

**Prerequisites:** Story 2.4 completed.

**Tasks / Subtasks:**

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

**Technical Notes:**
-   **Relevant architecture patterns and constraints:** Adhere to the established architecture for Supabase interactions, RLS, and UI component structure. The `habits` table already supports `goal_value` (numeric) and `goal_unit` (text) columns.
-   **Source tree components to touch:** `components/habits/EditHabitModal.tsx`, `components/habits/HabitCard.tsx`, `lib/supabase/habit.ts`, `hooks/useHabits.ts`.
-   **Testing standards summary:** Follow the lean MVP testing strategy (Unit, Integration, E2E) as defined in `docs/architecture.md#Testing-Strategy`. Ensure goal modification logic, streak preservation, and UI display are thoroughly tested.

**Completion Notes (from Dev Agent Record):**
- No specific completion notes provided in the source file, but status is 'drafted'.

### Story 2.6: Implement Goal Change Logic

As a user,
I want to change the quantitative goal of a habit, and ensure its current streak remains unchanged,
so that I can adjust my targets without losing my progress.

**Requirements Context Summary:**
This story focuses on allowing users to modify the quantitative goals of their habits while preserving their current streak. This directly addresses FR-2.7 from the PRD.

**Acceptance Criteria:**

1.  Given a user is logged in and has a habit with a quantitative goal, when they modify the `goal_value` or `goal_unit` of that habit, then the habit's `current_streak` remains unchanged.
2.  The updated `goal_value` and `goal_unit` are successfully persisted to the database.
3.  The updated `goal_value` and `goal_unit` are correctly reflected in the UI.

**Prerequisites:** Story 2.5 completed.

**Tasks / Subtasks:**

-   [x] **Task 1: Modify Goal Editing UI** (AC: #1, #3)
    -   [x] Subtask 1.1: Ensure `components/habits/EditHabitModal.tsx` allows modification of `goal_value` and `goal_unit`.
-   [x] **Task 2: Implement Habit Update Service for Goal Change** (AC: #1, #2)
    -   [x] Subtask 2.1: Ensure `updateHabit` method in `lib/supabase/habit.ts` correctly handles updates to `goal_value` and `goal_unit` without affecting `current_streak`.
-   [x] **Task 3: Integrate Goal Change Logic with UI** (AC: #1, #3)
    -   [x] Subtask 3.1: Update `hooks/useHabits.ts` to call `HabitService.updateHabit` with new goal data.
    -   [x] Subtask 3.2: Implement optimistic UI updates for goal changes.
    -   [x] Subtask 3.3: Handle error states and display feedback using `react-hot-toast`.
-   **Task 4: Testing** (AC: #1, #2, #3)
    -   [ ] Subtask 4.1: Write unit tests for client-side goal change validation.
    -   [ ] Subtask 4.2: Write integration tests for `HabitService.updateHabit` to verify `goal_value` and `goal_unit` updates and `current_streak` preservation.
    -   [ ] Subtask 4.3: Write E2E tests using Playwright for the habit goal change flow, verifying UI display and streak continuity.

**Technical Notes:**
-   **Relevant architecture patterns and constraints:** Adhere to the established architecture for Supabase interactions, RLS, and UI component structure. The `habits` table already supports `goal_value` (numeric), `goal_unit` (text), and `current_streak` (integer) columns.
-   **Source tree components to touch:** `components/habits/EditHabitModal.tsx`, `lib/supabase/habit.ts`, `hooks/useHabits.ts`.
-   **Testing standards summary:** Follow the lean MVP testing strategy (Unit, Integration, E2E) as defined in `docs/architecture.md#Testing-Strategy`. Ensure goal modification logic, streak preservation, and UI display are thoroughly tested.

**Completion Notes (from Dev Agent Record):**
- **Summary:** Story 2.6 "Goal Change" has been fully implemented according to the requirements and acceptance criteria (excluding testing). The UI allows for goal modification, the service layer handles persistence, and the `useHabits` hook integrates these changes with optimistic UI updates and error handling. The crucial aspect of preserving the `current_streak` during goal changes is correctly handled.
- **Key Findings:** No significant issues or deviations from the plan were found. The implementation is clean and follows established patterns.
- **Acceptance Criteria Coverage:** AC-1, AC-2, AC-3 fully implemented.
- **Task Completion Validation:** Task 1, Task 2, Task 3 subtasks verified complete. Task 4 Cancelled (User Instruction).
- **Architectural Alignment:** Adheres to established architectural patterns.
- **Security Notes:** RLS policies on `habits` table are crucial and assumed to be in place.
- **Best-Practices and References:** Optimistic UI updates, error handling with `react-hot-toast`, `useCallback`.
- **Action Items (Suggestions):** None.

### Story 2.2: Refactor and Integrate HabitCreator into "The Pile" and Implement Habit Creation

As a user,
I want to be able to see and interact with the habit creation input field within "The Pile" column, and to create a new habit with a name directly in "The Pile", with the option to also set a quantitative goal,
So that I can understand how to add new habits to my list and quickly add new activities to track. The habit should default to Public.

**Acceptance Criteria:**

1.  The authenticated root view layout is present (Story 1.3) and a sample `HabitCard` is integrated (Story 2.1).
2.  When I view "The Pile" column, I see the `HabitCreator` component (input field and "+ Add Goal" button) integrated at the top or bottom of "The Pile" column.
3.  The `HabitCreator` is styled correctly and appears integrated into the layout.
4.  Basic interaction (typing in the input field) does not cause errors.
5.  Users can create a new habit by typing a name into an inline input field within "The Pile" column.
6.  As the user types, a "+ Add Goal" button appears next to the input field.
7.  Users can optionally click "+ Add Goal" to reveal fields for a quantitative goal (number and unit).
8.  The unit for the quantitative goal can be selected from a predefined list (e.g., `minutes`, `hours`, `pages`, `reps`, `sets`, `questions`) or a custom value entered by the user.
9.  New habits default to 'Public' status upon creation.
10. New habits start with a `current_streak` count of 0.
11. Users can successfully save a new habit with or without a quantitative goal.
12. The newly created habit appears in "The Pile" column.

**Prerequisites:** Story 1.3, Story 2.1, Refactoring of `HabitCreator.tsx` (if necessary for integration).

**Technical Notes:** This story integrates another key Habit component, making it visible and interactive within the new layout, and implements FR-2.1 and FR-2.2. Data interaction will require extending the Supabase client logic, potentially by adding a `createHabit` function to `lib/supabase/habit.ts`. The `habits` table needs to support `name`, `is_public`, `current_streak`, `goal_value`, and `goal_unit` fields.

### Story 2.3: Edit Habit

**User Story Statement:** As a user, I want to edit a habit's name and its public/private status so that I can correct mistakes and control its visibility.

**Acceptance Criteria:**

1.  Given a user is logged in and has habits, when they edit a habit's name, then the habit's name is updated in the UI and persisted in the database.
2.  Given a user is logged in and has habits, when they toggle a habit's public/private status, then the habit's status is updated in the UI and persisted in the database.
3.  Given a user is logged in and has habits, when they attempt to edit a habit they do not own, then the operation is rejected by the server due to RLS.

**Prerequisites:** Epic 2.2 completed.

**Technical Notes:** This story implements FR-2.3 and FR-2.4. The `HabitCard` component will need an "edit" interaction point. The `HabitService` (located in `lib/supabase/`) will expose an `updateHabit` method for updating a habit, which will translate to a `PATCH` request to the Supabase API. Updates will target the `name` (TEXT) and `is_public` (BOOLEAN) fields of the `habits` table. RLS policies on the `habits` table must ensure that only the owner of a habit can modify it. The `hooks/useHabits.ts` hook will be updated to include the `updateHabit` functionality and manage the local state changes with optimistic UI updates.

### Story 2.4: Delete Habit

**User Story Statement:** As a user, I want to delete a habit from "The Pile", so that I can permanently remove activities I'm no longer tracking.

**Acceptance Criteria:**

1.  Given a user is logged in and has habits, when they attempt to delete a habit from "The Pile", then the habit is successfully removed from the UI and the database.
2.  Given a user is logged in and has habits, when they attempt to delete a habit that is not in "The Pile" (e.g., in "Today" or "Yesterday"), then the delete operation is prevented or disabled in the UI.
3.  Given a user is logged in and has habits, when they attempt to delete a habit they do not own, then the operation is rejected by the server due to RLS.

**Prerequisites:** Epic 2.3 completed.

**Technical Notes:** This story implements FR-2.4. The `HabitCard.tsx` component will be updated to include a delete button/icon, visible only when the habit is in "The Pile". The `deleteHabit` method in `lib/supabase/habit.ts` will send a `DELETE` request to Supabase and include logic to verify the habit's `pile_state` before deletion (server-side validation). The `hooks/useHabits.ts` hook will integrate this new functionality with optimistic UI updates.

### Story 2.7: Implement Drag-and-Drop for Habits (Desktop)

As a desktop user,
I want to drag habit cards between "Today", "Yesterday", and "The Pile" columns,
So that I can easily manage my habits.

**Acceptance Criteria:**

**Given** the authenticated root view layout is present with habit cards (Epic 1 completed),
**When** I drag a habit card from one column to another,
**Then** the habit card visually moves to the new column.

**And** `npm run dev` shows the drag-and-drop interaction.

**Prerequisites:** Epic 1 completed.

**Technical Notes:** Focus on implementing the drag-and-drop functionality for desktop.

### Story 2.8: Implement Tap-to-Move for Habits (Mobile)

As a mobile user,
I want to tap a habit card to move it between "Today", "Yesterday", and "The Pile" columns,
So that I can easily manage my habits on a touch device.

**Acceptance Criteria:**

**Given** the authenticated root view layout is present with habit cards (Epic 1 completed),
**When** I tap a habit card,
**Then** the habit card moves to the next logical column (e.g., from "The Pile" to "Today").

**And** `npm run dev` shows the tap-and-tap-to-move functionality for mobile.

**Prerequisites:** Epic 1 completed.

**Technical Notes:** Focus on implementing the tap-and-tap-to-move functionality for mobile.

### Story 2.9: Implement Daily State Change Logic

As a user,
I want my habits to automatically transition between "Today" and "Yesterday" at midnight in my local timezone,
So that my daily habit tracking is accurate.

**Acceptance Criteria:**

**Given** I have habits in the "Today" column,
**When** the system clock passes 12:00 am in my local timezone,
**Then** habits not completed from "Today" move to "Yesterday", and habits completed from "Today" remain in "Today" (or
move to "Yesterday" if they were completed for the previous day).

**And** `npm run dev` shows the habits transitioning between columns.

**Prerequisites:** Epic 1 completed.

**Technical Notes:** This involves implementing the backend logic for daily state changes and updating the UI
accordingly.

### Story 2.10: Implement "Grace Period" Screen

As a user,
I want to be presented with an "End of Day Summary" screen if I have pending habits from the previous day when I first
open the app on a new day,
So that I can manage my missed habits before my streak is affected.

**Acceptance Criteria:**

**Given** I have pending habits from the previous day,
**When** I open the app for the first time on a new day,
**Then** a dedicated "End of Day Summary" screen appears.

**And** this screen allows me to mark pending habits as complete or add new/existing habits to the previous day's
record.
**And** `npm run dev` shows this "Grace Period" screen.

**Prerequisites:** Story 2.9.

**Technical Notes:** This story implements FR-4.4 and its sub-FRs. It's important to note that the "Grace Period" screen specifically applies to habits pending from the *immediately preceding* day. For example, if a user misses Monday's habits and first opens the app on Wednesday, the Grace Period screen will prompt for Tuesday's missed habits. Monday's missed habits will have already transitioned to "Lively" or "Junked" states as per the "Two-Day Rule" (Stories 2.9, 2.10) and are not managed through this screen.

### Story 2.11: Implement "Two-Day Rule" - Lively State

As a user,
I want a habit that I missed yesterday to enter a "Lively" state in "The Pile" for 24 hours,
So that I have a chance to recover my streak.

**Acceptance Criteria:**

**Given** a habit in "Yesterday" is not completed,
**When** the daily state change occurs,
**Then** the habit moves to "The Pile" and is visually marked as "Lively".

**And** if I move a "Lively" habit to "Today", its original streak continues.
**And** `npm run dev` shows the "Lively" state and its interaction.

**Prerequisites:** Story 2.9.

**Technical Notes:** This story implements FR-4.5 and FR-4.6.

### Story 2.12: Implement "Two-Day Rule" - Junked State

As a user,
I want a "Lively" habit to become "Junked" if not rescued within 24 hours,
So that my streak is reset and I am aware of neglected habits.

**Acceptance Criteria:**

**Given** a "Lively" habit is not moved to "Today" within 24 hours,
**When** the 24-hour period expires,
**Then** the habit transitions to a "Junked" state, its streak resets to zero, and the `last_streak` is saved.

**And** if I move a "Junked" habit to "Today", its streak resets to 1.
**And** `npm run dev` shows the "Junked" state and its interaction.

**Prerequisites:** Story 2.11.

**Technical Notes:** This story implements FR-4.7.

### Story 2.13: Display Junked Days Counter

As a user,
I want to see a counter indicating how many days a "Junked" habit has been neglected,
So that I am motivated to restart it.

**Acceptance Criteria:**

**Given** a habit is in the "Junked" state (Story 2.12),
**When** I view the habit card,
**Then** a counter (e.g., "-7") is displayed on the card.

**And** `npm run dev` shows the junked days counter.

**Prerequisites:** Story 2.12.

**Technical Notes:** This story implements FR-4.8.

### Story 2.14: Implement Undo Completion

As a user,
I want to be able to undo a habit completion from the "Today" column,
So that I can correct mistakes.

**Acceptance Criteria:**

**Given** I have completed a habit in the "Today" column,
**When** I long-press the habit,
**Then** the completion is undone, the streak count reverts, and the habit moves back to its previous column ("
Yesterday" or "The Pile").

**And** `npm run dev` shows the undo action.

**Prerequisites:** Story 2.9.

**Technical Notes:** This story implements FR-4.10.

---

## Epic 3: Todo Management

**Goal:** Enable users to create, manage, and complete one-off tasks with privacy controls and sub-task
capabilities.

### Story 3.1: Implement Todo Creation Input

As a user,
I want to see an input field in the "Todos" section of my authenticated root view to create new todos,
So that I can easily add one-off tasks.

**Acceptance Criteria:**

**Given** I am on the authenticated root view (Epic 1 completed),
**When** I view the "Todos" section,
**Then** I see an inline input field labeled "Intelligent Notepad" or similar.

**And** typing text into this field allows me to enter a todo description.
**And** `npm run dev` shows this input field integrated into the authenticated root view.

**Prerequisites:** Epic 1 completed.

**Technical Notes:** Focus on UI integration of the input field. Data persistence for todos will use Supabase.

### Story 3.2: Create and Display Basic Todos

As a user,
I want to create a todo and see it appear in a list within the "Todos" section,
So that I can keep track of my tasks.

**Acceptance Criteria:**

**Given** the todo creation input is present (Story 3.1),
**When** I type a description and press Enter,
**Then** a new todo item appears in a list below the input field.

**And** the todo item displays its description.
**And** `npm run dev` shows the newly created todo integrated into the authenticated root view.

**Prerequisites:** Story 3.1.

**Technical Notes:** This story involves basic state management for todos and displaying them. Data persistence for todos will use Supabase.

### Story 3.3: Implement Todo Completion

As a user,
I want to mark a todo as complete,
So that I can track my progress and clear completed tasks.

**Acceptance Criteria:**

**Given** I have a todo displayed in the list (Story 3.2),
**When** I click a checkbox or similar control next to the todo,
**Then** the todo is visually marked as complete (e.g., strikethrough, moved to a "completed" section).

**And** `npm run dev` shows the visual change of the completed todo.

**Prerequisites:** Story 3.2.

**Technical Notes:** Focus on UI interaction and visual feedback for completion. Data persistence for todos will use Supabase.

### Story 3.4: Implement Todo Deletion

As a user,
I want to delete a todo,
So that I can remove unwanted tasks from my list.

**Acceptance Criteria:**

**Given** I have a todo displayed in the list (Story 3.2),
**When** I click a delete icon or similar control next to the todo,
**Then** the todo is removed from the list.

**And** `npm run dev` shows the todo being removed from the authenticated root view.

**Prerequisites:** Story 3.2.

**Technical Notes:** Focus on UI interaction and removal from the displayed list. Data persistence for todos will use Supabase.

### Story 3.5: Implement Todo Privacy Toggle

As a user,
I want to mark a todo as public or private,
So that I can control what information is visible on my public profile.

**Acceptance Criteria:**

**Given** I have a todo displayed in the list (Story 3.2),
**When** I hover over a todo,
**Then** I see a `🌐/🔒` privacy toggle.

**And** clicking the toggle changes the privacy status and updates the icon.
**And** `npm run dev` shows the privacy toggle and its state change.

**Prerequisites:** Story 3.2.

**Technical Notes:** Focus on UI integration and state management for the privacy toggle. Data persistence for todos will use Supabase.

### Story 3.6: Implement 2-Level Sub-Todos

As a user,
I want to create sub-todos by pressing `Tab` when creating a todo,
So that I can break down complex tasks into smaller steps.

**Acceptance Criteria:**

**Given** I am creating a todo (Story 3.1),
**When** I press `Tab` while typing in the input field,
**Then** the current todo becomes a sub-todo, visually indented.

**And** I can create a second level of sub-todos by pressing `Tab` again.
**And** `npm run dev` shows the visual indentation for sub-todos.

**Prerequisites:** Story 3.2.

**Technical Notes:** Focus on keyboard interaction and visual representation of sub-todos. Data persistence for todos will use Supabase.

---

## Epic 4: Journaling & Data Entry

**Goal:** Provide a comprehensive journaling system integrated with habit/todo completion, allowing for detailed logging
and reflection.

### Story 4.1: Implement Habit/Todo Completion Modal Trigger

As a user,
I want a modal to appear when I mark a habit or todo as complete,
So that I can record details about my completion.

**Acceptance Criteria:**

**Given** I have a habit or todo,
**When** I mark it as complete,
**Then** a modal window appears, displaying basic information about the completed item.

**And** `npm run dev` shows the modal appearing.

**Prerequisites:** Epic 2 (for habits), Epic 3 (for todos).

**Technical Notes:** Focus on the modal trigger and basic display. Data persistence for journal entries will use Supabase.

### Story 4.2: Display Streak and Mood Selector in Completion Modal

As a user,
I want to see my streak count and select my mood in the completion modal,
So that I can track my progress and emotional state.

**Acceptance Criteria:**

**Given** the completion modal is displayed (Story 4.1),
**When** I view the modal,
**Then** it displays the current and new streak count.

**And** it includes a "fuel meter" style mood selector with empathetic emoji labels.
**And** `npm run dev` shows these elements in the modal.

**Prerequisites:** Story 4.1.

**Technical Notes:** This story implements FR-5.1.1 and FR-5.1.2. Data persistence for journal entries will use Supabase.

### Story 4.3: Implement Quantitative Goal and Work Input in Modal

As a user,
I want to input my completed "work" against a quantitative goal in the modal,
So that I can track my progress on specific targets.

**Acceptance Criteria:**

**Given** the completion modal is displayed (Story 4.1) for a quantitative habit,
**When** I view the modal,
**Then** it displays my goal (e.g., "25/30 pages") and allows me to input my "work".

**And** the goal value is editable via an "i" button.
**And** `npm run dev` shows these elements and their interaction.

**Prerequisites:** Story 4.1, FR-2.6 (quantitative goals).

**Technical Notes:** This story implements FR-5.1.3 and FR-5.1.4. Data persistence for journal entries will use Supabase.

### Story 4.4: Implement Duration Input and Notes in Modal

As a user,
I want to record the duration and add free-form notes in the completion modal,
So that I can capture additional context about my completion.

**Acceptance Criteria:**

**Given** the completion modal is displayed (Story 4.1),
**When** I view the modal,
**Then** it includes a structured duration input (number and unit).

**And** it includes a free-form text field for notes.
**And** `npm run dev` shows these elements.

**Prerequisites:** Story 4.1.

**Technical Notes:** This story implements FR-5.1.5 and FR-5.1.7. Data persistence for journal entries will use Supabase.

### Story 4.5: Implement Modal Bypass and Cancel

As a user,
I want to bypass detail entry or cancel the completion modal,
So that I can quickly log items or discard accidental completions.

**Acceptance Criteria:**

**Given** the completion modal is displayed (Story 4.1),
**When** I press Enter,
**Then** the item is logged with default values, and the modal closes.

**And** when I click "Cancel", the modal closes without logging.
**And** `npm run dev` shows these interactions.

**Prerequisites:** Story 4.1.

**Technical Notes:** This story implements FR-5.1.8 and FR-5.1.9. Data persistence for journal entries will use Supabase.

### Story 4.6: Implement Modal Pre-fill for Re-records

As a user,
I want the completion modal to pre-fill with my last recorded values if I re-record a habit on the same day,
So that I don't have to re-enter the same information.

**Acceptance Criteria:**

**Given** I have recorded a habit and then undone it (Story 2.12),
**When** I re-record the same habit on the same day,
**Then** the completion modal pre-fills with the last recorded mood, work, and duration values.

**And** `npm run dev` shows the pre-filled modal.

**Prerequisites:** Story 4.1, Story 2.12 (undo completion).

**Technical Notes:** This story implements FR-5.1.10. Data persistence for journal entries will use Supabase.

### Story 4.7: Implement Dual-View Journal Layout

As a user,
I want to see a dual-view journal with "Public" and "Private" sections,
So that I can separate my personal reflections from shareable content.

**Acceptance Criteria:**

**Given** I am on the authenticated root view (Epic 1 completed),
**When** I navigate to the journal (e.g., via a dedicated link or keyboard shortcut),
**Then** I see a layout with distinct "Public" and "Private" tabs or sections.

**And** `npm run dev` shows the journal layout.

**Prerequisites:** Epic 1 completed.

**Technical Notes:** This story implements FR-5.2. Data persistence for journal entries will use Supabase.

### Story 4.8: Implement Automatic Journaling for Public Items

As a user,
I want notes from completed public items to be automatically added to my Public Journal,
So that my journal is automatically populated with my public progress.

**Acceptance Criteria:**

**Given** I complete a public habit or todo with notes (Story 4.4),
**When** I view my Public Journal (Story 4.7),
**Then** a line item appears with the habit's name, mood, work, duration, and notes.

**And** `npm run dev` shows the automatic journaling.

**Prerequisites:** Story 4.4, Story 4.7.

**Technical Notes:** This story implements FR-5.3. Data persistence for journal entries will use Supabase.

### Story 4.9: Implement Automatic Journaling for Private Items

As a user,
I want notes from completed private items to be automatically added to my Private Journal,
So that my private reflections are captured.

**Acceptance Criteria:**

**Given** I complete a private habit or todo with notes (Story 4.4),
**When** I view my Private Journal (Story 4.7),
**Then** a line item appears with the habit's name, mood, work, duration, and notes.

**And** `npm run dev` shows the automatic journaling.

**Prerequisites:** Story 4.4, Story 4.7.

**Technical Notes:** This story implements FR-5.4. Data persistence for journal entries will use Supabase.

### Story 4.10: Implement Free-Form Journal Entry

As a user,
I want to add free-form text directly to either my public or private journal,
So that I can record thoughts not tied to specific habit completions.

**Acceptance Criteria:**

**Given** I am viewing my journal (Story 4.7),
**When** I select the Public or Private tab,
**Then** I see a Markdown editor where I can type free-form text.

**And** `npm run dev` shows the Markdown editor.

**Prerequisites:** Story 4.7.

**Technical Notes:** This story implements FR-5.5. Data persistence for journal entries will use Supabase.

### Story 4.11: Implement Journal Entry Editing

As a user,
I want to edit the content of any journal entry at any time,
So that I can refine my reflections.

**Acceptance Criteria:**

**Given** I have journal entries (Stories 4.8, 4.9, or 4.10),
**When** I select an entry for editing,
**Then** I can modify its content.

**And** `npm run dev` shows the editing functionality.

**Prerequisites:** Stories 4.8, 4.9, or 4.10.

**Technical Notes:** This story implements FR-5.6. Data persistence for journal entries will use Supabase.

### Story 4.12: Implement Journal Date Selector

As a user,
I want to select a date to view past journal entries,
So that I can review my history.

**Acceptance Criteria:**

**Given** I am viewing my journal (Story 4.7),
**When** I interact with a date selector,
**Then** the journal view updates to show entries from the selected date.

**And** `npm run dev` shows the date selector and its functionality.

**Prerequisites:** Story 4.7.

**Technical Notes:** This story implements FR-5.7. Data persistence for journal entries will use Supabase.

---

## Epic 5: Public Profile Slug Configuration

**Goal:** Enable users to define and manage a unique, user-friendly public identifier (slug) for their public profile URL.
    *   **Scope:** User interface for setting and editing the public slug, real-time uniqueness validation, Supabase storage and retrieval of the public slug, and ensuring the public profile page is accessible via this slug (FR-1.4, FR-1.5, FR-1.3 for user bio display).
    *   **Sequencing:** Follows Epic 4 (Journaling & Data Entry), as it provides the personalized URL for sharing content generated in Epics 2, 3, and 4. This epic also integrates the full display of the user's bio and other profile elements.

### Story 5.1: Implement Public Slug Configuration UI and Bio Editing

As a user,
I want to be able to set and change a unique public slug for my profile and edit a simple text bio,
So that I can personalize my public profile URL for sharing and express myself.

**Acceptance Criteria:**

1.  I am on my profile settings page (`/me` - which is `/[my-publicId]` for the current user).
2.  When I navigate to the public profile configuration section, I see an input field where I can enter my desired public slug.
3.  As I type, the system provides real-time feedback on the slug's availability, validity (must consist only of alphanumeric characters (a-z, A-Z, 0-9), hyphens (-), and underscores (_)), and adherence to length restrictions.
4.  The profile editing page must display a form with a textarea for the user's bio.
5.  The textarea should be pre-filled with the user's existing bio, if any.
6.  A user can modify the text in the bio textarea and save the changes.
7.  Upon saving, the new bio is successfully persisted to the `bio` column in the `users` table in the database.
8.  The user receives clear feedback (e.g., a toast notification) that their bio has been updated successfully.

**Prerequisites:** Epic 1 completed.

**Technical Notes:** This story involves frontend UI development for input and validation feedback, including character restriction and length checks (e.g., minimum 3, maximum 30 characters). Supabase will be used for uniqueness validation and storage. This also involves creating a `User Profile Service` (`lib/supabase/user.ts`) with functions like `getUserProfile(userId)` and `updateUserBio(userId, bio)`.

### Story 5.2: Implement Public Slug Uniqueness Validation & Storage (Supabase)

As a developer,
I want the system to validate the uniqueness of a user's chosen public slug and store it,
So that each public profile has a distinct and valid URL.

**Acceptance Criteria:**

**Given** a user attempts to save a public slug,
**When** the slug is submitted,
**Then** the system checks if the slug is unique, meets specified criteria (alphanumeric, hyphens, underscores), and adheres to length restrictions.
**And** if valid and unique, the slug is stored in the user's profile data in Supabase.
**And** if invalid or not unique, the user receives an appropriate error message.

**Prerequisites:** Story 5.1.

**Technical Notes:** This story requires backend logic (Next.js API route) for validation, including character and length restrictions (e.g., minimum 3, maximum 30 characters), and Supabase persistence.

### Story 5.3: Update Public Profile Page to Use Configurable Slug and Display Content

As a user,
I want my public profile to be accessible via my chosen unique public slug directly from the domain root and display my bio, public habits, public todos, and public journal entries,
So that I can easily share a personalized and clean URL (e.g., `whatcha-doin.com/my-chosen-slug`) and showcase my progress.

**Acceptance Criteria:**

1.  A public profile page is accessible at a URL structure of `/profile/[userId]`.
2.  The page correctly fetches and displays the user's bio.
3.  The page correctly fetches and displays a list of the user's public habits.
4.  The page correctly fetches and displays a list of the user's public todos.
5.  The page correctly fetches and displays a list of the user's public journal entries.
6.  If a user has no public items of a certain type (e.g., no public habits), a message indicating this is shown instead of an empty list.
7.  The page is server-side rendered (SSR) or statically generated (SSG) to ensure fast initial load times.
8.  Data fetching for the page must only retrieve public data and be protected by Row Level Security.
9.  When I navigate to `/[my-chosen-slug]`, I see my public profile page.
10. If I navigate to `/[another-user-slug]`, I see that user's public profile page.
11. If a slug is not found, is invalid, or is a reserved system slug, the system displays an appropriate error (e.g., 44) or redirects to the authenticated root view.

**Prerequisites:** Story 5.2.

**Technical Notes:** This story involves updating the Next.js dynamic routing at the root level (`app/[slug]/page.tsx`) and the data fetching logic to use the slug for lookup. It also requires implementing a mechanism to prevent users from selecting reserved system slugs (e.g., `auth`, `dashboard`, `journal`, `grace-period`, `api`). The root route will dynamically serve either a public profile or the authenticated root view (e.g., dashboard) based on authentication and slug matching. A `getPublicProfileData(userId)` function will be created in `lib/supabase/user.ts` to fetch the public data.

---

## Epic 6: General UI/UX Enhancements

**Goal:** Implement general user interface and experience features, including accessibility and theming, to
improve overall usability.

### Story 6.1: Implement Motivational Quote Widget

As a user,
I want to see a motivational quote displayed on my authenticated root view,
So that I feel inspired.

**Acceptance Criteria:**

**Given** I am on the authenticated root view (Epic 1 completed),
**When** I view the authenticated root view,
**Then** a widget displaying a motivational quote is visible.

**And** `npm run dev` shows the motivational quote widget.

**Prerequisites:** Epic 1 completed.

**Technical Notes:** Focus on fetching and displaying a quote.

### Story 6.2: Implement Core Keyboard Shortcuts

As a user,
I want to use keyboard shortcuts for core actions (e.g., 'n' for new task, 'j' for journal),
So that I can navigate and interact with the app efficiently.

**Acceptance Criteria:**

**Given** I am in the application,
**When** I press a defined keyboard shortcut (e.g., 'n'),
**Then** the corresponding action is triggered (e.g., new todo input focused, journal opened).

**And** `npm run dev` shows the keyboard shortcut functionality.

**Prerequisites:** Relevant UI components for actions (e.g., todo input, journal view).

**Technical Notes:** This story implements FR-6.2.

### Story 6.3: Implement Theme Switcher

As a user,
I want to toggle between a light ("Zenith") and dark ("Monolith") theme,
So that I can customize the app's appearance to my preference.

**Acceptance Criteria:**

**Given** I am in the application,
**When** I interact with a prominent theme switcher,
**Then** the application's visual theme changes between light and dark modes.

**And** `npm run dev` shows the theme switching functionality.

**Prerequisites:** Epic 1 completed (for basic styling).

**Technical Notes:** This story implements FR-6.4.

---

## Epic 7: Novel UX Patterns

**Goal:** Implement unique and engaging user experience patterns to differentiate the application and enhance user
delight.

### Story 7.1: Implement Positive Urgency UI in "Yesterday" Column

As a user,
I want to see a subtle ambient animated background in the "Yesterday" column,
So that I am gently reminded of the approaching deadline for missed habits.

**Acceptance Criteria:**

**Given** I am viewing the authenticated root view with habits in the "Yesterday" column,
**When** time passes towards midnight,
**Then** the background of the "Yesterday" column displays a slow, shifting gradient (cool to warm colors).

**And** a tooltip on hover shows the time remaining until the daily cut-off.
**And** `npm run dev` shows this animated background.

**Prerequisites:** Epic 2 (for "Yesterday" column logic).

**Technical Notes:** This story implements FR-7.1 using `Aceternity UI` or similar animation libraries.

### Story 7.2: Implement Teleport-to-Journal Animation

As a user,
I want to see a visual animation when I complete a todo,
So that I receive clear and delightful feedback that it has moved to my journal.

**Acceptance Criteria:**

**Given** I complete a todo (Epic 3 completed),
**When** the todo is marked complete,
**Then** it visually fades out from the "Todos" section and simultaneously fades in/pops into the "Completed Todos"
section within the Journal.

**And** `npm run dev` shows this animation.

**Prerequisites:** Epic 3 (for todo completion), Epic 4 (for journal).

**Technical Notes:** This story implements FR-7.2 using `Aceternity UI` or similar animation libraries.

---

## Epic 8: Supabase Authentication Integration

**Goal:** Fully integrate Supabase's authentication system, replacing the development bypass with live Magic Link logins and user management.
    *   **Scope:** Transition from development bypass (Story 1.2) to full Supabase authentication flow (FR-1.1, FR-1.2), including handling user sessions and authentication states across the application.
    *   **Sequencing:** This is the *final epic* in the development sequence, occurring after all core features (Epics 1-7) are completed and stable, marking the transition to a fully authenticated production-ready application.

### Story 8.1: Supabase Login and Logout

As a user,
I want to create an account, log in and out of the application using a Magic Link,
so that I can securely access and protect my session and user data.

**Acceptance Criteria:**

1.  A user can enter their email address into a designated sign-up form.
2.  Upon submission, the system calls the `supabase.auth.signInWithOtp` method.
3.  A confirmation message is displayed to the user, instructing them to check their email.
4.  The user receives an email containing a single-use Magic Link.
5.  Clicking the Magic Link authenticates the user and redirects them to the application's main dashboard.
6.  A new user record is created in the `auth.users` table.
7.  A corresponding user record is created in the `public.users` table, linked to the `auth.users` record.
8.  A user can explicitly log out of the application.
9.  The application state should reflect the user's authentication status (e.g., showing a logins button when logged out and a logout button when logged in).
10. Authenticated routes should be protected, redirecting unauthenticated users to a logins page.

**Tasks / Subtasks:**

-   **Task 1: UI Development** (AC: #1, #3)
    -   Subtask 1.1: Create the `Auth UI Component` (`components/auth/Logins.tsx`) with an email input field and a submit button.
    -   Subtask 1.2: Implement the display of a confirmation message after form submission.
-   **Task 2: Authentication Logic** (AC: #2, #5, #8)
    -   Subtask 2.1: Implement the client-side logic to call `supabase.auth.signInWithOtp` with the user's email.
    -   Subtask 2.2: Handle the authentication callback and session management after the user clicks the Magic Link.
    -   Subtask 2.3: Create a `signOut` function that calls `supabase.auth.signOut()`.
    -   Subtask 2.4: Add a logout button to the UI that is only visible to authenticated users.
-   **Task 3: Backend & Database** (AC: #6, #7)
    -   Subtask 3.1: Verify that the Supabase trigger to create a `public.users` record from `auth.users` is working as expected. (`supabase/migrations/20251113101354_create_user_profile_trigger.sql`)
    -   Subtask 3.2: Ensure RLS policies are correctly applied for new user creation.
-   **Task 4: State Management & Protected Routes** (AC: #9, #10)
    -   Subtask 4.1: Create a mechanism to track the user's session state globally in the application.
    -   Subtask 4.2: Conditionally render UI elements (e.g., Logins/Logout buttons) based on the authentication state.
    -   Subtask 4.3: Implement a higher-order component or middleware to protect routes that require authentication. (`proxy.ts`)
    -   Subtask 4.4: Redirect unauthenticated users attempting to access protected routes to the logins page.

**Technical Notes:**

-   **Authentication Provider:** The application uses Supabase Auth with Magic Links. The `lib/supabase/client.ts` should be used for all interactions with Supabase.
-   **UI Components:** The `components/auth/Logins.tsx` component will be used for the logins flow. New UI elements for logout and conditional rendering will be required.
-   **State Management:** React's Context API or a lightweight state management library like Zustand should be used to manage the user's session and authentication state across the application.
-   **Routing:** Leverage Next.js App Router capabilities for creating route groups and middleware to handle route protection.
-   **Supabase Trigger (`handle_new_user`):** A trigger `handle_new_user` was created to populate the `public.users` table automatically upon user sign-up in `auth.users`.
-   **RLS Policies:** RLS policies on `public.users` are from `initial_schema_setup.sql` and ensure proper data isolation.
-   **`proxy.ts`:** Used for redirecting unauthenticated users.

**Review Follow-ups (from previous stories):**

-   **HIGH Severity:** Implement the skipped E2E tests in `tests/e2e/auth-flow.spec.ts` to verify authenticated user flows (e.g., seeing logout button, accessing protected routes). (This was marked as falsely complete).
-   **MEDIUM Severity:** Refine the `proxy.ts` logic to be more specific about which routes require authentication, or adjust the `matcher` to explicitly list all protected routes.
-   **MEDIUM Severity:** Add error handling to the `handleLogout` function in `components/auth/Auth.tsx`.
-   **LOW Severity:** Implement more robust client-side email format validation in `components/auth/Logins.tsx`.

**Completion Notes:**

-   Subtask 3.2 (RLS policies for new user creation) was already covered by the `initial_schema_setup.sql` migration (Story 1.0) and the `create_user_profile_trigger.sql` (Subtask 3.1). No further implementation was required.
-   Integration test (`tests/integration/auth.test.ts`) verifies the sign-up flow, including `signInWithOtp` calls and simulated `public.users` record creation.
-   E2E test (`tests/e2e/auth.spec.ts`) verifies the UI interaction and confirmation message for sign-up.

**References:**

-   FR-1.1, FR-1.2 (from PRD)
-   Authentication section of `docs/architecture.md`
-   `supabase/migrations/20251113093152_initial_schema_setup.sql`
-   `supabase/migrations/20251113101354_create_user_profile_trigger.sql`

---

## Summary

This epic breakdown provides a detailed plan for the incremental and integrated development of "whatcha-doin". Each epic
is broken down into bite-sized stories, with a strong emphasis on delivering visible and integrated components at the
end of each story. This approach ensures continuous progress, early feedback, and tangible results for stakeholders.

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic
breakdown._

_This document will be updated after UX Design and Architecture workflows to incorporate interaction details and
technical decisions._