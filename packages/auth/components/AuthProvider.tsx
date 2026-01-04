"use client";

import React, { createContext, useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/packages/auth/lib/supabase/client";
import { LOCAL_STORAGE_USER_PROFILE_CACHE_KEY } from "@/lib/constants";
import { User } from "@/lib/supabase/types";
import { THEMES } from "@/lib/themes.ts";

// Re-export User type for consumers
export type { User };

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
        // Spread Supabase user properties (id, email, etc.)
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at,
        // App-specific properties
        username: process.env.NEXT_PUBLIC_DEV_USER,
        timezone: "Asia/Calcutta",
        bio: "Dev Mode User",
        purchased_themes: ["zenith", "monolith", "darky", "prototype"], // Dev user has all themes
        is_pro: true,
        active_theme: "darky"
      } as User;
    }

    const CACHE_KEY = `${LOCAL_STORAGE_USER_PROFILE_CACHE_KEY}_${authUser.id}`;

    try {
      // 1. Try to get from cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Simple check to ensure it's the right shape/user
        if (parsed.id === authUser.id && parsed.username) {
          // Merge authUser to ensure we have the latest Supabase auth properties (like session/jwt if they were part of it, though User is mostly static)
          // Ideally, we respect the cached profile fields.
          // Note: If cached, purchased_themes might be missing if we stopped caching it.
          return {
            id: authUser.id,
            email: authUser.email,
            created_at: authUser.created_at,
            updated_at: authUser.updated_at,
            ...parsed
          } as User;
        }
      }

      // 2. Fetch from DB if not in cache
      const { data, error } = await supabase
        .from("users")
        .select("username, timezone, bio, purchased_themes, is_pro, active_theme")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        // Return a partial User if DB fails, though strictly it violates the type if fields are missing.
        // We cast to User for now to prevent app crash, but components should handle missing profile data gracefully.
        return {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at
        } as User;
      }

      const userWithProfile: User = {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at,
        username: data?.username,
        timezone: data?.timezone,
        bio: data?.bio,
        purchased_themes: data?.purchased_themes ?? [],
        is_pro: data?.is_pro ?? false,
        active_theme: data?.active_theme ?? THEMES[0].id // Default fallback
      };

      // 3. Save to cache
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          id: authUser.id,
          username: data?.username,
          timezone: data?.timezone,
          bio: data?.bio,
          is_pro: data?.is_pro ?? false
          // purchased_themes and active_theme intentionally excluded to force fresh fetch/sync logic
        })
      );

      return userWithProfile;
    } catch (error) {
      console.error("Unexpected error fetching user profile:", error);
      return {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at
      } as User;
    }
  };

  /**
   * Refreshes the user data by clearing the cache and re-fetching from the database.
   * Useful when the user updates their profile.
   */
  const refreshUser = async () => {
    const {
      data: { session }
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

  // Use a ref to track the current user ID to avoid stale closures in the event listener
  const userIdRef = React.useRef<string | null>(null);

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
          setUser((prev) => {
             // Deep comparison to prevent redundant updates
             if (JSON.stringify(prev) === JSON.stringify(userWithProfile)) {
                 return prev;
             }
             userIdRef.current = userWithProfile.id;
             return userWithProfile;
          });
          setLoading(false);
        }
      } else {
        if (mounted) {
          setUser(null);
          userIdRef.current = null;
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === "SIGNED_OUT") {
        // Clear any cached user profiles on logout
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(LOCAL_STORAGE_USER_PROFILE_CACHE_KEY)) {
            localStorage.removeItem(key);
          }
        });

        if (mounted) {
          setUser(null);
          userIdRef.current = null;
          setLoading(false);
        }
      } else if (session?.user) {
        // If we have a session, ensure we have the profile data too
        // We only update if the user ID has changed to avoid unnecessary re-fetches
        // Or if we specifically want to sync
        
        // Optimization: Check userIdRef first to avoid unnecessary fetch if possible, 
        // but since profile data might change, we might want to fetch. 
        // However, 'onAuthStateChange' fires often. We should rely on 'fetchUserProfile' caching or deep compare.
        
        const userWithProfile = await fetchUserProfile(session.user);
        if (mounted) {
            setUser((prev) => {
                 if (JSON.stringify(prev) === JSON.stringify(userWithProfile)) {
                     return prev;
                 }
                 userIdRef.current = userWithProfile.id;
                 return userWithProfile;
            });
            setLoading(false);
        }
      } else {
        // Case where session is null but not explicitly SIGNED_OUT event (e.g. unexpected state)
        if (mounted && userIdRef.current !== null) {
          setUser(null);
          userIdRef.current = null;
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // We intentionally exclude 'user' from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
