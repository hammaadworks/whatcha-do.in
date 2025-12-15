
## Epic 2: Habit Management Core (The "Identity Engine")

**Goal:** Implement the core Habit Board ("Today", "Yesterday", "The Pile"), the "Two-Day Rule" logic, real-time completion logging, and the detailed "Habit Lifecycle" from creation to "Junked".

**Source of Truth:**
*   **PRD:** FR-2 (Habits), FR-7 (Novel UX).
*   **Wiki:** `journal-on-marked-next-day-clearing-strategy.md` (Real-time logging).
*   **Architecture:** `habits` table, `habit_completions` table.

### Story 2.1: Habit Creation & Initial Placement
**As a user,**
I want to create a new habit with a name, optional quantitative goal, and visibility status (public/private, defaulting to Public),
**So that** I can start tracking a new behavior, and it appears in "The Pile" in a lively state.

**Acceptance Criteria:**
1.  **Initiation:** A button (e.g., "Add New Habit") located in the section heading of the private page triggers the habit creation flow.
2.  **Modal:** Clicking the button opens a modal for habit creation.
3.  **Goal Setting:** The modal allows defining a `goal_value` (number) and `goal_unit` (e.g., pages, minutes, reps, or custom, or entering a custom unit).
4.  **Privacy:** Toggle available for `is_public` (Default: Public).
5.  **Creation:** Saving within the modal creates the habit.
    *   State: `pile` (lively/active).
    *   Streak: `0`.
    *   Location: Appears at the top of "The Pile" after creation.
6.  **Database:** Insert into `habits` table.

### Story 2.2: Habit Interaction & Drag-and-Drop (Desktop)
**As a desktop user,**
I want to drag habit cards between "Today", "Yesterday", and "The Pile" columns,
**So that** I can easily manage my habits and influence my streak.

**Acceptance Criteria:**
1.  **Drag Rules:**
    *   `Pile -> Today`: Activates the habit for the current day.
    *   `Yesterday -> Today`: Moves the card to "Today" column, implying it is now a task for today.
    *   `Today -> Pile/Yesterday (Unmark Flow)`: If a habit (completed or uncompleted) is dragged *away* from the "Today" column, a confirmation modal appears ("Are you sure you want to unmark?"). Upon confirmation:
        *   If the habit was previously marked complete on "Today," its `habit_completion` record is deleted, the corresponding `journal_entries.activity_log` entry is removed, and its streak is decremented. The habit is then moved back to its state *before* it was dragged to "Today" (i.e., "The Pile" or "Yesterday").
        *   If the habit was *not* marked complete, it is simply moved back to its state *before* it was dragged to "Today" (i.e., "The Pile" or "Yesterday").
2.  **Streak Update:** Marking a habit as "done" (completed) increments its streak counter.
3.  **Ordering:** Users can reorder habits within a column.
4.  **Persistence:** Column state is saved locally or via optimistic UI updates.

### Story 2.3: Mobile Interaction (Long-Press & Move)
**As a mobile user,**
I want to long-press hold a habit card to move it between "Today", "Yesterday", and "The Pile" columns,
**So that** I can easily manage my habits on a touch device, adhering to the same movement rules as desktop.

**Acceptance Criteria:**
1.  **Long-Press:** Triggers a menu or a "wiggle mode" to move the card or an associated modal action is selected.
2.  **Movement Rules:**
    *   `Pile -> Today`: Activates the habit for the current day.
    *   `Yesterday -> Today`: Moves the card to "Today" column, implying it is now a task for today.
    *   `Today -> Pile/Yesterday (Unmark Flow)`: If a habit (completed or uncompleted) in "Today" is long-pressed and moved *away* from the "Today" column (or an associated modal action is selected), a confirmation modal appears ("Are you sure you want to unmark?"). Upon confirmation:
        *   If the habit was previously marked complete on "Today," its `habit_completion` record is deleted, the corresponding `journal_entries.activity_log` entry is removed, and its streak is decremented. The habit is then moved back to its state *before* it was moved to "Today" (i.e., "The Pile" or "Yesterday").
        *   If the habit was *not* marked complete, it is simply moved back to its state *before* it was moved to "Today" (i.e., "The Pile" or "Yesterday").
