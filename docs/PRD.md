# whatcha-doin - Product Requirements Document

**Project:** whatcha-doin
**Author:** hammaadworks
**Date:** Wednesday, 12 November 2025
**Version:** 1.3

---

## Executive Summary

**NOTE:** For development purposes, Supabase authentication is temporarily bypassed. The application is configured to
directly interact with Supabase tables using a hardcoded test user's `user_id` for all feature development. This is
achieved by injecting the `user_id` via the `AuthProvider` component in `app/(main)/layout.tsx` when
`NEXT_PUBLIC_DEV_MODE_ENABLED=true`. Full Supabase authentication will be integrated in the final epic. To re-enable
Magic Link functionality for testing the final epic, set `NEXT_PUBLIC_DEV_MODE_ENABLED=false` in `.env.local` (or remove
it) and set `enable_signup = true` in `supabase/config.toml` under both `[auth]` and `[auth.email]` sections.

This PRD outlines the development of "whatcha-doin," a habit and todo tracking application designed to foster personal
growth and consistency. The vision is to create an intuitive, keyboard-first experience that empowers users to build
positive routines and reflect on their progress, ultimately leading to a more organized and fulfilling life.

### What Makes This Special

"whatcha-doin" stands out by combining robust habit/todo management with a unique journaling system and novel UX
patterns. Inspired by Isabella's timeless question from Phineas and Ferb, "Whatcha doin'?", this app provides a public
and dynamic answer: users can share their personalized domain profile (`domain/[username]`) to showcase their
activities, habits, and progress, turning a casual query into a powerful display of dedication. Its "keyboard-first"
design prioritizes efficiency, while features like the "Two-Day Rule," "Grace Period," "Positive Urgency UI," and "
Teleport-to-Journal Animation" create an engaging and motivating experience. The focus is on making habit building
intuitive, rewarding, and deeply integrated with personal reflection.

---

## Project Classification

**Technical Type:** Single Page Application (SPA) built with Next.js
**Domain:** Personal Productivity / Habit Tracking
**Complexity:** Moderate to High

"whatcha-doin" is classified as a Moderate to High complexity SPA in the Personal Productivity / Habit Tracking domain,
leveraging modern web technologies for a rich user experience.

---

## Success Criteria

The success of "whatcha-doin" will be measured by user engagement, habit completion rates, and positive feedback on the
unique UX features.

- **User Engagement:** High daily active users (DAU) and retention rates.
- **Habit Completion:** Increased average streak lengths and consistent habit completion.
- **User Satisfaction:** Positive feedback on the intuitiveness, efficiency, and motivational aspects of the
  application.
- **Feature Adoption:** High usage of core features like journaling, public profiles, and novel UX patterns.

---

## Product Scope

### MVP - Minimum Viable Product

This is the focused feature set required to deliver the core identity-building experience.

- **User System:** User accounts with Magic Link logins, a simple user bio, and a user-configurable, unique username for
  their public profile.
- **Core "Habits" System:** Create, edit, and delete recurring "habits" with a public/private flag. A three-column
  layout ("Today", "Yesterday", "The Pile") with drag-and-drop functionality. The "Two-Day Rule" governs streak
  management, and a visible streak counter is displayed on each habit.
- **Core "Todos" System:** Create, edit, and delete one-off "todos", also with a public/private flag.
    - **Journal System:** A dual-view journal with "Public" and "Private" tabs. Each entry now features a **read-only "Daily Activity Log"** that automatically captures timestamped details of completed Habits, Actions, and Targets in real-time. This log is stored in a dedicated JSONB column, ensuring immutability of activity records. Below this, users can add free-form text and edit their personal reflections at any time. The main UI shows today's entry by default, with a date selector to view past entries.
    - **Daily Interaction:** A recording modal appears upon completion of any habit or todo to log an effort score,
      duration, and notes.
    - **Content & Profile:** A motivational quote widget. A shareable public profile (accessible via `/[username]`) that
      displays the user's bio, all public habits and their streaks, all public todos, and the complete Public Journal.
      This same `/[username]` URL serves as the entry point to the private dashboard for the authenticated user.

### Growth Features (Post-MVP)

- **Advanced Profiles:** Allow users to customize their public profiles with themes, pinned habits, and achievement
  showcases.
- **Data Visualizations:** Introduce graphs and charts to show consistency, effort scores over time, and streak history.
- **Notifications:** Implement gentle push notification reminders for habits due today.
- **Social Integrations:** Enable users to automatically post major milestones (e.g., "Reached a 100-day streak!") to
  social media.
