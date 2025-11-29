"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { LOCAL_STORAGE_USER_PROFILE_CACHE_KEY } from "@/lib/constants";

export interface User extends SupabaseUser {
  username?: string;
  timezone?: string;
  bio?: string; // Add bio here for consistency with PublicUserDisplay
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUserProfile = async (authUser: SupabaseUser): Promise<User> => {
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
        .from('users')
        .select('username, timezone, bio') // Select bio as well
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return authUser;
      }

      const userWithProfile = {
        ...authUser,
        username: data?.username,
        timezone: data?.timezone,
        bio: data?.bio, // Add bio to the merged user object
      };

      // 3. Save to cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
          id: authUser.id,
          username: data?.username,
          timezone: data?.timezone,
          bio: data?.bio, // Save bio to cache
      }));

      return userWithProfile;

    } catch (error) {
      console.error("Unexpected error fetching user profile:", error);
      return authUser;
    }
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Clear cache to force a fresh fetch
      localStorage.removeItem(`${LOCAL_STORAGE_USER_PROFILE_CACHE_KEY}_${session.user.id}`);
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
        const { data: { session } } = await supabase.auth.getSession();

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // If we have a session, ensure we have the profile data too
        // This is crucial for sign-ins where we might not have the profile loaded yet
        // Logic simplified: always fetch profile on auth state change if user exists
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
