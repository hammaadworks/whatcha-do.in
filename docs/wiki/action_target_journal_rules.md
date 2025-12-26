# Action/Target Management & Journal Activity Rules

This document outlines the core rules and their implementation details governing the lifecycle of Action and Target nodes, with a specific focus on their interaction with the `journal_entries.activity_log` (`journal activity jsonb`). These rules ensure data consistency and a clear history of user accomplishments.

## 1. Core Principles for Action/Target Nodes

*   **Tree Structure (`JSONB`):** Actions and Targets are stored as nested `JSONB` trees (`ActionNode[]`). This allows for hierarchical relationships (parent-child).
*   **Completion Rule:** A parent `ActionNode` can only be marked as `completed` if *all* of its children (and their descendants) are also `completed`. If an uncompleted child exists under a completed parent, the parent must become uncompleted.
*   **Immutability for History:** Once an item is `completed`, its record is logged to the `journal_entries.activity_log`. This record, once created, generally persists even if the active `ActionNode` is deleted (as per user request).
*   **Ephemeral Active Lists:** `completed` Actions and Targets are designed to be removed from the active lists (the main `actions.data` and `targets.data` JSONB trees) at the start of the next day/month (Clearing Logic). Their historical record is then solely within `journal_entries.activity_log`.

## 2. Key Operations & Journal Activity Interactions

### 2.1. Adding a New Action/Target

*   **Operation:** User creates a new `ActionNode` (via `AddActionForm` / `AddTargetForm`, or `Shift+Enter`).
*   **Affected Functions:** `addActionToTree`, `addActionAfterId` (in `lib/utils/actionTreeUtils.ts`), `addAction`, `addActionAfter` (in `hooks/useActions.ts`), `addTarget`, `addTargetAfter` (in `hooks/useTargets.ts`).
*   **Journal Interaction:** None directly upon creation, as the item is initially uncompleted.
*   **Consistency Check:** After adding the new action to the tree (`addActionToTree`/`addActionAfterId`), `recalculateCompletionStatus` is called. If the newly added (uncompleted) item forces a previously completed parent to become uncompleted, that parent's completion record (including its `completed_at` timestamp) is removed from `journal_entries.activity_log` via `journalActivityService.removeActivity`.

### 2.2. Toggling Completion Status

*   **Operation:** User marks an `ActionNode` as `completed` or `uncompleted`.
*   **Affected Functions:** `toggleActionInTree` (in `lib/utils/actionTreeUtils.ts`), `toggleAction` (in `hooks/useActions.ts`), `toggleTarget` (in `hooks/useTargets.ts`).
*   **Journal Interaction:**
    *   **Becoming Completed:** If the item transitions from uncompleted to completed, a new entry is added to `journal_entries.activity_log` via `journalActivityService.logActivity`. The `completed_at` timestamp of the node is set.
    *   **Becoming Uncompleted:** If the item transitions from completed to uncompleted, its corresponding entry is removed from `journal_entries.activity_log` via `journalActivityService.removeActivity`, using the `completed_at` timestamp of the now-uncompleted node.
*   **Consistency Check:**
    *   **Pre-completion check:** `toggleActionInTree` prevents marking a parent as completed if it has any uncompleted children (`areAllChildrenCompleted`).
    *   **Post-toggle recalculation:** After a toggle, `recalculateCompletionStatus` is called. If the toggled item's status change affects its parents (e.g., unmarking a child causes a parent to become uncompleted), the parent's status is updated, and its previous completion record is removed from `journal_entries.activity_log`.

### 2.3. Indenting/Outdenting Actions/Targets (Tree Structure Modification)

*   **Operation:** User changes the hierarchical position of an `ActionNode`.
*   **Affected Functions:** `indentActionInTree`, `outdentActionInTree` (in `lib/utils/actionTreeUtils.ts`), `indentAction`, `outdentAction` (in `hooks/useActions.ts`), `indentTarget`, `outdentTarget` (in `hooks/useTargets.ts`).
*   **Journal Interaction:** None directly from the `indent`/`outdent` operation itself.
*   **Consistency Check:** After indenting or outdenting an action, `recalculateCompletionStatus` is called. If an uncompleted item is moved under a completed parent (via indent) or a completed child is moved out from under a parent (via outdent), potentially affecting the parent's completion status, the parent's status will be updated, and its previous completion record (if it became uncompleted) will be removed from `journal_entries.activity_log`.

