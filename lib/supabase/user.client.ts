"use client";

import {createClient} from '@/lib/supabase/client';
import {PublicUserDisplay, QuoteItem, User} from './types';
import {withLogging} from '../logger/withLogging';
import { RESERVED_USERNAMES } from '@/lib/constants';

/**
 * Updates the user's biography.
 * @param userId - The ID of the user.
 * @param bio - The new biography text.
 * @returns Object with data or error.
 */
export async function updateUserBio(userId: string, bio: string) {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('users')
        .update({bio})
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user bio:', error);
        return {data: null, error};
    }
    return {data, error: null};
}

async function _checkUsernameAvailability(username: string): Promise<boolean> {
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
        return false;
    }

    const supabase = createClient();
    // Simple check: select count of users with this username
    const {count, error} = await supabase
        .from('users')
        .select('*', {count: 'exact', head: true})
        .eq('username', username);

    if (error) {
        return false; // Assume unavailable on error to be safe
    }

    return count === 0;
}

/**
 * Checks if a username is available for registration.
 * Checks against reserved words and existing users.
 * 
 * @param username - The username to check.
 * @returns True if available, false otherwise.
 */
export const checkUsernameAvailability = withLogging(_checkUsernameAvailability, 'checkUsernameAvailability');


async function _updateUserProfile(userId: string, updates: { username?: string; bio?: string }) {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        return {data: null, error};
    }
    return {data, error: null};
}

/**
 * Updates basic user profile information (username, bio).
 * @param userId - ID of the user.
 * @param updates - Object containing fields to update.
 */
export const updateUserProfile = withLogging(_updateUserProfile, 'updateUserProfile');


/**
 * Fetches user profile data by username (Client-Side).
 * Used for public profile pages.
 * 
 * @param username - The username to search for.
 * @returns PublicUserDisplay object or null if not found.
 */
export async function getUserByUsernameClient(username: string): Promise<PublicUserDisplay | null> {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('users')
        .select('id, username, bio, timezone, motivations') // Select motivations
        .eq('username', username)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
        console.error('Error fetching user by username (client):', error);
        return null;
    }
    return data as User; // Cast to User to include motivations
}

/**
 * Updates the user's timezone preference.
 * @param userId - ID of the user.
 * @param timezone - IANA timezone string.
 * @returns Updated user data.
 */
export async function updateUserTimezone(userId: string, timezone: string) {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('users')
        .update({timezone})
        .eq('id', userId)
        .select();

    if (error) {
        console.error('Error updating user timezone:', error);
        throw error;
    }
    return data;
}

async function _fetchUserMotivations(userId: string): Promise<QuoteItem[] | null> {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('users')
        .select('motivations')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user motivations:', error);
        return null;
    }
    return data?.motivations || null;
}

/**
 * Fetches the list of motivational quotes for a user.
 * @param userId - ID of the user.
 * @returns Array of QuoteItems or null.
 */
export const fetchUserMotivations = withLogging(_fetchUserMotivations, 'fetchUserMotivations');

async function _updateUserMotivations(userId: string, motivations: QuoteItem[]): Promise<{
    data: QuoteItem[] | null,
    error: any
}> {
    const supabase = createClient();
    const {data, error} = await supabase
        .from('users')
        .update({motivations})
        .eq('id', userId)
        .select('motivations')
        .single();

    if (error) {
        console.error('Error updating user motivations:', error);
        return {data: null, error};
    }
    return {data: data.motivations, error: null};
}

/**
 * Replaces the entire list of user motivations.
 * @param userId - ID of the user.
 * @param motivations - New array of QuoteItems.
 */
export const updateUserMotivations = withLogging(_updateUserMotivations, 'updateUserMotivations');

async function _addUserMotivation(userId: string, newQuoteText: string): Promise<{
    data: QuoteItem[] | null,
    error: any
}> {
    const existingMotivations = await fetchUserMotivations(userId);
    const newMotivation: QuoteItem = {id: Date.now().toString(), text: newQuoteText};
    const updatedMotivations = existingMotivations ? [newMotivation, ...existingMotivations] : [newMotivation]; // Add to top

    return _updateUserMotivations(userId, updatedMotivations);
}

/**
 * Adds a new motivation quote to the user's list.
 * @param userId - ID of the user.
 * @param newQuoteText - The text of the new quote.
 */
export const addUserMotivation = withLogging(_addUserMotivation, 'addUserMotivation');

async function _editUserMotivation(userId: string, quoteId: string, newText: string): Promise<{
    data: QuoteItem[] | null,
    error: any
}> {
    const existingMotivations = await fetchUserMotivations(userId);
    if (!existingMotivations) {
        return {data: null, error: 'No motivations found to edit.'};
    }

    const updatedMotivations = existingMotivations.map(quote => quote.id === quoteId ? {
        ...quote,
        text: newText
    } : quote);

    return _updateUserMotivations(userId, updatedMotivations);
}

/**
 * Edits the text of an existing motivation quote.
 * @param userId - ID of the user.
 * @param quoteId - ID of the quote to edit.
 * @param newText - New text content.
 */
export const editUserMotivation = withLogging(_editUserMotivation, 'editUserMotivation');

async function _deleteUserMotivation(userId: string, quoteId: string): Promise<{
    data: QuoteItem[] | null,
    error: any
}> {
    const existingMotivations = await fetchUserMotivations(userId);
    if (!existingMotivations) {
        return {data: null, error: 'No motivations found to delete.'};
    }

    const updatedMotivations = existingMotivations.filter(quote => quote.id !== quoteId);

    return _updateUserMotivations(userId, updatedMotivations);
}

/**
 * Deletes a motivation quote from the user's list.
 * @param userId - ID of the user.
 * @param quoteId - ID of the quote to delete.
 */
export const deleteUserMotivation = withLogging(_deleteUserMotivation, 'deleteUserMotivation');
