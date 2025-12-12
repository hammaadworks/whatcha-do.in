import {createClient} from './client';
import {Identity} from './types';

/**
 * Fetches all identities for a given user, including the count of linked habits.
 * @param userId - The ID of the user.
 * @returns A promise resolving to an array of Identity objects with a `backingCount` property.
 */
export async function fetchIdentities(userId: string) {
    const supabase = createClient();
    // Fetch identities and count of backed habits
    const {data, error} = await supabase
        .from('identities')
        .select(`
            *,
            habit_identities (count)
        `)
        .eq('user_id', userId)
        .order('created_at', {ascending: false});

    if (error) {
        console.error('Error fetching identities:', error);
        return [];
    }

    // Transform data to include backingCount
    return data.map((identity: any) => ({
        ...identity, backingCount: identity.habit_identities[0]?.count || 0
    }));
}

/**
 * Creates a new identity for a user.
 * @param userId - The ID of the user.
 * @param identity - Object containing title, description, and public status.
 * @returns The created identity object.
 */
export async function createIdentity(userId: string, identity: {
    title: string;
    description?: string;
    is_public: boolean
}) {
    const supabase = createClient();

    const {data, error} = await supabase
        .from('identities')
        .insert([{
            user_id: userId, title: identity.title, description: identity.description, is_public: identity.is_public
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating identity:', error);
        throw error;
    }

    return data;
}

/**
 * Updates an existing identity.
 * @param id - The ID of the identity to update.
 * @param updates - Partial identity object with updated fields.
 */
export async function updateIdentity(id: string, updates: Partial<Identity>) {
    const supabase = createClient();
    const {error} = await supabase
        .from('identities')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating identity:', error);
        throw error;
    }
}

/**
 * Deletes an identity.
 * @param id - The ID of the identity to delete.
 */
export async function deleteIdentity(id: string) {
    const supabase = createClient();
    const {error} = await supabase
        .from('identities')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting identity:', error);
        throw error;
    }
}

/**
 * Fetches all habits linked to a specific identity.
 * @param identityId - The ID of the identity.
 * @returns Array of Habit objects linked to this identity.
 */
export async function fetchIdentityHabits(identityId: string) {
    const supabase = createClient();
    const {data, error} = await supabase
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

    return data.map((item: any) => item.habits);
}

/**
 * Links a habit to an identity.
 * @param userId - The ID of the user (for RLS/ownership check).
 * @param habitId - The ID of the habit.
 * @param identityId - The ID of the identity.
 */
export async function linkHabitToIdentity(userId: string, habitId: string, identityId: string) {
    const supabase = createClient();
    const {error} = await supabase
        .from('habit_identities')
        .insert([{user_id: userId, habit_id: habitId, identity_id: identityId}]);

    if (error) {
        console.error('Error linking habit:', error);
        throw error;
    }
}

/**
 * Unlinks a habit from an identity.
 * @param habitId - The ID of the habit.
 * @param identityId - The ID of the identity.
 */
export async function unlinkHabitFromIdentity(habitId: string, identityId: string) {
    const supabase = createClient();
    const {error} = await supabase
        .from('habit_identities')
        .delete()
        .eq('habit_id', habitId)
        .eq('identity_id', identityId);

    if (error) {
        console.error('Error unlinking habit:', error);
        throw error;
    }
}