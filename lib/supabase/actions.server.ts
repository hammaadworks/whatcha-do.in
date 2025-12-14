import { createServerSideClient } from './server';
import { ActionNode } from '@/lib/supabase/types';
import { applyNextDayClearing, filterTreeByPublicStatus } from '@/lib/logic/actions/processors';
import { withLogging } from '@/lib/logger/withLogging';

/**
 * Internal function to fetch actions (server).
 */
async function _fetchActionsServer(userId: string, userTimezone: string = 'UTC'): Promise<ActionNode[]> {
  const supabase = await createServerSideClient();
  const { data, error } = await supabase
    .from('actions')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        return [];
    }
    console.error("Supabase Fetch Error:", JSON.stringify(error, null, 2));
    throw error;
  }

  const rawTree = (data?.data as ActionNode[]) || [];
  return applyNextDayClearing(rawTree, userTimezone);
}

/**
 * Fetches the entire action tree for the specified user (Server-Side).
 * Applies "Next Day Clearing" logic based on the user's timezone.
 *
 * @param userId - The UUID of the user.
 * @param userTimezone - The IANA timezone string (default: 'UTC').
 * @returns A promise resolving to the list of root ActionNodes.
 */
export const fetchActionsServer = withLogging(_fetchActionsServer, 'fetchActionsServer');

/**
 * Internal function to fetch raw actions (server).
 */
async function _fetchRawActionsServer(userId: string): Promise<ActionNode[]> {
  const supabase = await createServerSideClient();
  const { data, error } = await supabase
    .from('actions')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        return [];
    }
    console.error("Supabase Fetch Error (Server Raw):", JSON.stringify(error, null, 2));
    throw error;
  }

  return (data?.data as ActionNode[]) || [];
}

/**
 * Fetches the raw action tree for the specified user without applying any filtering (Server-Side).
 * Useful for lifecycle processing where we need to see what needs to be cleaned.
 *
 * @param userId - The UUID of the user.
 * @returns A promise resolving to the raw list of ActionNodes.
 */
export const fetchRawActionsServer = withLogging(_fetchRawActionsServer, 'fetchRawActionsServer');

/**
 * Internal function to fetch public actions (server).
 */
async function _fetchPublicActionsServer(userId: string): Promise<{ actions: ActionNode[], privateCount: number }> {
  const supabase = await createServerSideClient();
  const { data, error } = await supabase
    .from('actions')
    .select('data')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        return { actions: [], privateCount: 0 };
    }
    console.error("Supabase Fetch Error (Public Actions):", JSON.stringify(error, null, 2));
    throw error;
  }

  const rawTree = (data?.data as ActionNode[]) || [];
  return filterTreeByPublicStatus(rawTree);
}

/**
 * Fetches only the public actions for the specified user (Server-Side).
 * Does not apply "Next Day Clearing" as public view is historical.
 * Returns filtered actions and a count of private (hidden) actions.
 *
 * @param userId - The UUID of the user.
 * @returns A promise resolving to an object with public actions and private count.
 */
export const fetchPublicActionsServer = withLogging(_fetchPublicActionsServer, 'fetchPublicActionsServer');

/**
 * Internal function to update actions (server).
 */
async function _updateActionsServer(userId: string, newTree: ActionNode[]): Promise<void> {
  const supabase = await createServerSideClient();
  const { error } = await supabase
    .from('actions')
    .upsert({ 
        user_id: userId, 
        data: newTree 
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

/**
 * Updates the entire action tree for the specified user (Server-Side).
 *
 * @param userId - The UUID of the user.
 * @param newTree - The new list of ActionNodes to save.
 * @returns A promise that resolves when the update is complete.
 */
export const updateActionsServer = withLogging(_updateActionsServer, 'updateActionsServer');