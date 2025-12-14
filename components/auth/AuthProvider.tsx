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
 * Props for the AuthProvider component.
 */
interface AuthProviderProps {
  children: React.ReactNode;
  /**
   * Optional initial user data fetched from the server.
   * Providing this allows the provider to skip the initial client-side session check.
   */
  initialUser?: SupabaseUser | null;
}

/**
 * Provider component for the AuthContext.
 * Manages authentication state, session persistence, and user profile data fetching/caching.
 *
 * @param {AuthProviderProps} props - The component props.
 * @returns {JSX.Element} The Context Provider wrapping the children.
 */
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // If initialUser is explicitly provided (even as null), we are not "loading" the base session,
  // but we might still be loading the *profile* data.
  // However, for simplicity, if we have a user, we'll start loading true to fetch profile.
  // If initialUser is null, we are done loading.
  const [loading, setLoading] = useState<boolean>(
    initialUser === undefined ? true : !!initialUser
  );
  
  const supabase = createClient();

  /**
   * Fetches user profile data (username, bio, timezone) and merges it with the Supabase auth user object.
   * Implements a read-through cache using localStorage to minimize database hits.
   *
   * @param {SupabaseUser} authUser - The basic user object from Supabase Auth.
   * @returns {Promise<User>} A promise resolving to the fully hydrated User object.
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

      const userWithProfile: User = {
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
      // If initialUser was passed, use it directly instead of fetching session again
      let currentUser: SupabaseUser | null | undefined = initialUser;

      if (currentUser === undefined) {
          // Fallback: fetch session if no initialUser provided
          try {
            const { data: { session } } = await supabase.auth.getSession();
            currentUser = session?.user ?? null;
          } catch (error) {
            console.error("Error checking session:", error);
            currentUser = null;
          }
      }

      if (currentUser) {
        const userWithProfile = await fetchUserProfile(currentUser);
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
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === "SIGNED_OUT") {
        // Clear any cached user profiles on logout
        // Iterate backwards to safely remove items while looping if needed, 
        // though localStorage.length is dynamic.
        Object.keys(localStorage).forEach((key) => {
             if (key.startsWith(LOCAL_STORAGE_USER_PROFILE_CACHE_KEY)) {
                localStorage.removeItem(key);
             }
        });
        
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      } else if (session?.user) {
        // If we have a session, ensure we have the profile data too
        // We only update if the user ID has changed or we don't have a user yet
        // to avoid unnecessary re-fetches on token refreshes that fire onAuthStateChange
        if (!user || user.id !== session.user.id) {
             const userWithProfile = await fetchUserProfile(session.user);
             if (mounted) {
               setUser(userWithProfile);
               setLoading(false);
             }
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
    // We intentionally exclude 'user' from deps to avoid loops, but we need it for the check inside onAuthStateChange.
    // However, onAuthStateChange callback captures the scope. 
    // Best practice is to rely on the 'session' arg from the callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
