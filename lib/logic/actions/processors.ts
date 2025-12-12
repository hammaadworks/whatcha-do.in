import { ActionNode } from '@/lib/supabase/types';
import { getStartOfTodayInTimezone } from '@/lib/date';

/**
 * Applies "Next Day Clearing" logic to an ActionNode tree.
 * Items completed before the start of the current day (in the given timezone) are filtered out,
 * unless they have visible children.
 */
export function applyNextDayClearing(nodes: ActionNode[], timezone: string): ActionNode[] {
  const startOfToday = getStartOfTodayInTimezone(timezone);
  return filterNodes(nodes, startOfToday);
}

// Helper for applyNextDayClearing
export function filterNodes(nodes: ActionNode[], startOfToday: number): ActionNode[] {
  const filtered: ActionNode[] = [];

  for (const node of nodes) {
    const filteredChildren = node.children ? filterNodes(node.children, startOfToday) : [];
    const hasVisibleChildren = filteredChildren.length > 0;

    let shouldClear = false;
    if (node.completed && node.completed_at) {
      const completedTime = new Date(node.completed_at).getTime();
      if (completedTime < startOfToday) {
        shouldClear = true;
      }
    }
    
    if (!shouldClear || hasVisibleChildren) {
      filtered.push({
        ...node,
        children: filteredChildren
      });
    }
  }

  return filtered;
}

/**
 * Recursively filters an ActionNode tree to include only nodes marked as public,
 * or nodes that have public children.
 * Returns the filtered tree and the count of private (hidden) actions.
 */
export function filterTreeByPublicStatus(nodes: ActionNode[]): { actions: ActionNode[], privateCount: number } {
    if (!nodes) return { actions: [], privateCount: 0 };

    let privateCount = 0;

    const filter = (currentNodes: ActionNode[]): ActionNode[] => {
        return currentNodes.reduce((acc: ActionNode[], node) => {
            const isPublic = node.is_public ?? true;
            const children = filter(node.children || []);
            
            // Logic:
            // 1. If node is explicitly public (or undefined/default public), show it.
            // 2. If node is private, but has visible children, show it (as a container). 
            //    (However, strict rule "Parent Private -> Child Private" makes this case rare/impossible if enforced).
            // 3. If hidden, count it (and its hidden descendants) if not completed.

            if (isPublic || children.length > 0) {
                acc.push({ ...node, children });
            } else {
                // Node is hidden.
                // Count this node if uncompleted.
                if (!node.completed) {
                    privateCount++;
                }
                // Count descendants that are also hidden and uncompleted.
                // Since we are in the 'else' block, the `children` variable above contains the *filtered* (public) children.
                // Since we are hiding the parent, we are effectively hiding the whole subtree (unless children were lifted, which they aren't here).
                // We should count based on the ORIGINAL children, not the filtered ones.
                // But wait, if `children.length > 0`, we WOULD show the parent.
                // So here `children.length === 0`.
                // This means all children were either private or non-existent.
                // So we need to count uncompleted items in the original `node.children`.
                
                const countHiddenRecursive = (n: ActionNode) => {
                    if (!n.completed) {
                        privateCount++;
                    }
                    n.children?.forEach(countHiddenRecursive);
                };
                // We only need to count children, as we already counted `node` above.
                node.children?.forEach(countHiddenRecursive);
            }
            return acc;
        }, []);
    };

    const actions = filter(nodes);
    return { actions, privateCount };
}
