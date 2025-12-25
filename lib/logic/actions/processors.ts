import { ActionNode } from '@/lib/supabase/types';
import { getStartOfTodayInTimezone } from '@/lib/date';

/**
 * Applies "Next Day Clearing" logic to an ActionNode tree.
 * Items completed before the start of the current day (in the given timezone) are filtered out,
 * unless they have visible children.
 */
export function applyNextDayClearing(nodes: ActionNode[], timezone: string): ActionNode[] {
  const startOfToday = getStartOfTodayInTimezone(timezone);
  const { kept } = partitionActionsByClearingStatus(nodes, startOfToday);
  return kept;
}

/**
 * Recursively separates actions into those that should be kept and those that should be removed
 * based on the "Next Day Clearing" logic.
 * 
 * @param nodes The list of actions to process.
 * @param startOfToday The timestamp (ms) representing the start of the current day.
 * @returns An object containing the 'kept' tree and a flat array of 'removed' nodes.
 */
export function partitionActionsByClearingStatus(nodes: ActionNode[], startOfToday: number): { kept: ActionNode[], removed: ActionNode[] } {
  const kept: ActionNode[] = [];
  const removed: ActionNode[] = [];

  for (const node of nodes) {
    const { kept: keptChildren, removed: removedChildren } = node.children 
        ? partitionActionsByClearingStatus(node.children, startOfToday) 
        : { kept: [], removed: [] };
    
    // Add removed children to the global removed list
    removed.push(...removedChildren);

    const hasVisibleChildren = keptChildren.length > 0;
    let shouldClear = false;
    
    if (node.completed && node.completed_at) {
        const completedTime = new Date(node.completed_at).getTime();
        if (completedTime < startOfToday) {
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
