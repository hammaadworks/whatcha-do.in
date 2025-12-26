1. journal activity actions delete or visibility
2. spacing 2col

# read supabase/config.toml
make this targeted for adhd users and ambitious underachievers
use the domain whatcha-do.in

this is how to token url looks like
https://www.google.com/url?q=https://dgdvvcquoxzxvqlcfrpg.supabase.co/auth/v1/verify?token%3Dpkce_9e6dd0113f6a2b7e9e8f891ea77a40b27145db4b32ffee14e2f6e8d0%26type%3Dmagiclink%26redirect_to%3Dlocalhost:3000&source=gmail&ust=1765264897496000&usg=AOvVaw178icuhIfTwmnhDb4o-tWn

1. **Calendar Date Picker Refinement:**
2. ads and payments support
3. mobile size adjustment: wip
4. timezone fixes
5. actions testing
6. landing page
7. add ai to landing page and bio

issue in lets go open website, then footer open app on logins
bio limit
bio ai
timzone
landing ai

## Completed Tasks

*   Created `components/shared/AddTargetForm.tsx` by duplicating `AddActionForm.tsx` and renaming props/variables to be target-specific.
*   Fixed `AddActionForm.tsx` placeholder not toggling by managing focus state with `useState` and `onFocus`/`onBlur` handlers.
*   Implemented `Shift + Enter` to create a new node and focus its editor.
*   Implemented deletion of empty nodes from UI and data.
*   Investigated why new action items created with `Shift + Enter` and then saved with `Enter` were not being registered.
*   Added `console.log` statements in `ActionItem.tsx` (`handleEditSave`) to check `action.id` and `editText`.
*   Added `console.log` statements in `useActions.ts` (`updateActionText`) to check `id` and `newText`.
*   Added `console.log` statements in `lib/utils/actionTreeUtils.ts` (`updateActionTextInTree`) to check `id` and `newText`.
*   Debugged `findNodeAndContext` in `updateActionTextInTree` where necessary.
*   Added `console.log` statements in `useTargets.ts` (`updateTargetText`) to check `bucket`, `id`, and `newText`.
*   Added `console.log` in `useTargets.ts` (`save`) after `updateTargets` to confirm persistence.
*   Obtained console output from user for debugging.
*   Fixed UI not updating for newly created/edited targets by synchronizing `ActionItem`'s local `editText` state with `action.description` prop changes.
*   Removed all debugging `console.log` statements.
*   Fixed editor stuck after saving by removing `divRef.current?.focus()` from `handleEditSave` and `handleEditCancel` in `ActionItem.tsx`.
*   Re-added `divRef.current?.focus()` with `setTimeout` to `handleEditSave` and `handleEditCancel` in `ActionItem.tsx` to ensure correct focus management after exiting edit mode.
*   Implemented `Escape` key to move focus out of the current target/actions section and back to the main app.
*   Fixed editor stuck after saving by ensuring `newlyAddedActionId` is cleared by the parent after the `ActionItem` processes it.
*   Removed journal activity deletion when an `ActionNode` is deleted (as per user request).
*   Fixed bug: unmarking parent when an uncompleted child is placed under it, and remove its activity record, by:
    *   Modifying `recalculateCompletionStatus` to return `is_public` along with `id` and `completed_at`.
    *   Updating `useTreeStructure.ts` to pass the correct `is_public` status to `journalActivityService.removeActivity` when parents become uncompleted.
*   Added `console.log` statements in `useActions.ts`/`useTargets.ts` within `uncompletedFromCompleted` loop for debugging.
*   Obtained console output from user for the parent unmarking bug.
*   Wrote wiki documentation for action/target management and journal activity rules (`docs/wiki/action_target_journal_rules.md`).

### **Detailed Explanation of the "Parent Unmarking Bug"**

**1. The Core Rule (Premise of the System):**

Our task management system (for both Actions and Targets) operates on a fundamental hierarchical rule:

> **"A parent node (e.g., a main project or goal) can only be marked as `completed` if *all* of its direct child nodes (sub-tasks or sub-goals) are also `completed`."**

Conversely, if any child node under a completed parent is *not* completed, the parent *cannot* logically be considered completed either.

**2. The Bug Scenario:**

The "Parent Unmarking Bug" occurred in scenarios where this core rule was violated due to structural changes in the action/target tree. Specifically:

*   **Initial State:** Imagine you have a main task, "Project X" (Parent `P`), and it was marked as `completed`. This implies all its sub-tasks were also completed, and a `journal activity record` was created for "Project X" to log its completion.
*   **User Action:** A new sub-task, "Task C" (Child `C`), is created and is `uncompleted`. The user then places this `uncompleted` "Task C" directly under "Project X" (Parent `P`). This could happen via:
    *   Adding "Task C" as a new child directly to "Project X".
    *   Indenting "Task C" so it becomes a child of "Project X".
    *   An existing child of "Project X" becoming uncompleted.

