# whatcha-doin - Product Requirements Document

**Project:** whatcha-doin
**Author:** hammaadworks
**Date:** Wednesday, 12 November 2025
**Version:** 1.3

---

## Executive Summary

This PRD outlines the development of "whatcha-doin," a habit and todo tracking application designed to foster personal growth and consistency. The vision is to create an intuitive, keyboard-first experience that empowers users to build positive routines and reflect on their progress, ultimately leading to a more organized and fulfilling life.

### What Makes This Special

"whatcha-doin" stands out by combining robust habit/todo management with a unique journaling system and novel UX patterns. Its "keyboard-first" design prioritizes efficiency, while features like the "Two-Day Rule," "Grace Period," "Positive Urgency UI," and "Teleport-to-Journal Animation" create an engaging and motivating experience. The focus is on making habit building intuitive, rewarding, and deeply integrated with personal reflection.

---

## Project Classification

**Technical Type:** Single Page Application (SPA) built with Next.js
**Domain:** Personal Productivity / Habit Tracking
**Complexity:** Moderate to High

"whatcha-doin" is classified as a Moderate to High complexity SPA in the Personal Productivity / Habit Tracking domain, leveraging modern web technologies for a rich user experience.

---



## Success Criteria

The success of "whatcha-doin" will be measured by user engagement, habit completion rates, and positive feedback on the unique UX features.
- **User Engagement:** High daily active users (DAU) and retention rates.
- **Habit Completion:** Increased average streak lengths and consistent habit completion.
- **User Satisfaction:** Positive feedback on the intuitiveness, efficiency, and motivational aspects of the application.
- **Feature Adoption:** High usage of core features like journaling, public profiles, and novel UX patterns.
---

## Product Scope

### MVP - Minimum Viable Product

This is the focused feature set required to deliver the core identity-building experience.
- **User System:** User accounts with Magic Link login and a simple user bio.
- **Core "Habits" System:** Create, edit, and delete recurring "habits" with a public/private flag. A three-column layout ("Today", "Yesterday", "The Pile") with drag-and-drop functionality. The "Two-Day Rule" governs streak management, and a visible streak counter is displayed on each habit.
- **Core "Todos" System:** Create, edit, and delete one-off "todos", also with a public/private flag.
- **Journal System:** A dual-view journal with "Public" and "Private" tabs. It automatically aggregates notes from completed items into the correct tab. Users can also add free-form text and edit any journal entry at any time. The main UI shows today's entry by default, with a date selector to view past entries.
- **Daily Interaction:** A recording modal appears upon completion of any habit or todo to log an effort score, duration, and notes.
- **Content & Profile:** A motivational quote widget. A shareable public profile page that displays the user's bio, all public habits and their streaks, all public todos, and the complete, searchable Public Journal.

### Growth Features (Post-MVP)

- **Advanced Profiles:** Allow users to customize their public profiles with themes, pinned habits, and achievement showcases.
- **Data Visualizations:** Introduce graphs and charts to show consistency, effort scores over time, and streak history.
- **Notifications:** Implement gentle push notification reminders for habits due today.
- **Social Integrations:** Enable users to automatically post major milestones (e.g., "Reached a 100-day streak!") to social media.
- **Advanced Journaling:** Add advanced search and filtering capabilities to the journal.

### Vision (Future)

- **AI Coach:** An AI agent that provides personalized encouragement, identifies patterns in user behavior, and suggests new habits.
- **Integrations:** Connect with third-party apps to automatically log activities (e.g., pull workouts from a fitness app).
- **"Life Resume":** A beautifully designed, exportable report that summarizes a user's entire journey, achievements, and consistency over years.

---

## Web App Specific Requirements

The project will be a Single Page Application (SPA) built with Next.js, providing a smooth, app-like user experience. It should be optimized for modern browsers (e.g., Chrome, Firefox, Safari). The primary UI component library will be `shadcn/ui`, complemented by `Aceternity UI` for animations and micro-interactions. SEO is not a priority for the application itself. The application must support real-time synchronization of user data across different devices.

---

## User Experience Principles

The user experience will be centered around speed and efficiency, with a **"keyboard-first"** design philosophy. The interface should be clean, intuitive, and minimize the need for mouse interaction. The interface must be rich with **micro-interactions and subtle visual cues** to provide clear feedback and make the experience feel alive. This includes visual state changes (e.g., color, animation) when habits move between columns.

