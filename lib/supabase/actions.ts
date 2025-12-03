import { createClient } from './client';
import { ActionNode } from '@/lib/supabase/types';
import { applyNextDayClearing, filterTreeByPublicStatus } from '@/lib/utils/actionProcessors';

const supabase = createClient();

export async function fetchActions(userId: string, userTimezone: string = 'UTC'): Promise<ActionNode[]> {
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

export async function fetchPublicActions(userId: string): Promise<{ actions: ActionNode[], privateCount: number }> {
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

export async function updateActions(userId: string, newTree: ActionNode[]): Promise<void> {
  const { error } = await supabase
    .from('actions')
    .upsert({ 
        user_id: userId, 
        data: newTree 
    }, { onConflict: 'user_id' });

  if (error) throw error;
}