*   **The Bug:** Despite "Project X" (Parent `P`) now having an `uncompleted` child "Task C", "Project X" **remained marked as `completed` in the UI**. This directly violated the core rule.
*   **Further Implication:** Because "Project X" remained `completed` in the UI (even though it shouldn't be), its `journal activity record` (logging its completion) also **incorrectly remained in the journal**. This created an inconsistent system where the journal showed an item as completed that, by the system's own rules, was no longer truly complete.

**3. Why it was a "Bug":**

The bug led to:
*   **Inconsistent UI State:** Users saw parents as completed when they clearly had outstanding sub-tasks, causing confusion and undermining trust in the system's accuracy.
*   **Inaccurate Historical Records:** The journal activity log incorrectly maintained records of completion for items that were, in fact, not completed according to the system's rules.
*   **Violation of Core Premise:** The fundamental rule of hierarchical completion was broken.

**4. The Solution Implemented (High-Level):**

To fix this, a new utility function called `recalculateCompletionStatus` was introduced and integrated into the system's tree manipulation logic:

*   **`recalculateCompletionStatus` (in `lib/utils/actionTreeUtils.ts`):**
    *   This function traverses the entire action/target tree whenever a structural change (like adding a child, indenting, or toggling an item's status) occurs.
    *   It operates from the bottom up, ensuring that if any child is `uncompleted`, its direct parent *must also be* `uncompleted`.
    *   Crucially, if a parent was previously `completed` but is forced to become `uncompleted` by this recalculation, `recalculateCompletionStatus` records the ID of this parent and its `completed_at` (timestamp of its previous completion) and `is_public` status.

*   **Integration into `hooks/useTreeStructure.ts`:**
    *   After any operation that modifies the tree structure (`addNode`, `addNodeAfter`, `toggleNode`, `indentNode`), the `useTreeStructure` hook now calls `recalculateCompletionStatus`.
    *   It then receives the list of parents that were forced to become `uncompleted` (`uncompletedFromCompleted`).
    *   For each of these parents, the hook uses the `JournalActivityService` to **remove their completion record** from the `journal_entries.activity_log`, using the `id`, `completed_at`, and `is_public` status correctly.

**5. Result of the Fix:**

Now, when an `uncompleted` child is placed under a `completed` parent:
1.  The parent will automatically and immediately become `uncompleted` in the UI.
2.  The parent's corresponding completion record will be accurately removed from the `journal_entries.activity_log`, maintaining data consistency.

This ensures the system's core rule is always upheld, providing a reliable and accurate representation of task completion.

## Session Update: Journal Interactions & Action Sorting (Refactoring)

### 1. Journal Activity Log Enhancements
*   **Interactions:** Implemented rich interactions for journal activity entries:
    *   **Long Press (Desktop/Mobile):** Triggers a context menu with "Delete" and "Make Public/Private" options.
    *   **Swipe-to-Reveal (Mobile):** Swiping left reveals styled "Delete" and "Make Public/Private" buttons.
    *   **Vertical Dots (Desktop):** Added a standard dropdown menu trigger for desktop users.
*   **Deletion & Undo:**
    *   Implemented optimistic UI updates for instant feedback.
    *   Added `Ctrl+Z` (Global) and a Toast "Undo" button to recover deleted activities within a 5-second window.
    *   Backend deletion is delayed until the undo window expires.
*   **Backend:** Added `updateActivityLogEntry` and `deleteActivityLogEntry` to `lib/supabase/journal.ts` to handle granular updates within the JSONB `activity_log` column.

### 2. Codebase Refactoring (`useTreeStructure`)
*   **Consolidation:** Created a generic `hooks/useTreeStructure.ts` hook.
    *   This abstracts all common logic for hierarchical data (Actions, Targets, Habits) including fetching, saving, lifecycle management, and recursive tree operations.
    *   Significantly reduced code duplication in `useActions.ts` and `useTargets.ts`.
*   **Standardization:** Migrated all toast notifications in these hooks to `sonner` for consistency.
*   **Strict Typing:** Resolved complex TypeScript errors related to generic types, missing props (`ownerId`), and strict null checks.

### 3. Actions/Targets UI: "Move to Done"
*   **Feature:** Completed actions and targets are now automatically moved to a separate "Completed" section at the bottom of their list.
*   **Recursive Application:** This logic applies recursively to all sub-levels of the action tree.
*   **Collapsible:** The "Completed" section is collapsible with a toggle button showing the count of completed items.
*   **Stability:** Unmarking an item returns it to its original relative position in the active list.
*   **Implementation:** Logic centralized in `components/shared/ActionsList.tsx`.