### 2.4. Deleting an Action/Target

*   **Operation:** User deletes an `ActionNode` (e.g., via the 'Delete' key or trash icon).
*   **Affected Functions:** `deleteActionFromTree` (in `lib/utils/actionTreeUtils.ts`), `deleteAction` (in `hooks/useActions.ts`), `deleteTarget` (in `hooks/useTargets.ts`).
*   **Journal Interaction:** **None.** As per user request, deleting an `ActionNode` does *not* remove its historical completion record from `journal_entries.activity_log`. The philosophy is that if it was completed, that fact remains recorded, regardless of the active list's state.

### 2.5. Toggling Privacy (`is_public` status)

*   **Operation:** User changes the `is_public` status of an `ActionNode`.
*   **Affected Functions:** `toggleActionPrivacyInTree` (in `lib/utils/actionTreeUtils.ts`), `toggleActionPrivacy` (in `hooks/useActions.ts`), `toggleTargetPrivacy` (in `hooks/useTargets.ts`).
*   **Journal Interaction:**
    *   **Completed Item becomes Private:** If a completed item becomes private, its record is removed from the *public* journal activity log, and the item itself is unmarked (`completed: false`) in the active list. This prevents private items from showing as completed publicly. The `completed_at` is cleared from the `ActionNode`.
    *   **Completed Item becomes Public:** If a completed item becomes public, no change to journal entry (it would already be in the private journal if completed while private, or public if completed while public).
*   **Consistency Check:** Enforces "Private Parent -> Private Child" rule. This also handles unmarking children if a parent becomes private.

## 3. Key Utility Functions & Their Roles

*   **`lib/utils/actionTreeUtils.ts`**: Contains pure functions for manipulating the `ActionNode[]` tree structure (add, delete, indent, toggle, privacy, move).
    *   `recalculateCompletionStatus`: The central function for ensuring parent-child completion consistency. It returns the modified tree and a list of `{ id, completed_at }` for nodes that transitioned from completed to uncompleted.
    *   `areAllChildrenCompleted`: Helper to check if a node's children are all completed.
    *   `findNodeAndContext`: Helper to locate a node and its contextual information in the tree.
*   **`lib/logic/JournalActivityService.ts`**: Abstracts interaction with the `journal_entries.activity_log` JSONB column in Supabase.
    *   `logActivity`: Adds/updates an activity record for an item's completion.
    *   `removeActivity`: Removes an activity record (e.g., if an item becomes uncompleted or changes privacy status), requiring the original `completed_at` for accurate removal.
*   **`hooks/useActions.ts` / `hooks/useTargets.ts`**: React hooks that orchestrate the state management, call tree utilities, interact with `JournalActivityService`, and persist changes to the database. These hooks are responsible for integrating `recalculateCompletionStatus`'s output with `journalActivityService` calls.

## 4. Example: Scenario Breakdown (User's Bug - Unmarking Parent)

*   **Scenario:** Parent (P) is marked (completed). Child (C) is created (uncompleted). Child (C) is placed under Parent (P).
*   **Desired Behavior:** Parent (P) must become uncompleted, and its completion record must vanish from the activity journal.
*   **Execution Flow (e.g., via `indentAction`):**
    1.  User indents C under P.
    2.  `indentAction` (in `useActions.ts` or `useTargets.ts`) calls `indentActionInTree`.
    3.  `indentActionInTree` returns the tree with C now under P.
    4.  `indentAction` then calls `recalculateCompletionStatus` with this tree.
    5.  `recalculateCompletionStatus` identifies that P (which was completed) now has an uncompleted child C. It marks P as uncompleted and adds `{ id: P.id, completed_at: P.old_completed_at }` to its `uncompletedFromCompleted` list.
    6.  `indentAction` calls `save(newTree)`.
    7.  `indentAction` iterates `uncompletedFromCompleted`. For P, it calls `journalActivityService.removeActivity(user.id, P.old_completed_at, P.id, 'action', false)` (or 'target').

This ensures the parent's completion status is corrected in the active list, and its previous completion record is purged from the journal, maintaining consistency.