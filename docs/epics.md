# whatcha-doin - Epic Breakdown

**Author:** hammaadworks
**Date:** 2025-12-08
**Project Level:** MVP
**Target Scale:** 10,000 Users

---

## Overview

This document provides the complete epic and story breakdown for whatcha-doin, decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

**CRITICAL ARCHITECTURAL DECISION:** The application will leverage **Supabase** for all data persistence.
**Important Development Note:** For local development, a predefined user session is injected to bypass full authentication.

---

## Epic 1: Core Application Foundation & Authenticated Root View

**Goal:** Establish the foundational project infrastructure, implement a development-friendly bypass for Supabase data interaction, and lay out the basic authenticated UI at `/[username]`.

### Story 1.0: Initial Database Schema Setup
**As a developer,** I want to create and commit the initial database schema migrations for all core entities, **so that** the database is ready for application development.

### Story 1.1: Project Setup and Core Infrastructure
**As a developer,** I want the project to have a standardized setup with core dependencies, build system, and basic deployment pipeline, **so that** development can proceed efficiently.

### Story 1.2: Implement Development Login Bypass
**As a developer,** I want to bypass the full Supabase login flow during local development, **so that** I can quickly test core features using a predefined user session.

### Story 1.3: Establish `username` in Database and Create Profile Page
**As a developer,** I want to add a `username` column to the `users` table and create the basic page structure for `/[username]`, **so that** there is a foundation for the user's profile.

### Story 1.4: Implement Default Username Generation at Signup
**As a new user,** I want a default username to be automatically generated from my email, **so that** I have a valid profile URL immediately.

### Story 1.5: Implement Foundational Authenticated Main View Layout
**As a user,** I want to see the basic layout of my private profile view (Bio, Actions, and the three-column Habit Board), **so that** I have a clear structure for my dashboard.

---

## Epic 2: Habit Management Core (The "Identity Engine")

**Goal:** Implement the core Habit Board ("Today", "Yesterday", "The Pile"), the "Two-Day Rule" logic, real-time completion logging, and the detailed "Habit Lifecycle" from creation to "Junked".

**Source of Truth:**
*   **PRD:** FR-2 (Habits), FR-7 (Novel UX).
*   **Wiki:** `journal-on-marked-next-day-clearing-strategy.md` (Real-time logging).
*   **Architecture:** `habits` table, `habit_completions` table.

### Story 2.1: Habit Creation & "The Pile"
**As a user,**
I want to create a new habit in "The Pile" with a name, optional quantitative goal, and visibility setting,
**So that** I can start tracking a new behavior without immediate pressure.

**Acceptance Criteria:**
1.  **Input:** "The Pile" column has an inline input field "Add a new habit...".
2.  **Goal Setting:** As I type, an "Add Goal" button appears. Clicking it allows defining a `goal_value` (number) and `goal_unit` (e.g., pages, minutes, reps, or custom).
3.  **Privacy:** Toggle available for `is_public` (Default: Public).
4.  **Creation:** Pressing Enter creates the habit.
    *   State: `pile` (Inactive).
    *   Streak: `0`.
    *   Location: Appears at the top of "The Pile".
5.  **Database:** Insert into `habits` table.

### Story 2.2: Habit Interaction & Drag-and-Drop (Desktop)
**As a desktop user,**
I want to drag habits between "The Pile", "Today", and "Yesterday" to manage my focus,
**So that** I can actively plan my day.