- **Advanced Journaling:** Add advanced search and filtering capabilities to the journal.

### Vision (Future)

- **AI Coach:** An AI agent that provides personalized encouragement, identifies patterns in user behavior, and suggests
  new habits.
- **Integrations:** Connect with third-party apps to automatically log activities (e.g., pull workouts from a fitness
  app).
- **"Life Resume":** A beautifully designed, exportable report that summarizes a user's entire journey, achievements,
  and consistency over years.

---

## Web App Specific Requirements

The project will be a Single Page Application (SPA) built with Next.js, providing a smooth, app-like user experience. It
should be optimized for modern browsers (e.g., Chrome, Firefox, Safari). The primary UI component library will be
`shadcn/ui`, complemented by `Aceternity UI` for animations and micro-interactions. SEO is not a priority for the
application itself. The application must support real-time synchronization of user data across different devices.

---

## User Experience Principles

The user experience will be centered around speed and efficiency, with a **"keyboard-first"** design philosophy. The
interface should be clean, intuitive, and minimize the need for mouse interaction. The interface must be rich with *
*micro-interactions and subtle visual cues** to provide clear feedback and make the experience feel alive. This includes
visual state changes (e.g., color, animation) when habits move between columns.

### Key Interactions

- Core interactions will be mapped to intuitive keyboard shortcuts (e.g., 'n' for a new task, 'j' to jump to the
  journal, arrow keys for navigation). While drag-and-drop will be supported for mouse users, keyboard alternatives must
  always be available and prioritized in the design.
- A key UX component is creating a sense of **positive urgency**. For example, a habit in the 'Yesterday' column should
  visually change as the 12 am deadline approaches to motivate the user to maintain their streak.

---

## Functional Requirements

This section details the specific functionalities of the application, derived from the scope and principles defined
above.

### FR-1: User & Profile Management

- **FR-1.1:** Users must be able to create an account using a Magic Link sent to their email address.
- **FR-1.1.1:** Upon account creation, the system must automatically generate a default `username`. This username will
  be derived from the user's email address (the part before the '@'). If the derived username is already taken, a random
  3-digit number will be appended (e.g., `abc_198`). Users can change this default username later in their settings.
- **FR-1.2:** The system must support user logins and logout.
- **FR-1.3:** Users must be able to edit a simple text bio for their profile. The editing interface must support a *
  *full-screen modal mode** (both on desktop and mobile) to facilitate writing longer content comfortably.
- **FR-1.4:** Each user must be able to configure a unique username which makes their public profile page accessible via
  a shareable, user-friendly URL (e.g., `/user-chosen-username`). The username must consist only of alphanumeric
  characters (a-z, A-Z, 0-9), hyphens (-), and underscores (_), and must be unique across all users.
- **FR-1.5:** The public profile page must display the user's bio, all public habits, all public todos, and the public
  journal.
- **FR-1.6:** Users must be able to explicitly select and save their preferred timezone in their profile settings. If
  not set, the system should default to the browser's detected timezone.
- **FR-1.7:** The user's current local time (or timezone identifier) must be displayed on their public and private
  profile. This provides context for visitors regarding the user's activity and deadlines.
- **FR-1.8 (Identity Management):** Users must be able to create "Identities" (e.g., "I want to be a runner").
    - **FR-1.8.1:** Identities are short "one-liners".
    - **FR-1.8.2:** Users can link Habits to Identities in a **Many-to-Many** relationship (a habit can back multiple
      identities).
    - **FR-1.8.3:** Identities can be marked Public or Private.
    - **FR-1.8.4:** The UI displays the identity statement and a count of backing habits. Clicking/tapping the identity
      reveals a description and the list of linked habits.
- **FR-1.9 (Target Management):** Users must be able to manage "Targets" in a monthly format.
    - **FR-1.9.1:** Targets are organized into 4 distinct buckets: "Future" (Backlog), "Current Month", "Previous
      Month", and "Previous-1 Month".
    - **FR-1.9.2:** Target lists support **nesting** (similar to Actions).
    - **FR-1.9.3 (Rollover):** On the 1st of a new month, a new empty record for the month is created. Uncompleted
      targets from the previous month are automatically carried over to the new current month. Completed targets remain
      in the previous month's record (until cleared by the daily cleanup logic).
    - **FR-1.9.4:** Users can move items from the "Future" bucket to the "Current Month".
- **FR-1.10 (Layout):** The private profile layout should be structured as:
    - Row 1: Bio (Full Width).
    - Row 2, Col 1: Identities.
    - Row 2, Col 2: Targets.

