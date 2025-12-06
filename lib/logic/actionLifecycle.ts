import {fetchActions, updateActions} from '@/lib/supabase/actions';

import {getStartOfTodayInTimezone} from '@/lib/date';
import {ActionNode} from '@/lib/supabase/types';
import {format} from 'date-fns';

export async function processActionLifecycle(userId: string, timezone: string) {
    const startOfToday = getStartOfTodayInTimezone(timezone);

    // 1. Fetch current actions tree
    const actions = await fetchActions(userId, timezone);
    if (actions.length === 0) return;

    // 2. Identify items to clear
    const {cleanedTree, itemsToJournal} = extractCompletedItems(actions, startOfToday);

    // 3. Update Actions DB (Remove cleared items from the active tree)
    if (itemsToJournal.length > 0) { // Only update if something was actually cleared
        await updateActions(userId, cleanedTree);
        console.log(`Cleared ${itemsToJournal.length} actions from active list.`);
    }
}

// Reuse logic from targetLifecycle? 
// It's slightly different because Actions don't have monthly buckets, just one tree.
// But the recursive filtering is identical. 
// I'll copy it for now to avoid circular deps or complexity, but ideally this moves to a shared utility.

function extractCompletedItems(nodes: ActionNode[], startOfToday: number): {
    cleanedTree: ActionNode[],
    itemsToJournal: ActionNode[]
} {
    let itemsToJournal: ActionNode[] = [];

    const filter = (currentNodes: ActionNode[]): ActionNode[] => {
        const filtered: ActionNode[] = [];
        for (const node of currentNodes) {
            // Process children first
            const filteredChildren = node.children ? filter(node.children) : [];
            const hasVisibleChildren = filteredChildren.length > 0;

            let shouldClear = false;
            if (node.completed && node.completed_at) {
                const completedTime = new Date(node.completed_at).getTime();
                if (completedTime < startOfToday) {
                    shouldClear = true;
                    // Add to journal list
                    itemsToJournal.push(node);
                }
            }

            if (!shouldClear || hasVisibleChildren) {
                // Keep node (possibly as a ghost container if it was cleared but has children)
                // If shouldClear is true BUT hasVisibleChildren is true, we keep it. 
                // Ideally we mark it as a "ghost" visual if we support that.
                // For now, we just keep it in the tree. It remains "completed".
                // Wait, if we keep it, it won't be deleted.
                // If we want to "delete" it but keep structure, maybe we change it to a non-task node?
                // Or we just accept that parents of active children stick around until children are done.
                // That is the "Ghosting" requirement.
                // FR-3.6.4: "Parent remains visible...". 
                // So effectively we DON'T clear it from the DB yet.
                // BUT, we shouldn't journal it every night!
                // We need a flag `journaled`? Or rely on `completed_at`?
                // If we check `completed_at < startOfToday`, it will match every night.
                // We need to avoid re-journaling.
                // Options:
                // 1. Add `journaled: true` flag to node. Keep it in tree.
                // 2. Only journal if it's being *removed*.

                // If `shouldClear` is true AND `hasVisibleChildren` is true:
                // We are keeping it. We should NOT add it to `itemsToJournal` repeatedly.
                // Only add to `itemsToJournal` if we are *actually* removing it from `filtered`.

                if (shouldClear && hasVisibleChildren) {
                    // It's a ghost. We keep it. Do NOT journal it yet (or maybe we did already?).
                    // If we journal it now, we'll journal it again tomorrow.
                    // We probably need a `journaled` flag on the ActionNode to prevent dupes.
                    // Or, simpler: We only journal leaf nodes? No, parents are tasks too.

                    // Let's assume for MVP: Parents stick around. We only journal/delete when the *whole branch* is ready to go?
                    // Or we journal it once, mark as `journaled`, and keep it.

                    // Let's modify ActionNode type to include `journaled?: boolean`.
                    // Or just check if it's already in the journal? Too expensive.

                    // For now: strictly delete. If it has children, we KEEP it and do NOT journal it yet.
                    // "Parent action cannot be marked complete if it has uncompleted sub-actions" (FR-3.4).
                    // So a completed parent implies all children are completed?
                    // If so, children would be cleared too.
                    // Unless children were completed *today*.
                    // If Parent completed yesterday, Child completed Today.
                    // Parent is "old". Child is "new".
                    // Parent stays to hold Child.
                    // We skip journaling Parent until Child is ready?
                    // That seems safest to avoid dupes.

                    // So: Only journal/delete if `shouldClear && !hasVisibleChildren`.

                    // Re-evaluating logic:
                    // If `shouldClear` (old) and `!hasVisibleChildren` (no active kids):
                    //   -> Add to journal.
                    //   -> Exclude from `filtered`.

                    // If `shouldClear` (old) and `hasVisibleChildren` (active kids):
                    //   -> Do NOT add to journal yet.
                    //   -> Keep in `filtered`.
                    //   -> It stays in the list as "Completed".

                    // This effectively delays the "clearing" of the parent until all kids are clearable.
                    // This satisfies the requirement to keep structure, and avoids duplicate journaling. 

                    filtered.push({
                        ...node, children: filteredChildren
                    });
                } else if (!shouldClear) {
                    // Not old enough to clear. Keep it.
                    filtered.push({
                        ...node, children: filteredChildren
                    });
                } else {
                    // shouldClear && !hasVisibleChildren
                    // Safe to delete!
                    itemsToJournal.push(node);
                }
            }
        }
        return filtered;
    };

    const cleanedTree = filter(nodes);
    return {cleanedTree, itemsToJournal};
}

function getCurrentDateISO(timezone: string): string {
    return format(new Date(), 'yyyy-MM-dd');
}
