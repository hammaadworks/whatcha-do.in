// components/profile/ProfilePageClient.tsx
"use client";

import React from 'react';
import { notFound } from 'next/navigation';
import { PublicUserDisplay } from '@/lib/supabase/types';
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/layout/AppHeader";
import { PublicProfileView } from '@/components/profile/PublicProfileView'; // Added import
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js'; // Added User import


type ProfilePageClientProps = {
  username: string;
  initialProfileUser: PublicUserDisplay | null;
};

export default function ProfilePageClient({ username, initialProfileUser }: ProfilePageClientProps) {
  const { user: authenticatedUser, loading: authLoading } = useAuth();

  // This state is ONLY for when the user is NOT the owner and the profile data needs to be fetched client-side.
  const [clientFetchedProfileUser, setClientFetchedProfileUser] = useState<PublicUserDisplay | null>(null);
  // Removed clientFetchLoading state as it will be derived

  const isOwner = authenticatedUser && authenticatedUser.username === username;

  // Determine the user to display and overall loading state
  let profileToDisplay: PublicUserDisplay | (User & { username?: string; bio?: string }) | null = null;
  let overallLoading = true;

  if (authLoading) {
    overallLoading = true;
  } else if (isOwner) {
    profileToDisplay = authenticatedUser; // Use authenticated user directly
    overallLoading = false;
  } else {
    // Not owner, need to fetch public profile client-side if not already done by SSR
    profileToDisplay = clientFetchedProfileUser || initialProfileUser;
    overallLoading = (!clientFetchedProfileUser && !initialProfileUser); // Derived from presence of data
  }


  useEffect(() => {
    // Only proceed if not the owner, auth is not loading, and we need to fetch the public profile
    if (!isOwner && !authLoading && !clientFetchedProfileUser && !initialProfileUser) {
      const fetchPublicProfile = async () => {
        const res = await fetch(`/api/user/${username}`);
        const data = await res.json();
        const user: PublicUserDisplay | null = data.error ? null : data;

        if (!user) {
          notFound();
        }
        setClientFetchedProfileUser(user);
      };
      fetchPublicProfile();
    }
  }, [username, authenticatedUser, authLoading, isOwner, clientFetchedProfileUser, initialProfileUser]);


  if (overallLoading) {
    return <div>Loading...</div>;
  }

  if (!profileToDisplay) {
    return null; // Should be caught by notFound() earlier
  }

  if (isOwner) {
    // Render the authenticated user's private dashboard
    return (
      <>
        <AppHeader />
        <div className="container mx-auto p-4">
          {/* Placeholder for User's Bio (AC: #2) */}
          <div className="mb-8 p-4 bg-card rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-2">Welcome, {username}!</h2>
            <p className="text-muted-foreground">This is your private dashboard. Your bio will appear here.</p>
          </div>

          {/* Placeholder for Actions (Todos) Section (AC: #3) */}
          <div className="mb-8 p-4 bg-card rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-2">Actions (Todos)</h2>
            <p className="text-muted-foreground">Your todo list will be displayed here.</p>
          </div>

          {/* Container for three habit columns (AC: #4, #5) */}
          <div className="grid grid-cols-1 md:grid-rows-2 md::grid-cols-2 gap-4">
            {/* Today Column */}
            <div className="p-4 bg-card rounded-lg shadow md:col-span-1 md:row-span-1">
              <h2 className="text-xl font-semibold mb-4">Today</h2>
              <div className="h-32 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-muted-foreground">
                Habits for today will appear here
              </div>
            </div>

            {/* Yesterday Column */}
            <div className="p-4 bg-card rounded-lg shadow md:col-span-1 md:row-span-1">
              <h2 className="text-xl font-semibold mb-4">Yesterday</h2>
              <div className="h-32 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-muted-foreground">
                Habits from yesterday will appear here
              </div>
            </div>

            {/* The Pile Column (full-width on desktop, stacked on mobile) */}
            <div className="p-4 bg-card rounded-lg shadow md:col-span-2 md:row-span-1">
              <h2 className="text-xl font-semibold mb-4">The Pile</h2>
              <div className="h-32 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-muted-foreground">
                Your other habits will be piled here
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    // If not owner, or not authenticated, show public profile
    return (
      <>
        {/* If a PublicAppHeader is desired for unauthenticated view, it would go here */}
        <PublicProfileView user={profileToDisplay} />
      </>
    );
  }
}