### Key Interactions
- Core interactions will be mapped to intuitive keyboard shortcuts (e.g., 'n' for a new task, 'j' to jump to the journal, arrow keys for navigation). While drag-and-drop will be supported for mouse users, keyboard alternatives must always be available and prioritized in the design.
- A key UX component is creating a sense of **positive urgency**. For example, a habit in the 'Yesterday' column should visually change as the 12 am deadline approaches to motivate the user to maintain their streak.

---

## Functional Requirements

This section details the specific functionalities of the application, derived from the scope and principles defined above.

### FR-1: User & Profile Management
- **FR-1.1:** Users must be able to create an account using a Magic Link sent to their email address.
- **FR-1.2:** The system must support user login and logout.
- **FR-1.3:** Users must be able to edit a simple text bio for their profile.
- **FR-1.4:** Each user must have a public profile page accessible via a shareable, unique URL.
- **FR-1.5:** The public profile page must display the user's bio, all public habits, all public todos, and the public journal.

### FR-2: Habit Management (Recurring Habits)
- **FR-2.1:** Users must be able to create a new "habit" with a name via an inline input field within "The Pile" column. As the user types, a "+ Add Goal" button will appear, allowing them to optionally set a quantitative goal (number and unit) before creation. New habits default to 'Public' and start with a streak count of 0.
- **FR-2.2:** When creating or editing a habit, users must be able to mark it as "public" or "private".
- **FR-2.3:** Users must be able to edit the name and public/private status of an existing habit.
- **FR-2.4:** Users must be able to delete a habit, but only from "The Pile" column.
- **FR-2.5:** Each habit chip must display a visible streak counter badge.
- **FR-2.6:** Users must be able to set and modify a quantitative goal for a habit (e.g., "Read 5 pages"). The goal consists of a number and a unit. The unit can be selected from a predefined list (e.g., `minutes`, `hours`, `pages`, `reps`, `sets`, `questions`) or can be a custom value defined by the user.
- **FR-2.7:** When a habit's goal is upgraded or downgraded, the existing streak must continue uninterrupted. The new `goal_value` becomes the requirement for continuing the streak from the moment of change.
- **FR-2.8:** The system must support both broad habits (e.g., "Workout") and atomic habits (e.g., "10 Pushups"). For broad habits, the UI will allow for logging details (e.g., reps, duration, specific activities) within the completion flow without requiring separate habit definitions.

### FR-3: Todo Management (One-off Tasks)
- **FR-3.1:** Users must be able to create a new "todo" with a text description using an "Intelligent Notepad" concept. This includes an inline input field at the bottom of the list and the ability to create 2-level deep sub-todos using the `Tab` key.
- **FR-3.2:** When creating or editing a todo, users must be able to mark it as "public" or "private" via a `🌐/🔒` privacy toggle visible on hover.
- **FR-3.3:** Users must be able to mark a todo as complete.
- **FR-3.4:** Users must be able to delete a todo.

### FR-4: Main Interface & Core Logic
- **FR-4.1:** The main user interface must display three primary columns for managing habits: "Today", "Yesterday", and "The Pile".
    - On desktop, this will be a two-row layout: Top row with "Today" and "Yesterday" side-by-side, and a full-width "The Pile" on the bottom. Interaction will be `Drag-and-Drop`.
    - On mobile, this will be a single-column, stacked layout: "Today", then "Yesterday", then "The Pile". Interaction will be `Tap-to-Move`.
    All columns must sort their habit chips according to the following three-level order: 1. Public habits first, 2. by highest streak count (descending), 3. by name (ascending). "The Pile" column has a special sorting order: 1. "Lively" habits first, then 2. Public habits, 3. by highest last streak (descending), and 4. by name (ascending).
- **FR-4.2:** The daily state change occurs at 12:00 am in the user's local timezone. At this time, any habits completed the previous day appear in the "Yesterday" column.
- **FR-4.3:** Users must be able to drag a habit from "Yesterday" to "Today" to mark it as complete for the current day and continue its active streak.
- **FR-4.4 (The "Grace Period"):** If a user opens the app for the first time on a new day and has pending habits from the previous day, they must be presented with a dedicated "End of Day Summary" screen.
    - **FR-4.4.1:** This screen must allow the user to mark pending habits from the previous day as complete.
    - **FR-4.4.2:** From this screen, the user must be able to add a new or existing habit to the previous day's record.
    - **FR-4.4.3:** After confirming the summary, the daily state change cycle runs with the corrected data.