### FR-2: Habit Management (Recurring Habits)

- **FR-2.1:** Users must be able to create a new "habit" with a name via an inline input field within "The Pile" column.
  As the user types, a "+ Add Goal" button will appear, allowing them to optionally set a quantitative goal (number and
  unit) before creation. New habits default to 'Public' and start with a streak count of 0.
- **FR-2.2:** When creating or editing a habit, users must be able to mark it as "public" or "private".
- **FR-2.3:** Users must be able to edit the name and public/private status of an existing habit.
- **FR-2.4:** Users must be able to delete a habit, but only from "The Pile" column.
- **FR-2.5:** Each habit chip must display a visible streak counter badge.
- **FR-2.6:** Users must be able to set and modify a quantitative goal for a habit (e.g., "Read 5 pages"). The goal
  consists of a number and a unit. The unit can be selected from a predefined list (e.g., `minutes`, `hours`, `pages`,
  `reps`, `sets`, `questions`) or can be a custom value defined by the user.
- **FR-2.7:** When a habit's goal is upgraded or downgraded, the existing streak must continue uninterrupted. The new
  `goal_value` becomes the requirement for continuing the streak from the moment of change.
- **FR-2.8:** The system must support both broad habits (e.g., "Workout") and atomic habits (e.g., "10 Pushups"). For
  broad habits, the UI will allow for logging details (e.g., reps, duration, specific activities) within the completion
  flow without requiring separate habit definitions.
- **FR-2.9:** Users must be able to click on any habit chip to open a modal that displays a read-only summary of the
  habit's details, such as its name, current streak, goal, public/private status, and creation date.

### FR-3: Action Management (Formerly Todos)

- **FR-3.1:** Users must be able to create a new "Action" (formerly todo) with a text description. This system replaces
  the traditional todo list with an "Actions" section.
- **FR-3.2:** The "Actions" system must support **unlimited deep nesting** of sub-actions. Users can create nested
  structures (e.g., Action A -> a1 -> a1.1) to organize complex tasks. Keyboard shortcuts (`Tab` for indent, `Shift+Tab`
  for outdent) will be available for efficient manipulation of the hierarchy.
- **FR-3.3:** When creating or editing an action, users must be able to mark it as "public" or "private" via a `🌐/🔒`
  privacy toggle. This privacy setting applies to the specific action node, with the following propagation rules:
    - If a parent action is private, all its children (and their descendants) *must* also be private. Toggling a private
      parent to public will also make its children public.
    - If a child action is made public, all its ancestors (up to the root) *must* also become public to maintain
      visibility.
- **FR-3.4:** Users must be able to mark any action node (parent or child) as complete. A parent action cannot be marked
  complete if it has uncompleted sub-actions.
- **FR-3.5:** Users must be able to delete an action. Deleting a parent action deletes all its children.
- **FR-3.6 (Next Day Clearing & Teleport Logic):** "Actions" and "Targets" share a specific lifecycle for clearing
  completed items to ensure a lightweight database and focused UI.
    - **FR-3.6.1:** Completed items remain visible in the UI for the remainder of the day they were completed.
    - **FR-3.6.2:** On the "next day" (after midnight), completed items are processed by the "Teleport" logic: they are **permanently deleted** from the structured "Actions" or "Targets" database storage, as their real-time completion records are already present in the journal's `activity_log`.
    - **FR-3.6.3:** Once successfully journaled, the completed items are **permanently deleted** from the structured "
      Actions" or "Targets" database storage. This frees up space and keeps the active lists clean.
    - **FR-3.6.4:** If a parent node is deleted/cleared but has active children, the parent structure is preserved (
      ghosted) to maintain the tree hierarchy.
- **FR-3.7:** The data persistence for Actions must use a NoSQL-style structure (JSONB) to support the unlimited nesting
  requirement efficiently. This ensures that the entire action tree can be stored and retrieved as a single document,
  optimizing for tree-like operations.

### FR-6: General UI & UX

- **FR-6.1:** The application must feature a widget that displays a motivational quote.
- **FR-6.2:** All core user actions (e.g., creating items, navigating, completing tasks) must be achievable via keyboard
  shortcuts. This includes navigation between actions (ArrowUp/Down), indenting/outdenting (Tab/Shift+Tab), and moving
  actions up/down (Cmd/Ctrl+Shift+ArrowUp/Down).
- **FR-6.3:** The application must function as a Single Page Application (SPA), providing a fluid user experience
  without full-page reloads for navigation.
