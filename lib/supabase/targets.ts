import {createClient} from './client';
import {ActionNode} from './types';
import {filterTreeByPublicStatus} from '@/lib/utils/actionProcessors';

export async function fetchTargets(userId: string, targetDate: string | null) {
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