3.  **Streak Update:** Marking a habit as "done" (completed) increments its streak counter.
4.  **Tap:** Toggles completion (see Story 2.4).

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
**So that** I am motivated to keep the number going and aware of neglected habits.

**Acceptance Criteria:**
1.  **Badge:** A visible badge showing the `current_streak` integer.
2.  **Fire:** If streak > 3, show a 🔥 icon.
3.  **Junked Indicator:** If habit is in "Junked" state, show a visual cue (e.g., a minus sign or specific icon like a skull) and a counter indicating how many days the habit has been neglected.
4.  **Streak Reset/Preservation:** Streak resets on a missed day (when a habit transitions to "Junked"), but the value of the most recently broken streak is preserved for user motivation to restart.

### Story 2.6: Habit Editing, Goal Modification & Deletion
**As a user,**
I want to edit a habit's name, public/private status, and quantitative goals, or delete it permanently,
**So that** my habit list remains relevant and accurate.

**Acceptance Criteria:**
1.  **Edit:** Click to edit Name, Privacy, and Goal.
2.  **Goal Modification:** Users can set and modify a quantitative goal for a habit by providing a number and selecting a unit from a list (e.g., "pages", "minutes") or entering their own custom unit.
3.  **Goal Change Logic:** Changing a quantitative goal (e.g., 10 mins -> 20 mins) **does NOT** reset the current streak. The new goal applies immediately for the *next* completion.
4.  **Delete:** Only allowed from "The Pile". Requires a confirmation prompt ("Are you sure?"). Deletes habit and `habit_completions` (Soft delete preferred or hard delete with warning).

### Story 2.7: The "Daily State Change" (Midnight Logic)
**As a user,**
I want my habits to transition columns automatically at midnight (Local Time),
**So that** the board reflects the new day's reality and enforces the two-day consistency rule.

**Acceptance Criteria:**
1.  **Trigger:** App load or background timer checks `User Local Time`.
2.  **Transitions:**
    *   **Today -> Yesterday:** All "Today" items (Completed OR Uncompleted) move to "Yesterday".
    *   **Yesterday -> Pile (Lively):** Uncompleted items in "Yesterday" move to "The Pile" and enter **"Lively"** state (Grace Period active for 24 hours).
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
I want to be presented with an "End of Day Summary" screen if I have pending habits from the previous day when I first open the app on a new day,
**So that** I can manage my missed habits before my streak is affected, but only for T-1 tasks.

**Acceptance Criteria:**
1.  **Trigger:** First app open of the day if `Yesterday` column has uncompleted items from `T-1`.
2.  **UI:** A focused modal showing the "At Risk" habits.
3.  **Actions:** "Mark as Done" (saves streak) or "Skip" (let them go to Pile/Lively).
4.  **Scope:** This screen only applies to T-1 tasks. T-2 tasks and older are already handled by the system's daily state change logic (i.e., if missed, they are missed).

### Story 2.10: Habit Details Information Modal
**As a user,**
I want to click on a habit chip (public or private) to view a read-only information modal,
**So that** I can quickly review its details without entering edit mode.

**Acceptance Criteria:**
1.  **Trigger:** Clicking on a habit chip (either `HabitChip`).
2.  **Modal Content:** The modal (`HabitInfoModal`) displays read-only details such as:
    *   Habit Name
    *   Current Streak
    *   Longest Streak
    *   Goal (if set: value and unit)
    *   Status (Public/Private)
    *   State (e.g., `pile`, `today`, `yesterday`, `lively`, `junked`)
    *   Creation Date
3.  **Actions (for private habits):** For private habits, the modal includes "Edit" and "Delete" buttons, which open the respective modals. (Note: Edit/Delete functionality is covered in Story 2.6).
4.  **No direct editing:** The modal itself is for viewing information, not for direct modification.

---