**Acceptance Criteria:**
1.  **Pile -> Today:** Activates the habit for the current day.
2.  **Yesterday -> Today:** specific logic (User doing yesterday's task *today*? Or moving it to current focus?). *Decision: Moves the card to "Today" column, implying it is now a task for today.*
3.  **Ordering:** Users can reorder habits within a column.
4.  **Persistence:** Column state is saved locally or via optimisic UI updates.

### Story 2.3: Mobile Interaction (Long-Press & Move)
**As a mobile user,**
I want to long-press a habit to move it between columns or access options,
**So that** I can manage habits on a touch device without drag-and-drop issues.

**Acceptance Criteria:**
1.  **Long-Press:** Triggers a menu or a "wiggle mode" to move the card to "Today" or "The Pile".
2.  **Tap:** Toggles completion (see Story 2.4).

### Story 2.4: Habit Completion & Real-Time Journaling
**As a user,**
I want to mark a habit as "Complete" and immediately log the details to my journal,
**So that** my progress is recorded and my streak increases.

**Acceptance Criteria:**
1.  **Trigger:** Clicking the checkbox/circle on a habit card.
2.  **Modal:** Opens the **Habit Completion Modal** (See Epic 4 for full modal details).
3.  **Data:** Upon saving the modal:
    *   Insert record into `habit_completions` table.
    *   **CRITICAL:** Call `JournalActivityService` to add entry to `journal_entries.activity_log`.
    *   Update `habits` table: `current_streak + 1`.
4.  **UI Feedback:** Card visual changes to "Completed" style (e.g., filled, green glow).
5.  **Undo:** Unchecking removes the `habit_completion` record, decrements streak, and removes the entry from `journal_entries.activity_log`.

### Story 2.5: Visual Streak Counter & Junked Logic
**As a user,**
I want to see a prominent streak counter on each habit card,
**So that** I am motivated to keep the number going.

**Acceptance Criteria:**
1.  **Badge:** A visible badge showing the `current_streak` integer.
2.  **Fire:** If streak > 3, show a 🔥 icon.
3.  **Junked Indicator:** If habit is in "Junked" state, show a generic "dead/skull" icon or a negative counter indicating days neglected.

### Story 2.6: Habit Editing & Deletion
**As a user,**
I want to edit a habit's details or delete it permanently if I no longer need it,
**So that** my habit list remains relevant.

**Acceptance Criteria:**
1.  **Edit:** Click to edit Name, Privacy, and Goal.
2.  **Goal Change Logic:** Changing a goal (e.g., 10 mins -> 20 mins) **does NOT** reset the current streak. The new goal applies immediately for the *next* completion.
3.  **Delete:** Only allowed from "The Pile". Requires confirmation ("Are you sure?"). Deletes habit and `habit_completions` (Soft delete preferred or hard delete with warning).

### Story 2.7: The "Daily State Change" (Midnight Logic)
**As a user,**
I want my habits to transition columns automatically at midnight (Local Time),
**So that** the board reflects the new day's reality.

**Acceptance Criteria:**
1.  **Trigger:** App load or background timer checks `User Local Time`.
2.  **Transitions:**
    *   **Today -> Yesterday:** All "Today" items (Completed OR Uncompleted) move to "Yesterday".
    *   **Yesterday -> Pile (Lively):** Uncompleted items in "Yesterday" move to "The Pile" and enter **"Lively"** state (Grace Period active).
    *   **Pile (Lively) -> Pile (Junked):** If a "Lively" habit is not completed within 24 hours, it becomes **"Junked"**.
3.  **Streak Protection:** Moving to "Lively" does *not* reset streak immediately, but marks it as "At Risk". Moving to "Junked" resets streak to 0.

### Story 2.8: Positive Urgency UI (Yesterday Column)
**As a user,**
I want the "Yesterday" column to have a distinct, urgent visual style,
**So that** I know these tasks are about to expire.

**Acceptance Criteria:**
1.  **Visuals:** Ambient animated background (gradient shift).
2.  **Tooltip:** "Complete these to save your streak!"
3.  **Scope:** Only applies to *uncompleted* habits in the Yesterday column.

### Story 2.9: Grace Period & End-of-Day Summary
**As a user,**
I want to see a summary screen if I open the app and have "Yesterday" tasks pending,
**So that** I have one last chance to mark them as done before they move to "The Pile".

**Acceptance Criteria:**
1.  **Trigger:** First app open of the day if `Yesterday` column has uncompleted items from `T-1`.
2.  **UI:** A focused modal showing the "At Risk" habits.
3.  **Actions:** "Mark as Done" (saves streak) or "Skip" (let them go to Pile/Lively).

---

## Epic 3: Action Management (The "Get Things Done" Engine)

**Goal:** Enable users to create, manage, and complete hierarchical "Actions" with unlimited nesting, leveraging JSONB.

### Story 3.1: Implement Timezone Management (Foundation)
**As a user,** I want to set my preferred timezone, **so that** daily logic happens at the correct time for me.

### Story 3.2: Display User's Local Time
**As a user,** I want to see my current "System Time" displayed, **so that** I can verify the app's time context.

### Story 3.3: Initialize Actions Schema (JSONB)
**As a developer,** I want to replace `todos` with `actions` (JSONB), **so that** the system supports unlimited nesting.

### Story 3.4: Implement Recursive Action Item Component
**As a user,** I want to see actions in a nested list, **so that** I can visualize task hierarchies.

### Story 3.5: Implement Action Creation and Nesting
**As a user,** I want to create and nest actions, **so that** I can break down large tasks.

### Story 3.6: Implement Action Privacy Toggling
**As a user,** I want to toggle public/private status of actions, **so that** I control my profile visibility.

### Story 3.7: Implement Action Keyboard Navigation
**As a power user,** I want to navigate and manipulate actions using keyboard shortcuts (Arrow keys, Tab/Shift+Tab), **so that** I can organize tasks efficiently.

### Story 3.8: Action Completion & Timestamping
**As a user,** I want to mark an action as complete, **so that** the system records the timestamp for clearing logic.

### Story 3.9: Action Deletion
**As a user,** I want to delete actions and their sub-trees, **so that** I can remove unwanted tasks.

### Story 3.10: Action Text Editing
**As a user,** I want to edit action text, **so that** I can refine task details.

---

## Epic 4: Journaling & Data Entry (The "Reflection Engine")

**Goal:** Provide a comprehensive journaling system integrated with habit/action completion, logging, and the "Next Day Clearing" strategy.

### Story 4.1: Completion Modal Trigger & Layout
**As a user,** I want a modal to appear when completing a Habit/Action, **so that** I can add details.
*   **Details:** Streak count, Mood Selector, Work Value (if quantitative), Duration, Notes.

### Story 4.2: Real-Time Activity Logging (The "JournalActivityService")
**As a developer,** I want to implement `JournalActivityService` to write completions directly to `journal_entries.activity_log` (JSONB), **so that** the journal is accurate in real-time.

### Story 4.3: "Next Day Clearing" Logic (Delete-on-Journal)
**As a user,** I want completed Actions/Targets to be **deleted** from the active list on the next day, **so that** my list stays clean.
*   **Logic:** If `completed_at` < Today (Local Time), delete from `actions` table. (Data is already safe in `activity_log`).

### Story 4.4: Teleport-to-Journal Animation
**As a user,** I want a visual animation when items are cleared, **so that** I feel the satisfaction of a clean slate.

### Story 4.5: Dual-View Journal (Public/Private)
**As a user,** I want separate tabs for Public and Private journal entries, **so that** I can control what I share.

### Story 4.6: Free-Form Journaling
**As a user,** I want to write free-form text in my journal, **so that** I can reflect beyond just checkboxes.

---

## Epic 5: Username Configuration

**Goal:** Enable users to define and manage a unique, user-friendly username for their public profile URL.

### Story 5.1: Username UI & Bio Editing
**As a user,** I want to set a unique username and edit my bio, **so that** I can personalize my profile.

### Story 5.2: Username Uniqueness Validation
**As a developer,** I want backend validation for usernames, **so that** duplicates are prevented.

### Story 5.3: Public Profile Routing
**As a user,** I want my profile accessible at `/[username]`, **so that** I can share my journey.

---

## Epic 6: General UI/UX Enhancements

**Goal:** Accessibility, Theming, and Shortcuts.

### Story 6.1: Motivational Quote Widget
**As a user,** I want to see a daily quote, **so that** I stay inspired.

### Story 6.2: Global Keyboard Shortcuts
**As a user,** I want shortcuts (`n`, `j`, `/`), **so that** I can navigate quickly.

### Story 6.3: Theme Switcher (Zenith/Monolith)
**As a user,** I want to toggle Light/Dark themes, **so that** the app matches my environment.

---

## Epic 7: Novel UX Patterns

### Story 7.1: Positive Urgency Ambient Background
**As a user,** I want the "Yesterday" column to have a shifting gradient background, **so that** I feel a subtle urge to complete pending tasks.

---

## Epic 8: Supabase Authentication Integration

**Goal:** Fully integrate Supabase Auth (Magic Link) for production.

### Story 8.1: Production Auth Flow
**As a user,** I want to log in via Magic Link, **so that** my account is secure.

---

## Epic 9: Bio, Identity, and Targets

**Goal:** Enhance the "Identity" aspect with linked habits and monthly targets.

### Story 9.1: Full-Screen Bio Editor
**As a user,** I want a focused editor for my bio, **so that** I can tell my story.

### Story 9.2: Identities System (CRUD)
**As a user,** I want to create "Identities" (e.g., "Writer"), **so that** I can link habits to who I want to become.

### Story 9.3: Link Habits to Identities
**As a user,** I want to link specific habits to an Identity, **so that** I can see the "Proof" of my identity.

### Story 9.4: Targets System (Monthly JSONB)
**As a user,** I want to set monthly targets, **so that** I can plan longer-term goals.

### Story 9.5: Target Rollover Logic
**As a user,** I want unfinished targets to roll over to the new month, **so that** nothing gets lost.