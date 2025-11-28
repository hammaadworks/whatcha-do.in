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
session will be injected (see Epic 1, Story 1.2) to bypass the full authentication flow. This bypass will now mock a Supabase session by directly interacting with Supabase tables using the hardcoded user's `user_id`, bypassing Supabase Authentication for data operations. After successful authentication (or bypass), the user will be on their root-level profile `/[username]`, which serves as the entry point for their entire private dashboard experience (e.g., `/[username]/habits`).

**Living Document Notice:** This is the initial version. It will be updated after UX Design and Architecture workflows
add interaction and technical details to stories.

Here's the proposed epic structure, designed to facilitate incremental and integrated development, ensuring visible
progress and continuous value delivery:

*   **Epic 1: Core Application Foundation & Authenticated Root View**
Goal: Establish the foundational project infrastructure, implement a development-friendly bypass for Supabase data interaction, and lay out the basic authenticated UI, which is the user's main dashboard located at `/[username]`.
    *   **Scope:** Project setup, core infrastructure, development data interaction bypass (mocking Supabase Auth and directly using tables with a hardcoded user ID), the basic authenticated root view at `/[username]` (bio, todo, three-box sections), and initial setup for user authentication (FR-1.1, FR-1.2 for future, FR-1.3 for current).
    *   **Sequencing:** This is the absolute first epic, providing the essential environment and core authenticated UI before any
        feature-specific development begins.
    *   **System Architecture Alignment:** This epic directly implements the User Management and Authentication components, leveraging **Supabase Auth** for Magic Link functionality and **Supabase PostgreSQL** for storing user profile data in the `users` table. All security and data access will be governed by the **Row Level Security (RLS)** policies and **JWT-based authentication**. Public profile pages will be **Server-Side Rendered (SSR)** or **Static Site Generated (SSG)** Next.js pages for fast load times (NFR-1.1).
    *   **Services and Modules:**
        *   **Supabase Auth:** Handles user sign-up, logins (Magic Link), logout, and session management.
        *   **User Profile Service** (`lib/supabase/user.ts`): Provides an abstraction layer for interacting with the `users` table.
        *   **Auth UI Component** (`components/auth/Logins.tsx`): Renders the UI for email input and handles the call to Supabase Auth.
        *   **Public Profile Page** (`app/[username]/page.tsx`): Fetches and displays a user's public profile information.
    *   **Data Models and Contracts (`users` table schema):**
        ```sql
        CREATE TABLE public.users (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email VARCHAR(255) UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
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

**Prerequisites:** None.

### Story 1.1: Project Setup and Core Infrastructure

As a developer,
I want the project to have a standardized setup with core dependencies, build system, and basic deployment pipeline,
So that all subsequent development can proceed efficiently and consistently.

**Prerequisites:** None.

### Story 1.2: Implement Development Login Bypass

As a developer,
I want to bypass the full Supabase login flow during local development,
So that I can quickly test core features using a predefined user session without repeated logins.

**Prerequisites:** Story 1.1.

### Story 1.3: Establish `username` in Database and Create Profile Page

As a developer,
I want to add a `username` column to the `users` table and create the basic page structure for the `/[username]` dynamic route,
So that there is a foundation for the user's profile and main authenticated view.

**Acceptance Criteria:**

1.  A new Supabase migration file is created that adds a `username` column to the `public.users` table.
2.  The `username` column is of type `text` and has a `UNIQUE` constraint.
3.  The migration is successfully applied to the database.
4.  The `app/[username]/page.tsx` file is created.
5.  When navigating to `/[username]` (e.g., `/hammaadworks`), the page renders without errors.

**Prerequisites:** Story 1.2 completed.

**Technical Notes:** This story is a foundational step to enable the `/[username]` routing pattern. The page itself can be a simple placeholder for now. The migration should also update the existing test user with a default username.

### Story 1.4: Implement Default Username Generation at Signup

As a new user,
I want a default username to be automatically generated for me from my email address upon signup,
So that I have a valid profile URL from the start without extra steps.

**Acceptance Criteria:**

1. A Supabase Database Function is created that triggers on a new user insert into `auth.users`.
2. The function extracts the local part of the new user's email (before the '@').
3. It checks if the extracted username already exists in `public.users`.
4. If the username is unique, it is inserted into the `username` column for the new user.
5. If the username is not unique, a random 3-digit number is appended (e.g., `abc_198`), and this new username is inserted.
6. The function handles potential race conditions and ensures a unique username is always generated.

**Prerequisites:** Story 1.3 completed.

7. When a user navigates to `/[username]`, the system first checks if the username exists. If not, it displays the application's 404 Not Found page.

### Story 1.5: Implement Foundational Authenticated Main View Layout

As a user,
I want to see the basic layout of my private profile view at `/[username]`, including placeholders for my bio, todo list, and the three
habit columns ("Today", "Yesterday", and "The Pile"),
So that I have a clear structure for where my habits and todos will appear.

**Prerequisites:** Story 1.3.

**Technical Notes:** This layout will be implemented within `app/[username]/page.tsx` and its corresponding layout file.

### Story 1.6: Integrate Existing HabitCard into "The Pile"

As a user,
I want to see a sample habit card displayed within "The Pile" column on my main view,
so that I can visualize how my habits will appear and confirm the basic integration of habit components.

**Prerequisites:** Story 1.4.

### Story 1.7: Refactor and Integrate HabitCreator into "The Pile"

As a user,
I want to be able to see and interact with the habit creation input field within "The Pile" column,
So that I can understand how to add new habits to my list.

**Prerequisites:** Story 1.5.

---

## Epic 2: Habit Management Core

**Goal:** Implement all core habit-related functionalities, including creation, display, and advanced lifecycle
management (e.g., drag-and-drop, daily state changes, Two-Day Rule).

### Story 2.1: Implement Visible Streak Counter

As a user,
I want to see a visible streak counter on each habit, which resets on a missed day but preserves the value of the most recently broken streak,
so I am motivated to start again.

**Prerequisites:** Story 1.5.

### Story 2.2: Implement Habit Creation

As a user,
I want to create a new habit with a name directly in "The Pile", with the option to also set a quantitative goal,
so I can quickly add new activities to track. The habit should default to Public.

**Prerequisites:** Story 1.6.

### Story 2.3: Implement Habit Editing

As a user, I want to edit a habit's name and its public/private status so that I can correct mistakes and control its visibility.

**Prerequisites:** Story 2.2.

### Story 2.4: Implement Habit Deletion

As a user,
I want to delete a habit from "The Pile",
so that I can permanently remove activities I'm no longer tracking.

**Prerequisites:** Story 2.3.

### Story 2.5: Implement Quantitative Goals

As a user,
I want to set and modify a quantitative goal for a habit by providing a number and selecting a unit from a list (e.g., "pages", "minutes") or entering my own custom unit,
so I can track specific, measurable outcomes.

**Prerequisites:** Story 2.4.

### Story 2.6: Implement Goal Change Logic

As a user,
I want to change the quantitative goal of a habit, and ensure its current streak remains unchanged,
so that I can adjust my targets without losing my progress.

**Prerequisites:** Story 2.5.

### Story 2.7: Implement Drag-and-Drop for Habits (Desktop)

As a desktop user,
I want to drag habit cards between "Today", "Yesterday", and "The Pile" columns,
So that I can easily manage my habits.

**Prerequisites:** Epic 1 completed.

### Story 2.8: Implement Tap-to-Move for Habits (Mobile)

As a mobile user,
I want to tap a habit card to move it between "Today", "Yesterday", and "The Pile" columns,
So that I can easily manage my habits on a touch device.

**Prerequisites:** Epic 1 completed.

### Story 2.9: Implement Daily State Change Logic

As a user,
I want my habits to automatically transition between "Today" and "Yesterday" at midnight in my local timezone,
So that my daily habit tracking is accurate.

**Prerequisites:** Epic 1 completed.

### Story 2.10: Implement "Grace Period" Screen

As a user,
I want to be presented with an "End of Day Summary" screen if I have pending habits from the previous day when I first
open the app on a new day,
So that I can manage my missed habits before my streak is affected.

**Prerequisites:** Story 2.9.

### Story 2.11: Implement "Two-Day Rule" - Lively State

As a user,
I want a habit that I missed yesterday to enter a "Lively" state in "The Pile" for 24 hours,
So that I have a chance to recover my streak.

**Prerequisites:** Story 2.9.

### Story 2.12: Implement "Two-Day Rule" - Junked State

As a user,
I want a "Lively" habit to become "Junked" if not rescued within 24 hours,
So that my streak is reset and I am aware of neglected habits.

**Prerequisites:** Story 2.11.

### Story 2.13: Display Junked Days Counter

As a user,
I want to see a counter indicating how many days a "Junked" habit has been neglected,
So that I am motivated to restart it.

**Prerequisites:** Story 2.12.

### Story 2.14: Implement Undo Completion

As a user,
I want to be able to undo a habit completion from the "Today" column,
So that I can correct mistakes.

**Prerequisites:** Story 2.9.

---

## Epic 3: Todo Management

**Goal:** Enable users to create, manage, and complete one-off tasks with privacy controls and sub-task
capabilities.

### Story 3.1: Implement Todo Creation Input

As a user,
I want to see an input field in the "Todos" section of my authenticated root view to create new todos,
So that I can easily add one-off tasks.

**Prerequisites:** Epic 1 completed.

### Story 3.2: Create and Display Basic Todos

As a user,
I want to create a todo and see it appear in a list within the "Todos" section,
So that I can keep track of my tasks.

**Prerequisites:** Story 3.1.

### Story 3.3: Implement Todo Completion

As a user,
I want to mark a todo as complete,
So that I can track my progress and clear completed tasks.

**Prerequisites:** Story 3.2.

### Story 3.4: Implement Todo Deletion

As a user,
I want to delete a todo,
So that I can remove unwanted tasks from my list.

**Prerequisites:** Story 3.2.

### Story 3.5: Implement Todo Privacy Toggle

As a user,
I want to mark a todo as public or private,
So that I can control what information is visible on my public profile.

**Prerequisites:** Story 3.2.

### Story 3.6: Implement 2-Level Sub-Todos

As a user,
I want to create sub-todos by pressing `Tab` when creating a todo,
So that I can break down complex tasks into smaller steps.

**Prerequisites:** Story 3.2.

---

## Epic 4: Journaling & Data Entry

**Goal:** Provide a comprehensive journaling system integrated with habit/todo completion, allowing for detailed logging
and reflection.

### Story 4.1: Implement Habit/Todo Completion Modal Trigger

As a user,
I want a modal to appear when I mark a habit or todo as complete,
So that I can record details about my completion.

**Prerequisites:** Epic 2 (for habits), Epic 3 (for todos).

### Story 4.2: Display Streak and Mood Selector in Completion Modal

As a user,
I want to see my streak count and select my mood in the completion modal,
So that I can track my progress and emotional state.

**Prerequisites:** Story 4.1.

### Story 4.3: Implement Quantitative Goal and Work Input in Modal

As a user,
I want to input my completed "work" against a quantitative goal in the modal,
So that I can track my progress on specific targets.

**Prerequisites:** Story 4.1, FR-2.6 (quantitative goals).

### Story 4.4: Implement Duration Input and Notes in Modal

As a user,
I want to record the duration and add free-form notes in the completion modal,
So that I can capture additional context about my completion.

**Prerequisites:** Story 4.1.

### Story 4.5: Implement Modal Bypass and Cancel

As a user,
I want to bypass detail entry or cancel the completion modal,
So that I can quickly log items or discard accidental completions.

**Prerequisites:** Story 4.1.

### Story 4.6: Implement Modal Pre-fill for Re-records

As a user,
I want the completion modal to pre-fill with my last recorded values if I re-record a habit on the same day,
So that I don't have to re-enter the same information.

**Prerequisites:** Story 4.1, Story 2.12 (undo completion).

### Story 4.7: Implement Dual-View Journal Layout

As a user,
I want to see a dual-view journal with "Public" and "Private" sections,
So that I can separate my personal reflections from shareable content.

**Prerequisites:** Epic 1 completed.

### Story 4.8: Implement Automatic Journaling for Public Items

As a user,
I want notes from completed public items to be automatically added to my Public Journal,
So that my journal is automatically populated with my public progress.

**Prerequisites:** Story 4.4, Story 4.7.

### Story 4.9: Implement Automatic Journaling for Private Items

As a user,
I want notes from completed private items to be automatically added to my Private Journal,
So that my private reflections are captured.

**Prerequisites:** Story 4.4, Story 4.7.

### Story 4.10: Implement Free-Form Journal Entry

As a user,
I want to add free-form text directly to either my public or private journal,
So that I can record thoughts not tied to specific habit completions.

**Prerequisites:** Story 4.7.

### Story 4.11: Implement Journal Entry Editing

As a user,
I want to edit the content of any journal entry at any time,
So that I can refine my reflections.

**Prerequisites:** Stories 4.8, 4.9, or 4.10.

### Story 4.12: Implement Journal Date Selector

As a user,
I want to select a date to view past journal entries,
So that I can review my history.

**Prerequisites:** Story 4.7.

---

## Epic 5: Username Configuration

**Goal:** Enable users to define and manage a unique, user-friendly username for their public profile URL.
    *   **Scope:** User interface for setting and editing the username, real-time uniqueness validation, Supabase storage and retrieval of the username, and ensuring the public profile page is accessible via this username (FR-1.4, FR-1.5, FR-1.3 for user bio display).
    *   **Sequencing:** Follows Epic 4 (Journaling & Data Entry), as it provides the personalized URL for sharing content generated in Epics 2, 3, and 4. This epic also integrates the full display of the user's bio and other profile elements.

### Story 5.1: Implement Username Configuration UI and Bio Editing

As a user,
I want to be able to set and change a unique username for my profile and edit a simple text bio,
So that I can personalize my public profile URL for sharing and express myself.

**Prerequisites:** Epic 1 completed.

### Story 5.2: Implement Username Uniqueness Validation & Storage (Supabase)

As a developer,
I want the system to validate the uniqueness of a user's chosen username and store it,
So that each public profile has a distinct and valid URL.

**Prerequisites:** Story 5.1.

### Story 5.3: Update Public Profile Page to Use Configurable Username and Display Content

As a user,
I want my public profile to be accessible via my chosen unique username directly from the domain root and display my bio, public habits, public todos, and public journal entries,
So that I can easily share a personalized and clean URL (e.g., `whatcha-doin.com/my-chosen-username`) and showcase my progress.

**Prerequisites:** Story 5.2.

---

## Epic 6: General UI/UX Enhancements

**Goal:** Implement general user interface and experience features, including accessibility and theming, to
improve overall usability.

### Story 6.1: Implement Motivational Quote Widget

As a user,
I want to see a motivational quote displayed on my authenticated root view,
So that I feel inspired.

**Prerequisites:** Epic 1 completed.

### Story 6.2: Implement Core Keyboard Shortcuts

As a user,
I want to use keyboard shortcuts for core actions (e.g., 'n' for new task, 'j' for journal),
So that I can navigate and interact with the app efficiently.

**Prerequisites:** Relevant UI components for actions (e.g., todo input, journal view).

### Story 6.3: Implement Theme Switcher

As a user,
I want to toggle between a light ("Zenith") and dark ("Monolith") theme,
So that I can customize the app's appearance to my preference.

**Prerequisites:** Epic 1 completed (for basic styling).

---

## Epic 7: Novel UX Patterns

**Goal:** Implement unique and engaging user experience patterns to differentiate the application and enhance user
delight.

### Story 7.1: Implement Positive Urgency UI in "Yesterday" Column

As a user,
I want to see a subtle ambient animated background in the "Yesterday" column,
So that I am gently reminded of the approaching deadline for missed habits.

**Prerequisites:** Epic 2 (for "Yesterday" column logic).

### Story 7.2: Implement Teleport-to-Journal Animation

As a user,
I want to see a visual animation when I complete a todo,
So that I receive clear and delightful feedback that it has moved to my journal.

**Prerequisites:** Epic 3 (for todo completion), Epic 4 (for journal).

---

## Epic 8: Supabase Authentication Integration

**Goal:** Fully integrate Supabase's authentication system, replacing the development bypass with live Magic Link logins and user management.
    *   **Scope:** Transition from development bypass (Story 1.2) to full Supabase authentication flow (FR-1.1, FR-1.2), including handling user sessions and authentication states across the application.
    *   **Sequencing:** This is the *final epic* in the development sequence, occurring after all core features (Epics 1-7) are completed and stable, marking the transition to a fully authenticated production-ready application.

### Story 8.1: Supabase Login and Logout

As a user,
I want to create an account, log in and out of the application using a Magic Link,
so that I can securely access and protect my session and user data.

**Prerequisites:** Epic 1-7 completed.
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
