import { createClient } from './client';
import { ActionNode } from '@/lib/supabase/types';
import { applyNextDayClearing, filterTreeByPublicStatus } from '@/lib/logic/actions/processors';

/**
 * Fetches the entire action tree for the specified user from the client-side.
 * Applies "Next Day Clearing" logic based on the user's timezone.
 *
 * @param userId - The UUID of the user.
 * @param userTimezone - The IANA timezone string of the user (default: 'UTC').
 * @returns A promise resolving to the list of root ActionNodes.
 * @throws Error if the fetch fails (excluding 'PGRST116' no rows error).
 */
export async function fetchActions(userId: string, userTimezone: string = 'UTC'): Promise<ActionNode[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('actions')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        return [];
    }
    console.error("Supabase Fetch Error (Client):", JSON.stringify(error, null, 2));
    throw error;
  }

  const rawTree = (data?.data as ActionNode[]) || [];
  return applyNextDayClearing(rawTree, userTimezone);
}

/**
 * Fetches the raw action tree for the specified user without applying any filtering.
 * Useful for lifecycle processing where we need to see what needs to be cleaned.
 *
 * @param userId - The UUID of the user.
 * @returns A promise resolving to the raw list of ActionNodes.
 */
export async function fetchRawActions(userId: string): Promise<ActionNode[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('actions')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        return [];
    }
    console.error("Supabase Fetch Error (Client Raw):", JSON.stringify(error, null, 2));
    throw error;
  }

  return (data?.data as ActionNode[]) || [];
}

/**
 * Fetches only the public actions for the specified user.
 * Does not apply "Next Day Clearing" as public view is historical.
 * Returns filtered actions and a count of private (hidden) actions.
 *
 * @param userId - The UUID of the user.
 * @returns A promise resolving to an object containing public actions and private action count.
 */
export async function fetchPublicActions(userId: string): Promise<{ actions: ActionNode[], privateCount: number }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('actions')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        return { actions: [], privateCount: 0 };
    }
    console.error("Supabase Fetch Error (Client Public Actions):", JSON.stringify(error, null, 2));
    throw error;
  }

  const rawTree = (data?.data as ActionNode[]) || [];
  return filterTreeByPublicStatus(rawTree);
}

/**
 * Updates the entire action tree for the specified user.
 *
 * @param userId - The UUID of the user.
 * @param newTree - The new list of ActionNodes to save.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateActions(userId: string, newTree: ActionNode[]): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('actions')
    .upsert({ 
        user_id: userId, 
        data: newTree 
    }, { onConflict: 'user_id' });

  if (error) throw error;
}
