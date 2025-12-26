import {fetchRawTargets, updateTargets} from '@/lib/supabase/targets';
import {getCurrentMonthStartISO} from '@/lib/date';
import {ActionNode} from '@/lib/supabase/types';

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

    const {active, completed} = splitActiveCompleted(prevTargets);

    // 1. Migrate Active Targets to Current Month
    if (active.length > 0) {
        await migrateActiveTargets(userId, active, currentMonthDate);
    }

    // 2. Clear Previous Month Bucket
    // This effectively archives completed items (by removing them from the active view)
    // and cleans up the active items that were just moved.
    await clearPreviousMonthTargets(userId, prevMonthDate, completed.length);
}

/**
 * Appends a list of active targets to the current month's target list.
 */
async function migrateActiveTargets(userId: string, activeTargets: ActionNode[], currentMonthDate: string) {
    const currentTargets = await fetchRawTargets(userId, currentMonthDate);
    
    // Merge: Append active targets from previous month to the end of current month's list
    // Assumption: IDs are UUIDs and unique enough to avoid collision during simple merge
    const mergedTargets = [...currentTargets, ...activeTargets];
    
    await updateTargets(userId, currentMonthDate, mergedTargets);
    console.log(`[TargetLifecycle] Carried forward ${activeTargets.length} active targets from previous month to ${currentMonthDate}.`);
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

/**
 * Helper to separate a list of nodes into active (uncompleted) and completed lists.
 */
function splitActiveCompleted(nodes: ActionNode[]): { active: ActionNode[], completed: ActionNode[] } {
    const active: ActionNode[] = [];
    const completed: ActionNode[] = [];

    nodes.forEach(node => {
        if (!node.completed) {
            active.push(node);
        } else {
            completed.push(node);
        }
    });

    return {active, completed};
}