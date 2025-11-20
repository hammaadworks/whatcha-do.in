"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth";
import Logins from "./Logins";

const MOCK_USER_ID = "68be1abf-ecbe-47a7-bafb-406be273a02e";
const MOCK_USER_EMAIL = "hammaadworks@gmail.com";

export default function Auth() {
  const { session, setSession } = useAuthStore();

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
    } else {
      // Real Supabase authentication
      console.log('🔐 PRODUCTION MODE: Using Supabase magic link authentication');
      
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }
  }, [setSession]);

  if (!session) {
    return <Logins />;
  }

  return null;
}
