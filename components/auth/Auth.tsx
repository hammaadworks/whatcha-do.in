"use client";

import { useEffect, ReactNode, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth";
import Logins from "./Logins";

const MOCK_USER_ID = "68be1abf-ecbe-47a7-bafb-406be273a02e";
const MOCK_USER_EMAIL = "hammaadworks@gmail.com";

interface AuthProps {
  children?: ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const { session, setSession } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE_ENABLED === 'true';

    if (isDevMode) {
      // Mock authentication mode for development
      console.log('🔧 DEV MODE: Using mock authentication');
      const mockSession = {
        access_token: "mock-access-token-for-dev",
        token_type: "Bearer" as const,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: "mock-refresh-token-for-dev",
        user: {
          id: MOCK_USER_ID,
          email: MOCK_USER_EMAIL,
          aud: "authenticated",
          role: "authenticated",
          email_confirmed_at: "2025-11-13T17:00:05.782471+00:00",
          phone: "",
          last_sign_in_at: new Date().toISOString(),
          app_metadata: { provider: "email", providers: ["email"] },
          user_metadata: { 
            sub: MOCK_USER_ID, 
            email: MOCK_USER_EMAIL, 
            email_verified: true, 
            phone_verified: false 
          },
          created_at: "2025-11-13T16:59:44.389126+00:00",
          updated_at: new Date().toISOString(),
        },
      };
      setSession(mockSession as any);
      setLoading(false);
    } else {
      // Real Supabase authentication
      console.log('🔐 PRODUCTION MODE: Using Supabase magic link authentication');
      
      let initialLoadComplete = false;

      // Get initial session and set up listener
      const initAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        initialLoadComplete = true;
        setLoading(false);
      };

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        // If onAuthStateChange fires before getSession completes, end loading
        if (!initialLoadComplete) {
          setLoading(false);
        }
      });

      initAuth();

      return () => subscription.unsubscribe();
    }
  }, [setSession]);

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  // Show login if no session
  if (!session) {
    return <Logins />;
  }

  // If children are provided, render them when authenticated
  // Otherwise, return null (for standalone usage on login page)
  return children ? <>{children}</> : null;
}