- **FR-4.5 (The True "Two-Day Rule"):** A habit's streak is only broken after two consecutive missed days. This is managed through a new two-stage process in "The Pile".
- **FR-4.6 (Miss Day 1: "Lively" State):** If a habit in the "Yesterday" column is not completed, it moves to "The Pile" at midnight and enters a **"Lively"** state for 24 hours.
    - **FR-4.6.1:** If a user moves a "Lively" habit to "Today", its original streak **continues uninterrupted**.
- **FR-4.7 (Miss Day 2: "Junked" State):** If a "Lively" habit is not rescued from The Pile within 24 hours, it transitions to a permanent **"Junked"** state.
    - **FR-4.7.1:** When a habit becomes "Junked", its `current_streak` is reset to zero, and that value is saved as the `last_streak`.
    - **FR-4.7.2:** If a user moves a "Junked" habit to "Today", its streak resets to 1.
- **FR-4.8 (Junked Days Counter):** Once a habit is in the "Junked" state, the UI must display a counter indicating how many days it has been neglected (e.g., "-7" for 7 days).
- **FR-4.9:** The 'Yesterday' column is read-only; habits cannot be deleted or edited from this column.
- **FR-4.10:** Users can long-press a habit in the 'Today' column to undo the completion. This action reverts the streak count and moves the habit back to a previous column based on its state before completion: if the streak was > 1, it returns to "Yesterday"; if the streak was 1, it returns to "The Pile".

### FR-5: Journaling & Data Entry
- **FR-5.1:** When a habit or todo is marked complete, a modal must appear allowing the user to record details.
    - **FR-5.1.1:** The modal must display the current streak count and indicate the new streak after logging (e.g., "Streak: 5 → 6").
    - **FR-5.1.2:** The modal must include a `mood` selector designed as a "fuel meter" (semi-circular gauge) with six discrete, tappable segments (corresponding to values 0, 20, 40, 60, 80, 100) and empathetic emoji labels. This captures the user's subjective feeling.
    - **FR-5.1.3:** For quantitative habits, the modal must display the user's completed `work` versus their `goal` (e.g., "25/30 pages"). The user will input their `work` by tapping and typing in a number field.
    - **FR-5.1.4:** The `goal` value displayed in the modal must be editable. An "i" button next to the goal will trigger a pop-up explaining that the goal number and unit can be changed.
    - **FR-5.1.5:** The modal must include a structured `duration` input, consisting of a number field for the value and a dropdown for the unit (limited to "minutes" and "hours").
    - **FR-5.1.6:** The system must formally record the `goal_value`, the `work` value, the `duration_value`, the `duration_unit`, and the `goal_at_completion` (the goal active when the habit was completed).
    - **FR-5.1.7:** The modal must include fields for free-form text `notes`.
    - **FR-5.1.8:** Users must be able to bypass detail entry by pressing `Enter` to log the item with default values.
    - **FR-5.1.9:** The modal must include a "Cancel" option to dismiss it without logging.
    - **FR-5.1.10:** If a habit is re-recorded on the same day (e.g., after being undone), the completion modal must pre-fill with the last recorded `mood`, `work`, and `duration` values for that day.
- **FR-5.2:** The system must provide a dual-view journal with distinct "Public" and "Private" sections.
- **FR-5.3:** Notes from completed public items, along with the habit's name, mood, work, and duration, must be automatically added to the Public Journal as a line item.
- **FR-5.4:** Notes from completed private items, along with the habit's name, mood, work, and duration, must be automatically added to the Private Journal as a line item.
- **FR-5.5:** Users must be able to add free-form text directly to either the public or private journal using a Markdown editor.
- **FR-5.6:** Users must be able to edit the content of any journal entry at any time.
- **FR-5.7:** The journal view must default to showing today's entries and provide a date selector to view entries from past dates.


### FR-6: General UI & UX
- **FR-6.1:** The application must feature a widget that displays a motivational quote.
- **FR-6.2:** All core user actions (e.g., creating items, navigating, completing tasks) must be achievable via keyboard shortcuts.
- **FR-6.3:** The application must function as a Single Page Application (SPA), providing a fluid user experience without full-page reloads for navigation.
- **FR-6.4:** The application must include a prominent theme switcher to allow users to toggle between a light ("Zenith" - clean, energetic, pastel gradients) and a dark ("Monolith" - sharp, focused, bold accent) theme.

