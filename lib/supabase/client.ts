"use client";

import { createBrowserClient } from "@supabase/ssr";
import { User, Session, AuthError } from "@supabase/supabase-js"; // eslint-disable-line @typescript-eslint/no-unused-vars

export function createClient() {
  // Create a supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // If in development mode, override getSession to return a mock session
  if (process.env.NEXT_PUBLIC_DEV_MODE_ENABLED === "true") {
    console.warn("DEV_MODE: Supabase session is mocked.");

    const mockUser: User = {
      id: "68be1abf-ecbe-47a7-bafb-46be273a2e",
      email: "hammaadworks@gmail.com",
      aud: "authenticated",
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSession: Session = { // Explicitly type as Session
      access_token: "mock-access-token",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: mockUser,
      refresh_token: "mock-refresh-token", // Add refresh_token to match Session type
    };

    // Override the getSession method
    supabase.auth.getSession = async (): Promise<{ data: { session: Session }; error: null }> => {
      // In dev mode, we always return a session
      return { data: { session: mockSession }, error: null };
    };

    // Override the getUser method as well, as it's often used with getSession
    supabase.auth.getUser = async (): Promise<{ data: { user: User }; error: null }> => {
      // In dev mode, we always return a user
      return { data: { user: mockUser }, error: null };
    };
  }

  return supabase;
}
