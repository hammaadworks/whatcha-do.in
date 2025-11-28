// lib/supabase/user.server.ts
import { createServerSideClient } from '@/lib/supabase/server';
import { PublicUserDisplay } from './types'; // Import shared types
import { withLogging } from '../logger/withLogging';
import logger from '../logger/server';

// Define the core, unwrapped function
async function _getUserByUsernameServer(username: string): Promise<PublicUserDisplay | null> {
    const supabase = await createServerSideClient();
    const { data, error } = await supabase
        .from('users')
        .select('id, username, bio')
        .eq('username', username)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
        logger.error({ err: error, username }, 'Error fetching user by username');
        return null;
    }
    return data as PublicUserDisplay;
}

// Wrap the core function with the logging HOF for export
export const getUserByUsernameServer = withLogging(_getUserByUsernameServer, 'getUserByUsernameServer');


export async function isValidUsername(username: string): Promise<boolean> {
    const user = await getUserByUsernameServer(username);
    return user !== null;
}

// Any other server-side user-related functions can go here.
