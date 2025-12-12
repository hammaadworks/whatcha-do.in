import {createClient} from './client';
import {ActionNode} from './types';
import {filterTreeByPublicStatus} from '@/lib/logic/actions/processors';

/**
 * Fetches the target tree for a specific user and date bucket.
 * 
 * @param userId - The ID of the user.
 * @param targetDate - The bucket date (e.g., "2023-10-01") or null for future targets.
 * @returns A promise resolving to the list of ActionNodes in the target bucket.
 */
export async function fetchTargets(userId: string, targetDate: string | null): Promise<ActionNode[]> {
    const supabase = createClient();

    // Build query
    let query = supabase
        .from('targets')
        .select('*')
        .eq('user_id', userId);

    if (targetDate) {
        query = query.eq('target_date', targetDate);
    } else {
        query = query.is('target_date', null);
    }

    const {data, error} = await query.single();

    if (error) {
        if (error.code === 'PGRST116') {
            // Not found, return empty structure
            return [];
        }
        console.error('Error fetching targets:', error);
        return [];
    }

    return (data.data as ActionNode[]) || [];
}

/**
 * Fetches raw targets without any processing. 
 * Alias for `fetchTargets` but explicit in intent for lifecycle use.
 * 
 * @param userId - The ID of the user.
 * @param targetDate - The bucket date.
 * @returns A promise resolving to the raw ActionNode tree.
 */
export async function fetchRawTargets(userId: string, targetDate: string | null): Promise<ActionNode[]> {
    return fetchTargets(userId, targetDate);
}

/**
 * Fetches the public view of a user's targets for a specific bucket.
 * Filters out private nodes and counts them.
 * 
 * @param userId - The ID of the user.
 * @param targetDate - The bucket date.
 * @returns An object containing the filtered targets and a count of private items.
 */
export async function fetchPublicTargets(userId: string, targetDate: string | null): Promise<{
    targets: ActionNode[],
    privateCount: number
}> {
    const supabase = createClient();

    let query = supabase
        .from('targets')
        .select('*')
        .eq('user_id', userId);

    if (targetDate) {
        query = query.eq('target_date', targetDate);
    } else {
        query = query.is('target_date', null);
    }

    const {data, error} = await query.single();

    if (error) {
        if (error.code === 'PGRST116') {
            return {targets: [], privateCount: 0};
        }
        console.error('Error fetching public targets:', error);
        return {targets: [], privateCount: 0};
    }

    const rawTree = (data.data as ActionNode[]) || [];
    const {actions, privateCount} = filterTreeByPublicStatus(rawTree);
    return {targets: actions, privateCount};
}

/**
 * Updates or inserts a target tree for a specific user and bucket.
 * 
 * @param userId - The ID of the user.
 * @param targetDate - The bucket date.
 * @param nodes - The new tree of ActionNodes.
 */
export async function updateTargets(userId: string, targetDate: string | null, nodes: ActionNode[]) {
    const supabase = createClient();

    // Upsert logic
    const payload = {
        user_id: userId, target_date: targetDate, data: nodes
    };

    const {error} = await supabase
        .from('targets')
        .upsert(payload, {onConflict: 'user_id, target_date'});

    if (error) {
        console.error('Error updating targets:', error);
        throw error;
    }
}