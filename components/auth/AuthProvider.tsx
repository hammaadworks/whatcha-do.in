"use client";

import React, { createContext, useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { LOCAL_STORAGE_USER_PROFILE_CACHE_KEY } from "@/lib/constants";

/**
 * Extended User interface that includes Supabase auth data merged with application-specific profile data.
 */
export interface User extends SupabaseUser {
  /** The user's unique username. */
  username?: string;
  /** The user's preferred timezone (IANA format). */
  timezone?: string;
  /** The user's biography or tagline. */
  bio?: string;
}

export interface AuthContextType {
  /** The current authenticated user, or null if not logged in. */
  user: User | null;
  /** Whether the authentication state is currently being determined. */
  loading: boolean;
  /** Force a refresh of the user profile data from the database. */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component for the AuthContext.
 * Manages authentication state, session persistence, and user profile data fetching/caching.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  /**
   * Fetches user profile data (username, bio, timezone) and merges it with the Supabase auth user object.
   * Implements a read-through cache using localStorage to minimize database hits.
   *
   * @param authUser - The basic user object from Supabase Auth.
   * @returns A promise resolving to the fully hydrated User object.
   */
  const fetchUserProfile = async (authUser: SupabaseUser): Promise<User> => {
    // Handle Dev Mode Mock User explicitly
    if (
      process.env.NEXT_PUBLIC_DEV_USER &&
      authUser.id === "68be1abf-ecbe-47a7-bafb-46be273a2e"
    ) {
      return {
        ...authUser,
        username: process.env.NEXT_PUBLIC_DEV_USER,
        timezone: "UTC",
        bio: "Dev Mode User",
      };
    }

    const CACHE_KEY = `${LOCAL_STORAGE_USER_PROFILE_CACHE_KEY}_${authUser.id}`;

    try {
      // 1. Try to get from cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Simple check to ensure it's the right shape/user
        if (parsed.id === authUser.id && parsed.username) {
          // Return merged user immediately
          return { ...authUser, ...parsed };
        }
      }

      // 2. Fetch from DB if not in cache
      const { data, error } = await supabase
        .from("users")
        .select("username, timezone, bio")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return authUser;
      }

      const userWithProfile = {
        ...authUser,
        username: data?.username,
        timezone: data?.timezone,
        bio: data?.bio,
      };

      // 3. Save to cache
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          id: authUser.id,
          username: data?.username,
          timezone: data?.timezone,
          bio: data?.bio,
        })
      );

      return userWithProfile;
    } catch (error) {
      console.error("Unexpected error fetching user profile:", error);
      return authUser;
    }
  };

  /**
   * Refreshes the user data by clearing the cache and re-fetching from the database.
   * Useful when the user updates their profile.
   */
  const refreshUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      // Clear cache to force a fresh fetch
      localStorage.removeItem(
        `${LOCAL_STORAGE_USER_PROFILE_CACHE_KEY}_${session.user.id}`
      );
      const userWithProfile = await fetchUserProfile(session.user);
      setUser(userWithProfile);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const userWithProfile = await fetchUserProfile(session.user);
          if (mounted) setUser(userWithProfile);
        } else {
          if (mounted) setUser(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === "SIGNED_OUT") {
        // Clear any cached user profiles on logout
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(LOCAL_STORAGE_USER_PROFILE_CACHE_KEY)) {
            localStorage.removeItem(key);
          }
        }
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } else if (session?.user) {
        // If we have a session, ensure we have the profile data too
        const userWithProfile = await fetchUserProfile(session.user);
        if (mounted) {
          setUser(userWithProfile);
          setLoading(false);
        }
      } else {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
