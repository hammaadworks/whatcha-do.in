# Epics & Stories for whatcha-doin

This document outlines the major epics for the project and breaks them down into actionable user stories, derived from the Functional Requirements in the PRD.

---

### Epic 1: User & Profile Management
*Focus: Establish user identity, authentication, and public presence.*

**Stories:**
- **Story 0.1 (DB Setup):** As a developer, I need to create and commit the initial database schema migrations for all core entities, ensuring the database is ready for application development.
- **Story 1.1 (Sign-up):** As a new user, I want to sign up with a magic link sent to my email so that I can create a secure account without needing to remember a password.
- **Story 1.2 (Authentication):** As a user, I want to log in and out of the application to securely access and protect my session.
- **Story 1.3 (Bio):** As a user, I want to edit a simple text bio in my profile so that I can personalize my public page.
- **Story 1.4 (Public Profile):** As a user, I want a shareable public profile page that displays my bio, public habits, public todos, and public journal entries so that I can share my progress and journey with others.

---

### Epic 2: Habit Management (Recurring Habits)
*Focus: Core functionality for creating, tracking, and managing recurring habits.*

**Stories:**
- **Story 2.1 (Create Habit):** As a user, I want to create a new habit with a name directly in "The Pile", with the option to also set a quantitative goal, so I can quickly add new activities to track. The habit should default to Public.
- **Story 2.2 (Edit Habit):** As a user, I want to edit a habit's name and its public/private status so I can correct mistakes and control visibility.
- **Story 2.3 (Delete Habit):** As a user, I want to delete a habit from "The Pile" so I can permanently remove activities I'm no longer tracking.
- **Story 2.4 (Streak Counter):** As a user, I want to see a visible streak counter on each habit, which resets on a missed day but preserves the value of the most recently broken streak, so I am motivated to start again.
- **Story 2.5 (Quantitative Goals):** As a user, I want to set and modify a quantitative goal for a habit by providing a number and selecting a unit from a list (e.g., "pages", "minutes") or entering my own custom unit, so I can track specific, measurable outcomes.
- **Story 2.6 (Goal Change):** As a user, I want my streak to continue uninterrupted when I change a habit's `goal_value` so I can adjust the difficulty without being penalized.

---

### Epic 3: Todo Management (One-off Tasks)
*Focus: Functionality for managing single, non-recurring tasks.*

**Stories:**
- **Story 3.1 (Create Todo):** As a user, I want to create a new todo with a description using an inline input field so I can quickly capture tasks.
- **Story 3.2 (Sub-Todos):** As a user, I want to create a sub-todo by pressing `Tab` on a new todo item so I can break down larger tasks into smaller steps.
- **Story 3.3 (Todo Privacy):** As a user, I want to toggle a todo's privacy between public and private so I can control what is shared on my profile.
- **Story 3.4 (Complete Todo):** As a user, I want to mark a todo as complete to signify it is done.
- **Story 3.5 (Delete Todo):** As a user, I want to delete a todo to remove it from my list.

---

### Epic 4: Main Interface & Core Logic
*Focus: The primary user interface and the fundamental rules governing habit progression.*

**Stories:**
- **Story 4.1 (Three-Column Layout):** As a user, I want to see my habits organized into "Today", "Yesterday", and "The Pile" columns, with "The Pile" sorted to show "Lively" habits first, so I have a clear and prioritized overview of my daily status.
- **Story 4.2 (Daily State Change):** As a user, I expect the application to automatically move completed habits to the "Yesterday" column at midnight in my local timezone so the board is ready for a new day.
- **Story 4.3 (Mark Complete):** As a user, I want to drag a habit from "Yesterday" to "Today" to mark it as complete and continue my streak.
- **Story 4.4 (True Two-Day Rule):** As a user, I understand that if I miss a habit for one day, it moves to "The Pile" in a recoverable "Lively" state. If I miss it for a second consecutive day, it becomes "Junked" and the streak is officially broken.
- **Story 4.5 (Grace Period):** As a user, if I open the app for the first time on a new day with pending habits, I want to be shown a summary screen to complete them before the day officially ends, so I don't unfairly lose my streak.
- **Story 4.6 (Continue or Restart Habit):** As a user, I want to drag a "Lively" habit from "The Pile" to "Today" to continue its streak, and drag a "Junked" habit to "Today" to restart its streak from 1.
- **Story 4.7 (Junked Days Counter):** As a user, I want to see a counter on my "Junked" habits in The Pile that tells me how many days they have been neglected, so I can see how long it has been.
- **Story 4.8 (Undo Action):** As a user, I want to long-press a habit in the 'Today' column to undo its completion. The habit should move back to "Yesterday" (if the streak was > 1) or "The Pile" (if the streak was 1) and its streak should be reverted, in case I make a mistake.

---

### Epic 5: Journaling & Data Entry
*Focus: Capturing details upon completion and aggregating them into a journal.*

**Stories:**
- **Story 5.1 (Completion Modal):** As a user, when I complete an item, I want a modal to appear that shows my streak update, allows me to select my mood via a fuel meter, log my quantitative work against an editable `goal_value` (with an info button), enter structured duration, and provides options to either log or cancel, so I can quickly and accurately capture all relevant details about the completion.
- **Story 5.2 (Bypass Modal):** As a user, I want to quickly bypass the completion modal by pressing `Enter` to log the item with default values.
- **Story 5.3 (Dual Journal):** As a user, I want a journal with separate "Public" and "Private" tabs so I can keep some reflections to myself while sharing others.
- **Story 5.4 (Auto-Journaling):** As a user, I want my notes from completed items to be automatically added to the correct journal (Public/Private) based on the item's privacy setting.
- **Story 5.5 (Free-form Entry):** As a user, I want to be able to add free-form text directly into my journal using a Markdown editor.
- **Story 5.6 (Journal Navigation):** As a user, I want to view today's journal by default and use a date selector to easily navigate to past entries.

---

### Epic 6: General UI & UX
*Focus: Overall application look, feel, and core usability features.*

**Stories:**
- **Story 6.1 (Keyboard-First):** As a user, I want to be able to perform all core actions (create, navigate, complete) using keyboard shortcuts to maximize my efficiency.
- **Story 6.2 (Theme Switcher):** As a user, I want a prominent theme switcher to toggle between a light and dark mode to suit my preference and environment.
- **Story 6.3 (Motivational Quote):** As a user, I want to see a motivational quote on the dashboard to keep me inspired.

---

### Epic 7: Novel UX Patterns
*Focus: Implementing the unique, delightful micro-interactions that define the app's character.*

**Stories:**
- **Story 7.1 (Positive Urgency UI):** As a user viewing the 'Yesterday' column, I want to see a subtle, ambient animated background that shifts over time and a tooltip showing time remaining, creating a sense of positive urgency to complete my habits.
- **Story 7.2 (Teleport-to-Journal):** As a user, when I complete a todo, I want to see it animate out of the task list and into the journal's completed section, providing clear and satisfying feedback.
