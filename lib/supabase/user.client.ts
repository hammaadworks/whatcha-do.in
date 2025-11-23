"use client";

import { createClient } from '@/lib/supabase/client';
import { PublicUserDisplay } from './types';

// Stub file for now. Will contain Supabase client functions related to users.

export const updateUserBio = async (_userId: string, _bio: string) => {
    console.warn("updateUserBio is a stub and not fully implemented (client)."); // Added (client) for clarity
    return { data: null, error: null };
};

// Client-side function to get user by username
export async function getUserByUsernameClient(username: string): Promise<PublicUserDisplay | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('users')
        .select('id, username, bio')
        .eq('username', username)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
        console.error('Error fetching user by username (client):', error);
        return null;
    }
    return data as PublicUserDisplay;
}

// Any other client-side user-related functions can go here.
