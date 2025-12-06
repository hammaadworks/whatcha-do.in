import {createServerSideClient} from './server';
import {ActionNode} from './types';
import {filterTreeByPublicStatus} from '@/lib/utils/actionProcessors';

export async function fetchPublicTargetsServer(userId: string, targetDate: string | null): Promise<{
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

    const {data, error} = await query.single();

    if (error) {
        if (error.code === 'PGRST116') {
            return {targets: [], privateCount: 0};
        }
        console.error('Error fetching public targets (server):', error);
        return {targets: [], privateCount: 0};
    }

    const rawTree = (data.data as ActionNode[]) || [];
    const {actions, privateCount} = filterTreeByPublicStatus(rawTree);
    return {targets: actions, privateCount};
}
