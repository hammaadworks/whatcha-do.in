// lib/supabase/user.server.ts
import { createServerSideClient } from '@/lib/supabase/server';
import { PublicUserDisplay } from './types'; // Import shared types

// Server-side function to get user by username
export async function getUserByUsernameServer(username: string): Promise<PublicUserDisplay | null> {
    const supabase = await createServerSideClient();
    const { data, error } = await supabase
        .from('users')
        .select('id, username, bio')
        .eq('username', username)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
        console.error('Error fetching user by username (server):', error);
        return null;
    }
    return data as PublicUserDisplay;
}

export async function isValidUsername(username: string): Promise<boolean> {
    const user = await getUserByUsernameServer(username);
    return user !== null;
}

// Any other server-side user-related functions can go here.
