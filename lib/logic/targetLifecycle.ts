import {fetchTargets, updateTargets} from '@/lib/supabase/targets';
import {getMonthStartDate} from '@/lib/date';
import {ActionNode} from '@/lib/supabase/types';

export async function processTargetLifecycle(userId: string, timezone: string) {
    const currentMonthDate = getMonthStartDate(0, timezone);
    const prevMonthDate = getMonthStartDate(-1, timezone);

    // Fetch targets from the previous month
    const prevTargets = await fetchTargets(userId, prevMonthDate);

    if (prevTargets.length > 0) {
        // 1. Separate Active (Uncompleted) and Completed items
        const {active, completed} = splitActiveCompleted(prevTargets);

        // 2. Fetch current month's targets to merge active items
        const currentTargets = await fetchTargets(userId, currentMonthDate);
        
        // 3. Merge Active items into Current Month
        // We append them. We assume IDs are unique enough or handled by the UI.
        const mergedTargets = [...currentTargets, ...active];

        if (active.length > 0) {
             await updateTargets(userId, currentMonthDate, mergedTargets);
             console.log(`Carried forward ${active.length} active targets from ${prevMonthDate} to ${currentMonthDate}.`);
        }

        // 4. Clear Previous Month Bucket
        // Completed items are effectively deleted here (filtered out and not moved).
        // Active items are moved.
        // So we set the previous month's data to empty.
        await updateTargets(userId, prevMonthDate, []);
        
        if (completed.length > 0) {
            console.log(`Cleared ${completed.length} completed targets from ${prevMonthDate}.`);
        }
    }
}

// Helpers

function splitActiveCompleted(nodes: ActionNode[]): { active: ActionNode[], completed: ActionNode[] } {
    const active: ActionNode[] = [];
    const completed: ActionNode[] = [];

    // Recursive split?
    // Targets are usually a flat list or simple hierarchy.
    // If a parent is incomplete but has completed children?
    // Requirement: "unmarked Items ... carried-forward".
    // If Parent is unmarked, it moves.
    // What happens to its children?
    // If we move the Parent, we move the children too (in the `children` array).
    // Does this mean we might carry forward a "Completed" child inside an "Uncompleted" parent?
    // Yes, that is standard behavior for trees. The completion status of the parent is what matters for the "Item".
    // If the parent is completed, the whole tree is cleared (as it's done).
    // If the parent is incomplete, it is carried forward.

    nodes.forEach(node => {
        if (!node.completed) {
            active.push(node);
        } else {
            completed.push(node);
        }
    });

    return {active, completed};
}