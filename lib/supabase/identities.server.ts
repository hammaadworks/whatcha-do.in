import { createServerSideClient } from './server';
import { IdentityWithCount } from './types';
import { withLogging } from '@/lib/logger/withLogging';

/**
 * Internal function to fetch public identities (server).
 */
async function _fetchPublicIdentitiesServer(userId: string): Promise<IdentityWithCount[]> {
  const supabase = await createServerSideClient();

  // 1. Fetch all public identities for the user
  const { data: identities, error: idError } = await supabase
    .from('identities')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (idError) {
    console.error('Error fetching public identities:', idError);
    return [];
  }

  if (!identities || identities.length === 0) return [];

  // 2. Fetch counts of PUBLIC linked habits for these identities
  const identityIds = identities.map(i => i.id);

  const { data: links, error: linkError } = await supabase
    .from('habit_identities')
    .select(`
            identity_id,
            habits!inner (
                is_public
            )
        `)
    .in('identity_id', identityIds)
    .eq('habits.is_public', true); // Only count public habits

  if (linkError) {
    console.error('Error fetching identity links:', linkError);
    // Fallback: return identities with 0 count
    return identities.map(i => ({ ...i, backingCount: 0 }));
  }

  // 3. Aggregate counts locally
  const counts: Record<string, number> = {};
  links?.forEach((link: any) => {
    const id = link.identity_id;
    counts[id] = (counts[id] || 0) + 1;
  });

  // 4. Merge counts into identity objects
  return identities.map(identity => ({
    ...identity,
    backingCount: counts[identity.id] || 0
  }));
}

/**
 * Fetches public identities for a user, including the count of *public* habits backing them.
 * 
 * Used for the public profile "Identity Stack" view.
 * 
 * @param userId - The ID of the user.
 * @returns A promise resolving to an array of Identity objects with a `backingCount` property.
 */
export const fetchPublicIdentitiesServer = withLogging(_fetchPublicIdentitiesServer, 'fetchPublicIdentitiesServer');