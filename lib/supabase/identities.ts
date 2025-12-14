import { createClient } from './client';
import { Identity, Habit, IdentityWithCount } from './types';
import { withLogging } from '@/lib/logger/withLogging';

/**
 * Internal function to fetch identities.
 */
async function _fetchIdentities(userId: string): Promise<IdentityWithCount[]> {
  const supabase = createClient();
  // Fetch identities and count of backed habits
  const { data, error } = await supabase
    .from('identities')
    .select(`
            *,
            habit_identities (count)
        `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching identities:', error);
    return [];
  }

  // Transform data to include backingCount
  // The 'habit_identities' comes back as an array of objects due to the join, usually [{ count: N }]
  return (data || []).map((identity: any) => ({
    ...identity,
    backingCount: identity.habit_identities?.[0]?.count || 0,
  }));
}

/**
 * Fetches all identities for a given user, including the count of linked habits.
 * @param userId - The ID of the user.
 * @returns A promise resolving to an array of Identity objects with a `backingCount` property.
 */
export const fetchIdentities = withLogging(_fetchIdentities, 'fetchIdentities');

/**
 * Internal function to create identity.
 */
async function _createIdentity(
  userId: string,
  identity: {
    title: string;
    description?: string;
    is_public: boolean;
  }
): Promise<Identity | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('identities')
    .insert([
      {
        user_id: userId,
        title: identity.title,
        description: identity.description,
        is_public: identity.is_public,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating identity:', error);
    throw error;
  }

  return data;
}

/**
 * Creates a new identity for a user.
 * @param userId - The ID of the user.
 * @param identity - Object containing title, description, and public status.
 * @returns The created identity object.
 */
export const createIdentity = withLogging(_createIdentity, 'createIdentity');

/**
 * Internal function to update identity.
 */
async function _updateIdentity(id: string, updates: Partial<Identity>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('identities').update(updates).eq('id', id);

  if (error) {
    console.error('Error updating identity:', error);
    throw error;
  }
}

/**
 * Updates an existing identity.
 * @param id - The ID of the identity to update.
 * @param updates - Partial identity object with updated fields.
 */
export const updateIdentity = withLogging(_updateIdentity, 'updateIdentity');

/**
 * Internal function to delete identity.
 */
async function _deleteIdentity(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('identities').delete().eq('id', id);

  if (error) {
    console.error('Error deleting identity:', error);
    throw error;
  }
}

/**
 * Deletes an identity.
 * @param id - The ID of the identity to delete.
 */
export const deleteIdentity = withLogging(_deleteIdentity, 'deleteIdentity');

/**
 * Internal function to fetch linked habits.
 */
async function _fetchIdentityHabits(identityId: string): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habit_identities')
    .select(`
            habit_id,
            habits (*)
        `)
    .eq('identity_id', identityId);

  if (error) {
    console.error('Error fetching linked habits:', error);
    return [];
  }

  // Map the nested 'habits' object to the top level
  return (data || []).map((item: any) => item.habits);
}

/**
 * Fetches all habits linked to a specific identity.
 * @param identityId - The ID of the identity.
 * @returns Array of Habit objects linked to this identity.
 */
export const fetchIdentityHabits = withLogging(_fetchIdentityHabits, 'fetchIdentityHabits');

/**
 * Internal function to link habit.
 */
async function _linkHabitToIdentity(
  userId: string,
  habitId: string,
  identityId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('habit_identities')
    .insert([{ user_id: userId, habit_id: habitId, identity_id: identityId }]);

  if (error) {
    console.error('Error linking habit:', error);
    throw error;
  }
}

/**
 * Links a habit to an identity.
 * @param userId - The ID of the user (for RLS/ownership check).
 * @param habitId - The ID of the habit.
 * @param identityId - The ID of the identity.
 */
export const linkHabitToIdentity = withLogging(_linkHabitToIdentity, 'linkHabitToIdentity');

/**
 * Internal function to unlink habit.
 */
async function _unlinkHabitFromIdentity(habitId: string, identityId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('habit_identities')
    .delete()
    .eq('habit_id', habitId)
    .eq('identity_id', identityId);

  if (error) {
    console.error('Error unlinking habit:', error);
    throw error;
  }
}

/**
 * Unlinks a habit from an identity.
 * @param habitId - The ID of the habit.
 * @param identityId - The ID of the identity.
 */
export const unlinkHabitFromIdentity = withLogging(_unlinkHabitFromIdentity, 'unlinkHabitFromIdentity');