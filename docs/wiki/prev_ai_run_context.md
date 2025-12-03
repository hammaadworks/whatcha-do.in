# Context Dump: Actions & Timezone Implementation (Nov 28, 2025)

## 1. Executive Summary
We successfully pivoted the "Todos" feature into a more robust "Actions" system and implemented foundational Timezone Management. The goal was to support "Unlimited Deep Nesting" for tasks and a "Next Day Clearing" logic that respects the user's local time, catering to the "Ambitious Underachiever" persona.

## 2. Detailed Accomplishments & Implementation Notes

### A. Actions System (The Core Build)
We transitioned from a standard relational model to a recursive document model to support complex task trees.

*   **Database Schema (`public.actions`):**
    *   **Constraint:** `UNIQUE(user_id)` enforces a single-document pattern per user. This simplifies the mental model: "Fetch the user's tree, modify it, save the whole tree."
    *   **Column:** `data jsonb` holds the recursive array of nodes.
    *   **Optimization:** RLS policies use `(select auth.uid())` to avoid per-row re-evaluation, ensuring speed even if we theoretically had millions of rows (though here we have one row per user).
    *   **Migration Note:** We used `gen_random_uuid()` instead of `uuid_generate_v4()` to avoid dependency on the `uuid-ossp` extension.

*   **Service Layer (`lib/supabase/actions.ts`):**
    *   **Clearing Logic (`applyNextDayClearing`):** This is the "secret sauce."
        *   It recursively walks the tree.
        *   It checks `completed_at < startOfToday` (using the user's specific timezone).
        *   **Crucial Logic:** It implements a "Container Preservation" check. If a parent node is completed/cleared BUT has children that are still active (incomplete or completed today), the parent is **kept** in the returned tree. This prevents "orphaning" active tasks just because their parent was finished yesterday.

*   **State Management (`hooks/useActions.ts`):**
    *   We built a robust, recursive CRUD hook.
    *   **Optimistic Updates:** The hook updates the UI state *immediately* while the async Supabase call happens in the background.
    *   **Recursive Helpers:**
        *   `addAction`: Handles adding roots and finding deep parents by ID to append children.
        *   `toggleAction`: Toggles `completed` state and manages the `completed_at` timestamp (critical for the clearing logic).
        *   `updateActionText`: Recursive find-and-replace for text editing.
        *   `deleteAction`: Recursive filter to remove nodes.

*   **UI Components (`ActionsSection.tsx` & `ActionItem.tsx`):**
    *   Integrated the `useActions` hook.
    *   Added interactive elements:
        *   **Edit:** Double-click text or click the pencil icon on hover.
        *   **Delete:** Trash icon on hover.
        *   **Add Child:** Plus icon on hover.
    *   **Timezone Awareness:** The component accepts a `timezone` prop (from the Profile) and passes it to the fetcher, ensuring the "Next Day" logic is accurate to the user's location.

### B. Timezone Management
*   **Database:** Added `timezone` column to `users` table (`20251128000001_add_timezone_to_users.sql`).
*   **UI:** Implemented `TimezoneSelector` component (with Auto-detect).
*   **Integration:** Profile pages now fetch and display local time. `ActionsSection` receives this timezone to drive logic.
*   **Logic:** Created `lib/date.ts` with helpers like `getStartOfTodayInTimezone` to calculate deadlines robustly.

### C. Development Environment & Security Fixes
*   **RLS & Auth:** Solved a tricky `PGRST301` (Unauthorized) issue in Dev Mode.
    *   *Root Cause:* We were injecting a fake "mock-access-token" which Supabase rejected.
    *   *Fix:* Stopped injecting fake tokens in `lib/supabase/client.ts` (falling back to `anon`). Created `20251128000004_fix_dev_mode_rls.sql` to explicitly allow `anon` access if `is_dev_mode()` is true.
*   **Performance:** Optimized RLS policies to use `(select auth.uid())` subqueries (`20251128000002_optimize_rls_policies.sql`).
*   **Security:** Fixed a mutable `search_path` warning for the `update_updated_at_column` function (`20251128000003_fix_function_search_path.sql`).
*   **Bundler:** Switched to `next dev --turbo` for speed.

### D. Documentation Updates
*   **PRD/Epics:** Extensively updated to reflect the pivot to "Actions", the "Unlimited Nesting" requirement, and the prioritization of "Timezone Management" as a foundational step.
*   **Wikis:** Created specific guides for `timezone-handling-guide.md` and `grace-period-logic.md`.

## 3. Current Code State

*   **`lib/supabase/actions.ts`:** The core service. Contains the clearing logic.
*   **`hooks/useActions.ts`:** Robust hook managing optimistic state and recursive CRUD (Add, Toggle, Edit, Delete).
*   **`components/profile/sections/ActionsSection.tsx`:** The main UI controller.
*   **`tests/unit`:** Comprehensive test suites written for Timezone logic (`lib/date.test.ts`), Clearing Logic (`lib/actions_clearing.test.ts`), and Actions Hook (`hooks/useActions.test.tsx`). **NOTE: These tests have been written but NOT executed.**

## 4. Known Issues & "Next Steps" for Developer

1.  **Grace Period Integration (Deferral):**
    *   We implemented the *clearing* (hiding) of old actions.
    *   *TODO:* The "End of Day Summary" screen needs to *read* these cleared actions and show them for a final review before archiving. See `docs/wiki/grace-period-logic.md`.

2.  **Markdown Teleport (Deferral):**
    *   *TODO:* When an action is finally archived (accepted in Grace Period or auto-cleared), append a `- [x] Task` line to the `journal_entries` for that day. This logic is currently just a "Delete/Hide".

3.  **Visual Polish:**
    *   The "Ghosted Parent" state (where a parent is cleared but kept for children) needs distinct styling in `ActionItem.tsx` (e.g., opacity 0.5). Currently, it might just look like a normal completed item.

4.  **Testing:**
    *   Run `pnpm test` to execute the unit tests we wrote. They mock Supabase, so they should run cleanly.

## 5. Relevant Documentation Links
*   `docs/wiki/database-schema-guide.md` (The Goldmine)
*   `docs/wiki/timezone-handling-guide.md`
*   `docs/wiki/grace-period-logic.md`
*   `docs/epics.md` (Updated with new flow)
