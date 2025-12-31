import {fetchRawTargets, updateTargets} from '@/lib/supabase/targets';
import {getCurrentMonthStartISO} from '@/lib/date';
import {ActionNode} from '@/lib/supabase/types';
import {partitionActionsByClearingStatus, filterCompletedBeforeDate} from '@/lib/logic/actions/processors';

/**
 * Orchestrates the monthly rollover of targets.
 * Moves uncompleted (active) targets from the previous month to the current month,
 * and clears the previous month's bucket.
 */
export async function processTargetLifecycle(userId: string, timezone: string, referenceDate: Date = new Date()) {
    const currentMonthDate = getCurrentMonthStartISO(timezone, referenceDate, 0);
    const prevMonthDate = getCurrentMonthStartISO(timezone, referenceDate, -1);

    const prevTargets = await fetchRawTargets(userId, prevMonthDate);
    
    // If no targets exist for the previous month, there's nothing to process
    if (prevTargets.length === 0) return;

    // 1. Identify Active Targets (to move)
    // Use partitionActionsByClearingStatus to find items that are NOT completed before currentMonthDate
    // (or have active children). These are the ones continuing into the new month.
    const { kept: activeToMigrate } = partitionActionsByClearingStatus(prevTargets, currentMonthDate, timezone);

    // 2. Identify Completed Targets (to keep in history)
    // Filter the ORIGINAL prevTargets tree to keep only items completed BEFORE currentMonthDate.
    // These remain in the previous month's bucket as history.
    const completedToRetain = filterCompletedBeforeDate(prevTargets, currentMonthDate, timezone);

    // 3. Migrate Active Targets to Current Month
    if (activeToMigrate.length > 0) {
        await migrateActiveTargets(userId, activeToMigrate, currentMonthDate);
    }

    // 4. Update Previous Bucket
    // Overwrite the previous bucket with ONLY the completed items (and their necessary containers).
    // This removes the active items (which were moved) but preserves the history.
    await updateTargets(userId, prevMonthDate, completedToRetain);
    
    if (completedToRetain.length > 0) {
        console.log(`[TargetLifecycle] Retained completed history in ${prevMonthDate}.`);
    } else {
        console.log(`[TargetLifecycle] Cleared ${prevMonthDate} (no completed items to retain).`);
    }
}

/**
 * Appends a list of active targets to the current month's target list.
 */
async function migrateActiveTargets(userId: string, activeTargets: ActionNode[], currentMonthDate: string) {
    const currentTargets = await fetchRawTargets(userId, currentMonthDate);
    
    // Create a Set of existing IDs for O(1) lookup
    const existingIds = new Set(currentTargets.map(t => t.id));

    // Filter out targets that already exist in the destination bucket to prevent duplicates
    const uniqueActiveTargets = activeTargets.filter(t => !existingIds.has(t.id));

    if (uniqueActiveTargets.length === 0) {
        console.log(`[TargetLifecycle] All active targets from previous month already exist in ${currentMonthDate}. Skipping migration.`);
        return;
    }

    // Merge: Append unique active targets from previous month to the end of current month's list
    const mergedTargets = [...currentTargets, ...uniqueActiveTargets];
    
    await updateTargets(userId, currentMonthDate, mergedTargets);
    console.log(`[TargetLifecycle] Carried forward ${uniqueActiveTargets.length} active targets from previous month to ${currentMonthDate}.`);
}

/**
 * Clears the target list for a specific month (previous month).
 */
async function clearPreviousMonthTargets(userId: string, prevMonthDate: string, completedCount: number) {
    await updateTargets(userId, prevMonthDate, []);
    
    if (completedCount > 0) {
        console.log(`[TargetLifecycle] Cleared ${completedCount} completed targets from ${prevMonthDate}.`);
    }
}