- **FR-6.4:** The application must include a prominent theme switcher to allow users to toggle between a light ("
  Zenith" - clean, energetic, pastel gradients) and a dark ("Monolith" - sharp, focused, bold accent) theme.

### FR-7: Novel UX Patterns

- **FR-7.1 (Positive Urgency UI):** The 'Yesterday' column must feature an "Ambient Animated Background" with a slow,
  shifting gradient (cool colors transitioning to warm colors) to subtly indicate time passing. A tooltip on hover must
  display the time remaining until the daily cut-off.
- **FR-7.2 (Teleport-to-Journal Animation):** Upon completion of an "Action" (Todo), it must visually fade out from
  the "Actions" section and simultaneously fade in/pop into the "Completed Todos" section within the Journal, providing
  clear and delightful feedback.

---

## Non-Functional Requirements

### NFR-1: Performance

- **NFR-1.1:** Public profile pages must achieve a fast load time, specifically when accessed from mobile devices and
  the in-app browsers of social media applications.
- **NFR-1.2:** The real-time data synchronization feature must be implemented efficiently to ensure low latency and not
  degrade the overall application performance.

### NFR-2: Security

- **NFR-2.1:** The system must securely implement Magic Link authentication, ensuring that tokens are single-use and
  expire within a short timeframe.
- **NFR-2.2:** A strict separation between public and private data must be enforced at the database and API level to
  prevent any leakage of a user's private information.

### NFR-3: Scalability

- **NFR-3.1:** The application will be built on a serverless/scalable architecture (Next.js and Supabase) that is
  optimized for a free-tier MVP but is capable of handling viral growth with minimal architectural changes.
- **NFR-3.2:** The database schema and queries must be designed to scale efficiently with a large number of users,
  habits, and journal entries.

### NFR-4: Accessibility

- **NFR-4.1:** The application must be compliant with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
  standard to be usable by people with a wide range of disabilities.

---

## Implementation Planning

### Revised Development Strategy: Incremental and Integrated

Based on recent retrospectives, our development approach will now prioritize incremental and integrated delivery. Each
story, or small set of stories, will aim to deliver a visible, testable feature integrated directly into the main
application. This ensures continuous progress, early feedback, and tangible results for stakeholders.

Key tenets of this revised strategy:

- **Foundational UI First:** Establish the core application layout as a "canvas" before developing new features.
- **Immediate Integration:** All newly developed components, and existing ones, will be integrated into the main
  application as soon as they are ready.
- **Vertical Slicing:** Features will be developed end-to-end (UI, logic, data) in small, shippable increments.
- **"Definition of Done" Update:** A story is considered "done" only when its functionality is integrated, visible via
  `npm run dev`, and has undergone basic manual testing.
- **Re-sequencing for Visibility:** Stories will be re-sequenced and re-scoped to prioritize visible UI elements and
  immediate user value.

### Immediate Next Steps (Pre-Epic 3 Kickoff)

To implement this revised strategy, the following critical and parallel tasks must be completed:

**Critical Preparation Tasks:**

1. **Implement Basic Foundational Layout:** Implement the foundational layout for the private dashboard, including the
   bio, todo, and three-box sections (Today, Yesterday, The Pile). (Owner: Charlie, Est: 16 hours)
2. **Restructure Epic 3 Stories for Visibility:** Review and restructure all Epic 3 stories to ensure each delivers a
   visible, integrated component into the new layout. (Owner: Alice, Est: 4 hours)

**Parallel Preparation Tasks:**

3. **Refactor Existing Epic 2 Components for Integration:** Ensure existing Epic 2 components (e.g., `HabitCard`,
   `EditHabitModal`, `HabitCreator`) are refactored as necessary for seamless integration into the new foundational
   layout. (Owner: Charlie, Est: 8 hours)
4. **Initial Integration of Epic 2 Components:** Integrate at least one habit component (e.g., `HabitCard`) into 'The
   Pile' column within the new layout to demonstrate visible, incremental progress. (Owner: Elena, Est: 8 hours)

---

## References

## Next Steps

1. **Epic & Story Breakdown (Revised)** - Alice (Product Owner) will lead the restructuring of Epic 3 stories based on
   the new strategy.
2. **UX Design** (if UI) - Run: `workflow ux-design`
3. **Architecture** - Run: `workflow create-architecture`

---

_This PRD captures the essence of whatcha-doin - an intuitive, keyboard-first habit tracker with novel UX and integrated
journaling._

_Created through collaborative discovery between hammaadworks and AI facilitator._
