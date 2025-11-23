"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

export interface User extends SupabaseUser {
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      await Promise.resolve().then(() => {
        if (process.env.NEXT_PUBLIC_DEV_MODE_ENABLED === "true") {
          console.log("Development mode enabled. Injecting mock user.");
          const mockUser: User = {
            id: "68be1abf-ecbe-47a7-bafb-46be273a2e",
            email: "hammaadworks@gmail.com",
            username: "hammaadworks", // Added username
            aud: "authenticated",
            app_metadata: {},
            user_metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(mockUser);
        } else if (initialUser) {
          setUser(initialUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    };

    initializeAuth().catch(error => {
      console.error("Error initializing authentication:", error);
      setLoading(false); // Ensure loading is set to false even if an error occurs
    });
  }, [initialUser]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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