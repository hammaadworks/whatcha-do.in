// components/profile/PrivatePage.tsx
"use client";

import { notFound } from 'next/navigation';
import { PublicUserDisplay, ActionNode, Habit, JournalEntry } from '@/lib/supabase/types'; // Import JournalEntry
import { useAuth } from "@/hooks/useAuth";
import React from 'react';

import { PublicPage } from '@/components/profile/PublicPage';
import OwnerProfileView from '@/components/profile/OwnerProfileView'; // New component

type ProfilePageClientProps = {
    username: string;
    initialProfileUser: PublicUserDisplay | null;
    publicActions: ActionNode[];
    publicHabits: Habit[];
    publicJournalEntries: JournalEntry[]; // Add publicJournalEntries
    privateCount?: number; // Add privateCount
};

export default function PrivatePage({ username, initialProfileUser, publicActions, publicHabits, publicJournalEntries, privateCount = 0 }: Readonly<ProfilePageClientProps>) {
    const { user: authenticatedUser, loading: authLoading } = useAuth();
    
    // Determine if the authenticated user is the owner of this profile page
    const isOwner = authenticatedUser?.username === username;

    if (authLoading) {
        // Show loading state if authentication status is still being determined
        return <div>Loading...</div>;
    }

    if (!initialProfileUser) {
        // If no initial user data, something went wrong (server component should have handled this)
        // Or if the initialProfileUser is 'null' from server, then it's a 404.
        notFound();
    }

    // If it's the owner, render the owner's view
    if (isOwner) {
        // Type assertion needed because authenticatedUser is 'User | null', but if isOwner=true, it must be User
        return <OwnerProfileView
            username={username}
            initialProfileUser={authenticatedUser as typeof authenticatedUser & { username: string; id: string; }}
            publicActions={publicActions}
            publicHabits={publicHabits}
            publicJournalEntries={publicJournalEntries}
            privateCount={privateCount} // Pass privateCount
        />;
    } else {
        // If not the owner, render the public version of the profile
        return <PublicPage 
            user={initialProfileUser} 
            publicActions={publicActions} 
            publicHabits={publicHabits} 
            publicJournalEntries={publicJournalEntries} 
            privateCount={privateCount} // Pass privateCount
        />;
    }
}