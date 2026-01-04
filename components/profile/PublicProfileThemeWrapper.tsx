"use client";

import React from "react";
import { BrandThemeProvider } from "@/components/theme/BrandThemeProvider";
import { THEME_IDS, THEMES } from "@/lib/themes";

interface PublicProfileThemeWrapperProps {
  initialTheme: string | undefined;
  username?: string; // Add username prop to check ownership
  children: React.ReactNode;
}

export function PublicProfileThemeWrapper({ initialTheme, children }: Readonly<PublicProfileThemeWrapperProps>) {
  // Validate theme string or fallback to default
  const validTheme = (initialTheme && THEME_IDS.includes(initialTheme as any))
    ? (initialTheme as any)
    : THEMES[0].id;

  return (
    <BrandThemeProvider activeTheme={validTheme} disableAuthSync={true}>
      {children}
    </BrandThemeProvider>
  );
}