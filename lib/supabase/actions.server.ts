import { createServerSideClient } from './server';
import { ActionNode } from '@/lib/supabase/types';
import { applyNextDayClearing, filterTreeByPublicStatus } from '@/lib/utils/actionProcessors';

/**
 * Fetches the entire action tree for the specified user.
 * Applies "Next Day Clearing" logic based on the user's timezone.
 */
export async function fetchActionsServer(userId: string, userTimezone: string = 'UTC'): Promise<ActionNode[]> {
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
 * Fetches only the public actions for the specified user.
 * Does not apply "Next Day Clearing" as public view is historical.
 * Returns filtered actions and a count of private (hidden) actions.
 */
export async function fetchPublicActionsServer(userId: string): Promise<{ actions: ActionNode[], privateCount: number }> {
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
 * Updates the entire action tree for the specified user.
 * This is also a server-side only function as it modifies data.
 */
export async function updateActionsServer(userId: string, newTree: ActionNode[]): Promise<void> {
  const supabase = await createServerSideClient();
  const { error } = await supabase
    .from('actions')
    .upsert({ 
        user_id: userId, 
        data: newTree 
    }, { onConflict: 'user_id' });

  if (error) throw error;
}