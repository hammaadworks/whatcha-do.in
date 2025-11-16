"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase/client"; // Import the shared Supabase client

interface SupabaseContextType {
  supabase: typeof supabase | null;
}

const SupabaseContext = createContext<SupabaseContextType>({ supabase: null });

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        console.log("SupabaseProvider: SIGNED_IN event, redirecting to /dashboard");
        router.push("/dashboard");
      } else if (event === "SIGNED_OUT") {
        console.log("SupabaseProvider: SIGNED_OUT event, redirecting to /login");
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]); // Removed supabase from dependency array as it's a singleton

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context.supabase;
};
