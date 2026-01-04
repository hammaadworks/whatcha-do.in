"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { updateActiveTheme } from "@/lib/supabase/user.client";
import { useAuth } from "@/packages/auth/hooks/useAuth";
import { BrandTheme, THEMES } from "@/lib/themes";

export type { BrandTheme };

interface BrandThemeContextType {
  theme: BrandTheme;
  savedTheme: BrandTheme; // The confirmed theme (from DB or local)
  setTheme: (theme: BrandTheme) => Promise<void>;
  setPreviewTheme: (theme: BrandTheme | null) => void;
  setForcedTheme: (theme: BrandTheme | null) => void;
  isPreviewing: boolean;
  isForced: boolean;
}

const BrandThemeContext = createContext<BrandThemeContextType | undefined>(undefined);

export function BrandThemeProvider({
                                     children, activeTheme: initialActiveTheme, disableAuthSync = false
                                   }: Readonly<{
  children: React.ReactNode; activeTheme?: BrandTheme; disableAuthSync?: boolean;
}>) {
  const { user } = useAuth();

  // 1. State Initialization
  // We use the server-provided activeTheme as the initial state.
  // If not provided, we default to 0th index of THEMES.
  const [savedTheme, setSavedTheme] = useState<BrandTheme>(initialActiveTheme || THEMES[0].id);
  const [previewTheme, setPreviewTheme] = useState<BrandTheme | null>(null);
  const [forcedTheme, setForcedTheme] = useState<BrandTheme | null>(null);
  const [mounted, setMounted] = useState(false);

  // 2. Sync with Server Prop (if it changes for some reason, e.g. re-validation)
  useEffect(() => {
    if (initialActiveTheme && initialActiveTheme !== savedTheme) {
      setSavedTheme(initialActiveTheme);
    }
  }, [initialActiveTheme, savedTheme]);

  // 3. Sync with User Object (from useAuth)
  // This handles the case where the user logs in client-side and their theme loads.
  useEffect(() => {
    if (!disableAuthSync && user?.active_theme && user.active_theme !== savedTheme) {
      setSavedTheme(user.active_theme as BrandTheme);
    }
  }, [user?.active_theme, savedTheme, disableAuthSync]);

  // 4. Calculate Effective Theme
  // Priority: Forced > Preview > Saved
  const effectiveTheme = forcedTheme || previewTheme || savedTheme;

  // 5. Handle Mounting (Hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 6. Apply Theme to Body
  useEffect(() => {
    document.body.setAttribute("data-theme", effectiveTheme);
  }, [effectiveTheme]);

  // 6. Theme Setter (DB Sync)
  const setTheme = async (newTheme: BrandTheme) => {
    if (forcedTheme) return;

    // Optimistic Update
    setSavedTheme(newTheme);
    setPreviewTheme(null); // Clear preview since we committed it

    if (user) {
      try {
        await updateActiveTheme(user.id, newTheme);
      } catch (e) {
        console.error("Failed to sync theme to DB", e);
        // Optional: Revert on failure?
        // For themes, it's usually fine to keep the optimistic value
        // until next reload, but we could toast an error.
      }
    }
  };

  const contextValue = {
    theme: effectiveTheme,
    savedTheme,
    setTheme,
    setPreviewTheme,
    setForcedTheme,
    isPreviewing: !!previewTheme,
    isForced: !!forcedTheme
  };

  // Prevent hydration mismatch by rendering same output initially?
  // Actually, for themes, we often want to render immediately to avoid FOUC.
  // The attribute is set in useEffect, so there might be a split second flash if SSR didn't set it.
  // Ideally, the server should render the body with the correct data-theme attribute.
  // But since we are in a Provider inside Layout, the Body is parent.
  // We rely on the initial useEffect to set the attribute quickly.

  return (<BrandThemeContext.Provider value={contextValue}>
    {children}
  </BrandThemeContext.Provider>);
}

export function useBrandTheme() {
  const context = useContext(BrandThemeContext);
  if (context === undefined) {
    throw new Error("useBrandTheme must be used within a BrandThemeProvider");
  }
  return context;
}