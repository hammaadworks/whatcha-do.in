"use client";

import { createBrowserClient } from "@supabase/ssr";
import { User, Session } from "@supabase/supabase-js"; 
import { EMAIL } from "@/lib/constants";

export function createClient() {
  // Create a supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return supabase;
}
