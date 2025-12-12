"use client";

import { useContext } from "react";
import { AuthContext, User, AuthContextType } from "@/components/auth/AuthProvider";

export type { User, AuthContextType };

/**
 * Hook to access the authentication context.
 * @returns The AuthContextType containing the current user, loading state, and refresh function.
 * @throws Error if used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};

// Re-export AuthProvider for backward compatibility if needed, 
// though direct import from components/auth/AuthProvider is preferred.
export { AuthProvider } from "@/components/auth/AuthProvider";
