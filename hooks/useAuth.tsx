"use client";

import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/components/auth/AuthProvider";

// Re-export specific types for convenience in consuming components
export type { User, AuthContextType } from "@/components/auth/AuthProvider";

/**
 * Custom hook to access the authentication context.
 *
 * This hook provides access to the current user's authentication state,
 * profile information (username, bio, timezone), and methods to refresh
 * the user session.
 *
 * Usage:
 * ```tsx
 * const { user, loading, refreshUser } = useAuth();
 *
 * if (loading) return <Spinner />;
 * if (user) return <Dashboard user={user} />;
 * ```
 *
 * @returns {AuthContextType} The authentication context value.
 * @throws {Error} If used outside of an `<AuthProvider />` component.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider. Wrap your parent component (e.g., layout) with <AuthProvider>.");
  }

  return context;
};
