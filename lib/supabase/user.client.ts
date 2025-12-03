"use client";

import { createClient } from '@/lib/supabase/client';
import { PublicUserDisplay } from './types';

export async function updateUserBio(userId: string, bio: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('users')
        .update({ bio })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user bio:', error);
        return { data: null, error };
    }
    return { data, error: null };
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
    const reservedUsernames = [
        'auth', 'api', 'dashboard', 'journal', 'grace-period', 'profile', 
        'settings', 'login', 'logout', 'admin', 'support', 'help', 'public'
    ];

    if (reservedUsernames.includes(username.toLowerCase())) {
        return false;
    }

    const supabase = createClient();
    // Simple check: select count of users with this username
    const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('username', username);

    if (error) {
        console.error('Error checking username availability:', error);
        return false; // Assume unavailable on error to be safe
    }
    
    return count === 0;
}

export async function updateUserProfile(userId: string, updates: { username?: string; bio?: string }) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user profile:', error);
        return { data: null, error };
    }
    return { data, error: null };
}

// Client-side function to get user by username
export async function getUserByUsernameClient(username: string): Promise<PublicUserDisplay | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('users')
        .select('id, username, bio, timezone')
        .eq('username', username)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
        console.error('Error fetching user by username (client):', error);
        return null;
    }
    return data as PublicUserDisplay;
}

export async function updateUserTimezone(userId: string, timezone: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('users')
        .update({ timezone })
        .eq('id', userId)
        .select();

    if (error) {
        console.error('Error updating user timezone:', error);
        throw error;
    }
    return data;
}

