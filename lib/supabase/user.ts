import {supabaseClient} from '@/lib/supabase/client';

export async function getUserProfile(userId: string) {
    const {data, error} = await supabaseClient
        .from('users')
        .select('bio')
        .eq('id', userId)
        .single();

    return {data, error};
}

export async function updateUserBio(userId: string, bio: string) {
    const {error} = await supabaseClient
        .from('users')
        .update({bio})
        .eq('id', userId);

    return {error};
}

export interface PublicProfile {
    bio: string | null;
    habits: { id: string; name: string }[];
    todos: { id: string; task: string }[];
    journal_entries: { id: string; content: string }[];
}

export async function getPublicProfileData(userId: string): Promise<{
    data: PublicProfile | null,
    error: Error | null
}> {
    const {data, error} = await supabaseClient
        .from('users')
        .select(`
      bio,
      habits (id, name),
      todos (id, task),
      journal_entries (id, content)
    `)
        .eq('id', userId)
        .eq('habits.is_public', true)
        .eq('todos.is_public', true)
        .eq('journal_entries.is_public', true)
        .single();

    if (error) {
        return {data: null, error: new Error(error.message)};
    }

    return {data, error: null};
}