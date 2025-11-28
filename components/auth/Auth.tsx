"use client";

import { ReactNode } from "react";
import Logins from "./Logins";
import { useAuth } from "@/hooks/useAuth"; // Import the useAuth hook from our new location

interface AuthProps {
  children?: ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const { user, loading } = useAuth(); // Consume auth state from the context

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  // Show login if no user (no session)
  if (!user) {
    return <Logins />;
  }

  // If children are provided, render them when authenticated
  // Otherwise, return null (for standalone usage on login page)
  return children ? <>{children}</> : null;
}

