"use client";

import React, { useEffect } from "react";
import { useBrandTheme } from "@/components/theme/BrandThemeProvider";
import { THEME_IDS, THEMES } from "@/lib/themes";
import { useAuth } from "@/packages/auth/hooks/useAuth";

interface PublicProfileThemeWrapperProps {
  initialTheme: string | undefined;
  username?: string; // Add username prop to check ownership
  children: React.ReactNode;
}

export function PublicProfileThemeWrapper({ initialTheme, username, children }: Readonly<PublicProfileThemeWrapperProps>) {
  const { setForcedTheme } = useBrandTheme();
  const { user } = useAuth();

  // Validate theme string or fallback to default
  const validTheme = (initialTheme && THEME_IDS.includes(initialTheme as any))
    ? (initialTheme as any)
    : THEMES[0].id;

  useEffect(() => {
    // Only force the theme if the viewer is NOT the owner.
    // If I am the owner, my global theme state (savedTheme) takes precedence
    // and allows me to change it live.
    const isOwner = user?.username === username;
    
    if (!isOwner) {
      setForcedTheme(validTheme);
    } else {
      // Ensure we don't leave a stale forced theme if we navigated from another profile
      setForcedTheme(null);
    }
    
    return () => setForcedTheme(null);
  }, [validTheme, setForcedTheme, user?.username, username]);

  return (
    <>
      {children}
    </>
  );
}