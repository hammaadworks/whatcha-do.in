"use client";

import React from "react";
import { BrandThemeProvider } from "@/components/theme/BrandThemeProvider";
import { BrandTheme, THEME_IDS } from "@/lib/themes";
import { useAuth } from "@/hooks/useAuth";

interface PublicProfileThemeWrapperProps {
  initialTheme: string | undefined;
  username?: string; // Add username prop to check ownership
  children: React.ReactNode;
}

export function PublicProfileThemeWrapper({ initialTheme, username, children }: PublicProfileThemeWrapperProps) {
  const { user } = useAuth();
  
  // If the viewer is the owner, use their live active_theme from context/auth
  // This ensures immediate updates without page reload when changing themes in settings
  const isOwner = user?.username && username && user.username === username;
  const effectiveThemeString = isOwner ? user?.active_theme : initialTheme;

  // Validate theme string or fallback to default
  const validTheme = (effectiveThemeString && THEME_IDS.includes(effectiveThemeString as any)) 
    ? effectiveThemeString as BrandTheme 
    : undefined;

  return (
    <BrandThemeProvider initialTheme={validTheme} scoped={true}>
      {children}
    </BrandThemeProvider>
  );
}