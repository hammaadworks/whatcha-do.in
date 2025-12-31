import { ActionNode } from '@/lib/supabase/types';
import { getTodayISO } from '@/lib/date';

/**
 * Applies "Next Day Clearing" logic to an ActionNode tree.
 * Items completed before the start of the current day (in the given timezone) are filtered out,
 * unless they have visible children.
 */
export function applyNextDayClearing(nodes: ActionNode[], timezone: string): ActionNode[] {
  const todayISO = getTodayISO(timezone);
  const { kept } = partitionActionsByClearingStatus(nodes, todayISO, timezone);
  return kept;
}

/**
 * Recursively separates actions into those that should be kept and those that should be removed
 * based on the "Next Day Clearing" logic.
 * 
 * @param nodes The list of actions to process.
 * @param todayISO The current date in the user's timezone (YYYY-MM-DD).
 * @param timezone The user's timezone string.
 * @returns An object containing the 'kept' tree and a flat array of 'removed' nodes.
 */
export function partitionActionsByClearingStatus(nodes: ActionNode[], todayISO: string, timezone: string): { kept: ActionNode[], removed: ActionNode[] } {
  const kept: ActionNode[] = [];
  const removed: ActionNode[] = [];

  for (const node of nodes) {
    const { kept: keptChildren, removed: removedChildren } = node.children 
        ? partitionActionsByClearingStatus(node.children, todayISO, timezone) 
        : { kept: [], removed: [] };
    
    // Add removed children to the global removed list
    removed.push(...removedChildren);

    const hasVisibleChildren = keptChildren.length > 0;
    let shouldClear = false;
    
    if (node.completed && node.completed_at) {
        // Convert completion timestamp to Date in user's timezone
        const completedDateISO = getTodayISO(timezone, new Date(node.completed_at));
        
        // If completed on a previous day (completedDateISO < todayISO) -> clear it
        if (completedDateISO < todayISO) {
            shouldClear = true;
        }
    }

    if (!shouldClear || hasVisibleChildren) {
        kept.push({
            ...node,
            children: keptChildren
        });
    } else {
        // Node is removed. 
        // Its children (if any) were either already removed (and added to removed list) 
        // or the node had no children.
        removed.push(node);
    }
  }

  return { kept, removed };
}

/**
 * Filters a tree to retain only items that were completed before a specific ISO date (threshold),
 * or items that act as containers for such completed items.
 * 
 * Used for "Previous Month" history, where we want to show what was done, but remove what was moved forward.
 * 
 * @param nodes The action tree.
 * @param thresholdISO The ISO date string (YYYY-MM-DD). Items completed BEFORE this are kept.
 * @param timezone The user's timezone.
 */
export function filterCompletedBeforeDate(nodes: ActionNode[], thresholdISO: string, timezone: string): ActionNode[] {
    const filtered: ActionNode[] = [];

    for (const node of nodes) {
        // 1. Recurse first
        const keptChildren = node.children 
            ? filterCompletedBeforeDate(node.children, thresholdISO, timezone) 
            : [];

        let keepNode = false;

        // 2. Check if node itself is "Old Completed"
        if (node.completed && node.completed_at) {
            const completedDateISO = getTodayISO(timezone, new Date(node.completed_at));
            if (completedDateISO < thresholdISO) {
                keepNode = true;
            }
        }

        // 3. Keep if it has children (Container)
        if (keptChildren.length > 0) {
            keepNode = true;
        }

        if (keepNode) {
            filtered.push({
                ...node,
                children: keptChildren
            });
        }
    }

    return filtered;
}


/**
 * Recursively filters an ActionNode tree to include only nodes marked as public,
 * or nodes that have public children (containers).
 * 
 * Returns the filtered tree and the total count of private (hidden) actions that are uncompleted.
 * 
 * Logic:
 * 1. If a node is explicitly public, it is kept.
 * 2. If a node is private but has public descendants, it is kept (as a container).
 * 3. If a node is hidden (private and no public descendants), it and its uncompleted descendants contribute to `privateCount`.
 */
export function filterTreeByPublicStatus(nodes: ActionNode[]): { actions: ActionNode[], privateCount: number } {
    if (!nodes) return { actions: [], privateCount: 0 };

    // Inner recursive function that returns the filtered list AND the count of hidden items for that subtree
    const filterRecursive = (currentNodes: ActionNode[]): { filtered: ActionNode[], count: number } => {
        let count = 0;
        
        const filtered = currentNodes.reduce((acc: ActionNode[], node) => {
            const isPublic = node.is_public ?? true;
            
            // Recurse first to determine if children are visible
            const { filtered: visibleChildren, count: hiddenChildCount } = filterRecursive(node.children || []);
            
            // Add the count of hidden items found in the children's subtrees
            count += hiddenChildCount;

            // A node is visible if it is explicitly public OR if it acts as a container for visible children
            const isVisible = isPublic || visibleChildren.length > 0;

            if (isVisible) {
                acc.push({ ...node, children: visibleChildren });
            } else {
                // Node is hidden (Private AND no visible children).
                // If it is uncompleted, it counts as a "hidden task".
                if (!node.completed) {
                    count++;
                }
                // Note: We've already added `hiddenChildCount` to `count`.
                // If this node is hidden, `visibleChildren` is empty.
                // Any uncompleted private tasks in the subtree were captured in `hiddenChildCount`.
            }
            return acc;
        }, []);
        
        return { filtered, count };
    };

    const { filtered: actions, count: privateCount } = filterRecursive(nodes);
    return { actions, privateCount };
}
