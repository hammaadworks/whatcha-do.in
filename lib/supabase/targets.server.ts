import { createServerSideClient } from './server';
import { ActionNode } from './types';
import { filterTreeByPublicStatus } from '@/lib/logic/actions/processors';
import { withLogging } from '@/lib/logger/withLogging';

/**
 * Internal function to fetch public targets (server).
 */
async function _fetchPublicTargetsServer(userId: string, targetDate: string | null): Promise<{
  targets: ActionNode[],
  privateCount: number
}> {
  const supabase = await createServerSideClient();

  let query = supabase
    .from('targets')
    .select('*')
    .eq('user_id', userId);

  if (targetDate) {
    query = query.eq('target_date', targetDate);
  } else {
    query = query.is('target_date', null);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { targets: [], privateCount: 0 };
    }
    console.error('Error fetching public targets (server):', error);
    return { targets: [], privateCount: 0 };
  }

  const rawTree = (data.data as ActionNode[]) || [];
  const { actions, privateCount } = filterTreeByPublicStatus(rawTree);
  return { targets: actions, privateCount };
}

/**
 * Fetches the public view of a user's targets for a specific bucket (Server-Side).
 * 
 * Used for rendering public profiles or SEO-friendly pages.
 * Filters out private nodes and counts them.
 * 
 * @param userId - The ID of the user.
 * @param targetDate - The bucket date (e.g., "2023-10-01") or null for future targets.
 * @returns An object containing the filtered targets and a count of private items.
 */
export const fetchPublicTargetsServer = withLogging(_fetchPublicTargetsServer, 'fetchPublicTargetsServer');