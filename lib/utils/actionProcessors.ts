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
 */
export function filterTreeByPublicStatus(nodes: ActionNode[]): ActionNode[] {
    if (!nodes) return [];
    return nodes.reduce((acc: ActionNode[], node) => {
        const children = filterTreeByPublicStatus(node.children || []);
        if (node.is_public || children.length > 0) {
            acc.push({ ...node, children });
        }
        return acc;
    }, []);
}
