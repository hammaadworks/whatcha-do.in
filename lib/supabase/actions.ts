// lib/supabase/actions.ts
import { createClient } from './client';
import { ActionNode } from '@/lib/supabase/types'; // Import ActionNode from centralized types
import { getStartOfTodayInTimezone } from '@/lib/date';

/**
 * Fetches the entire action tree for the specified user.
 * Applies "Next Day Clearing" logic based on the user's timezone.
 */
async function _fetchActions(userId: string, userTimezone: string = 'UTC'): Promise<ActionNode[]> {
  const supabase = createClient(); // Initialize client here
  const { data, error } = await supabase
    .from('actions')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        // No row found, return empty array (new user)
        return [];
    }
    console.error("Supabase Fetch Error:", JSON.stringify(error, null, 2));
    throw error;
  }

  const rawTree = (data?.data as ActionNode[]) || [];
  return applyNextDayClearing(rawTree, userTimezone);
}

/**
 * Fetches only the public actions for the specified user.
 * Does not apply "Next Day Clearing" as public view is historical.
 */
async function _fetchPublicActions(userId: string): Promise<ActionNode[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('actions')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        // No row found, return empty array
        return [];
    }
    console.error("Supabase Fetch Error (Public Actions):", JSON.stringify(error, null, 2));
    throw error;
  }

  // Filter the actions tree to include only public nodes
  const rawTree = (data?.data as ActionNode[]) || [];
  return filterTreeByPublicStatus(rawTree);
}

// Recursive helper to filter a tree by is_public status
function filterTreeByPublicStatus(nodes: ActionNode[]): ActionNode[] {
    if (!nodes) return [];
    return nodes.reduce((acc: ActionNode[], node) => {
        // Assume ActionNode has an 'is_public' property, if not, it means it's always public implicitly or needs to be added to ActionNode
        // For now, based on schema, ActionNode does not have 'is_public'. Public status is on the habit/journal entries.
        // Actions have is_public on individual nodes in the JSONB.
        // Let's assume the data structure of ActionNode (from types.ts) actually reflects what's in the JSONB.
        // If the 'is_public' flag is actually on ActionNode itself, then filter it.
        // If not, then all actions in a user's action tree are private by default, unless explicitly marked.
        // The problem description said: "A `🌐/🔒` privacy toggle is available on hover."
        // This implies ActionNode must have an 'is_public' flag.

        // So, first, I need to update ActionNode in lib/supabase/types.ts to include is_public: boolean.
        // Then, apply the filter here.

        // Assuming is_public exists on ActionNode:
        const children = filterTreeByPublicStatus(node.children || []);
        if (node.is_public || children.length > 0) {
            acc.push({ ...node, children });
        }
        return acc;
    }, []);
}


/**
 * Updates the entire action tree for the specified user.
 */
async function _updateActions(userId: string, newTree: ActionNode[]): Promise<void> {
  const supabase = createClient(); // Initialize client here
  const { error } = await supabase
    .from('actions')
    .upsert({ 
        user_id: userId, 
        data: newTree 
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

// --- Helper Logic for Next Day Clearing ---

function applyNextDayClearing(nodes: ActionNode[], timezone: string): ActionNode[] {
  const startOfToday = getStartOfTodayInTimezone(timezone);
  return filterNodes(nodes, startOfToday);
}

function filterNodes(nodes: ActionNode[], startOfToday: number): ActionNode[] {
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

export const fetchActions = _fetchActions;
export const updateActions = _updateActions;
export const fetchPublicActions = _fetchPublicActions;