### FR-7: Novel UX Patterns
- **FR-7.1 (Positive Urgency UI):** The 'Yesterday' column must feature an "Ambient Animated Background" with a slow, shifting gradient (cool colors transitioning to warm colors) to subtly indicate time passing. A tooltip on hover must display the time remaining until the daily cut-off.
- **FR-7.2 (Teleport-to-Journal Animation):** Upon completion of an "Action" (Todo), it must visually fade out from the "Actions" section and simultaneously fade in/pop into the "Completed Todos" section within the Journal, providing clear and delightful feedback.

---

## Non-Functional Requirements

### NFR-1: Performance
- **NFR-1.1:** Public profile pages must achieve a fast load time, specifically when accessed from mobile devices and the in-app browsers of social media applications.
- **NFR-1.2:** The real-time data synchronization feature must be implemented efficiently to ensure low latency and not degrade the overall application performance.

### NFR-2: Security
- **NFR-2.1:** The system must securely implement Magic Link authentication, ensuring that tokens are single-use and expire within a short timeframe.
- **NFR-2.2:** A strict separation between public and private data must be enforced at the database and API level to prevent any leakage of a user's private information.

### NFR-3: Scalability
- **NFR-3.1:** The application will be built on a serverless/scalable architecture (Next.js and Supabase) that is optimized for a free-tier MVP but is capable of handling viral growth with minimal architectural changes.
- **NFR-3.2:** The database schema and queries must be designed to scale efficiently with a large number of users, habits, and journal entries.

### NFR-4: Accessibility
- **NFR-4.1:** The application must be compliant with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standard to be usable by people with a wide range of disabilities.

---

## Implementation Planning

### Revised Development Strategy: Incremental and Integrated

Based on recent retrospectives, our development approach will now prioritize incremental and integrated delivery. Each story, or small set of stories, will aim to deliver a visible, testable feature integrated directly into the main application. This ensures continuous progress, early feedback, and tangible results for stakeholders.

Key tenets of this revised strategy:
-   **Foundational UI First:** Establish the core application layout as a "canvas" before developing new features.
-   **Immediate Integration:** All newly developed components, and existing ones, will be integrated into the main application as soon as they are ready.
-   **Vertical Slicing:** Features will be developed end-to-end (UI, logic, data) in small, shippable increments.
-   **"Definition of Done" Update:** A story is considered "done" only when its functionality is integrated, visible via `npm run dev`, and has undergone basic manual testing.
-   **Re-sequencing for Visibility:** Stories will be re-sequenced and re-scoped to prioritize visible UI elements and immediate user value.

### Immediate Next Steps (Pre-Epic 3 Kickoff)

To implement this revised strategy, the following critical and parallel tasks must be completed:

**Critical Preparation Tasks:**
1.  **Implement Basic Foundational Layout:** Implement the foundational layout for the private dashboard, including the bio, todo, and three-box sections (Today, Yesterday, The Pile). (Owner: Charlie, Est: 16 hours)
2.  **Restructure Epic 3 Stories for Visibility:** Review and restructure all Epic 3 stories to ensure each delivers a visible, integrated component into the new layout. (Owner: Alice, Est: 4 hours)

**Parallel Preparation Tasks:**
3.  **Refactor Existing Epic 2 Components for Integration:** Ensure existing Epic 2 components (e.g., `HabitCard`, `EditHabitModal`, `HabitCreator`) are refactored as necessary for seamless integration into the new foundational layout. (Owner: Charlie, Est: 8 hours)
4.  **Initial Integration of Epic 2 Components:** Integrate at least one habit component (e.g., `HabitCard`) into 'The Pile' column within the new layout to demonstrate visible, incremental progress. (Owner: Elena, Est: 8 hours)

---

## References

## Next Steps

1.  **Epic & Story Breakdown (Revised)** - Alice (Product Owner) will lead the restructuring of Epic 3 stories based on the new strategy.
2.  **UX Design** (if UI) - Run: `workflow ux-design`
3.  **Architecture** - Run: `workflow create-architecture`

---

_This PRD captures the essence of whatcha-doin - an intuitive, keyboard-first habit tracker with novel UX and integrated journaling._

_Created through collaborative discovery between hammaadworks and AI facilitator._
