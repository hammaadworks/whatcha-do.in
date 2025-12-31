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
        .select('id, username, bio, timezone, active_theme')
        .eq('username', username)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
        logger.error({ err: error, username }, 'Error fetching user by username');
        return null;
    }
    return data as PublicUserDisplay;
}

/**
 * Fetches user profile data by username (Server-Side).
 * 
 * Used for authenticated API routes or server components where RLS or admin access might be needed.
 * Logs errors via the server-side logger.
 * 
 * @param username - The username to search for.
 * @returns A promise resolving to the PublicUserDisplay object or null if not found.
 */
export const getUserByUsernameServer = withLogging(_getUserByUsernameServer, 'getUserByUsernameServer');


/**
 * Checks if a username corresponds to an existing user (Server-Side).
 * 
 * @param username - The username to validate.
 * @returns True if the username exists, false otherwise.
 */
export async function isValidUsername(username: string): Promise<boolean> {
    const user = await getUserByUsernameServer(username);
    return user !== null;
}

// Any other server-side user-related functions can go here.