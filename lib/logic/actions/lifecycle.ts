import { fetchRawActions, updateActions } from '@/lib/supabase/actions';
import { getStartOfTodayInTimezone } from '@/lib/date';
import { partitionActionsByClearingStatus } from './processors';

/**
 * Processes the lifecycle of actions for a given user.
 * Specifically, it handles the "Next Day Clearing" logic:
 * 1. Fetches the raw action tree (including completed items that might need clearing).
 * 2. Identifies items that were completed before "today" in the user's timezone.
 * 3. Removes those items from the active tree (unless they have active children).
 * 4. Updates the database with the cleaned tree.
 * 
 * @param userId The ID of the user to process.
 * @param timezone The user's timezone string (e.g., 'America/New_York').
 */
export async function processActionLifecycle(userId: string, timezone: string) {
    const startOfToday = getStartOfTodayInTimezone(timezone);

    // 1. Fetch current RAW actions tree (no auto-filtering)
    const actions = await fetchRawActions(userId);
    if (actions.length === 0) return;

    // 2. Partition into kept and removed items
    const { kept: cleanedTree, removed: itemsToClear } = partitionActionsByClearingStatus(actions, startOfToday);

    // 3. Update Actions DB if there are items to clear
    if (itemsToClear.length > 0) {
        await updateActions(userId, cleanedTree);
        console.log(`[Lifecycle] Cleared ${itemsToClear.length} actions for user ${userId}.`);
        
        // TODO: Future: Journal the cleared items here.
        // journalActions(userId, itemsToClear, timezone);
    }
}

