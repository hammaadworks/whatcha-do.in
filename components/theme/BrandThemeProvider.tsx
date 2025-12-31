"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { updateActiveTheme } from "@/lib/supabase/user.client";
import { useAuth } from "@/hooks/useAuth";
import { BrandTheme, THEME_IDS } from "@/lib/themes";
import { useUiStore } from "@/lib/store/uiStore";

export type { BrandTheme };

interface BrandThemeContextType {
  theme: BrandTheme;
  savedTheme: BrandTheme;
  setTheme: (theme: BrandTheme) => void;
  setPreviewTheme: (theme: BrandTheme | null) => void;
  setForcedTheme: (theme: BrandTheme | null) => void;
  isPreviewing: boolean;
  isForced: boolean;
}

const BrandThemeContext = createContext<BrandThemeContextType | undefined>(undefined);

export const DEFAULT_THEME: BrandTheme = "zenith";

export function BrandThemeProvider({ 
    children, 
    initialTheme,
    defaultTheme, // From Server Cookie
    scoped = false
}: { 
    children: React.ReactNode; 
    initialTheme?: BrandTheme;
    defaultTheme?: BrandTheme;
    scoped?: boolean;
}) {
  const { activeTheme: storeTheme, setActiveTheme: setStoreTheme } = useUiStore();
  
  // Initialize state. 
  // If scoped, prioritize initialTheme.
  // If global (not scoped), prioritize defaultTheme (Server Cookie) -> storeTheme (Client Cookie/Store) -> Default.
  const [savedTheme, setSavedTheme] = useState<BrandTheme>(
      scoped 
        ? (initialTheme || DEFAULT_THEME) 
        : (defaultTheme || (storeTheme as BrandTheme) || DEFAULT_THEME)
  );
  
  const [previewTheme, setPreviewTheme] = useState<BrandTheme | null>(null);
  const [forcedTheme, setForcedTheme] = useState<BrandTheme | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  // The effective theme hierarchy: Forced > Preview > Saved
  const activeTheme = forcedTheme || previewTheme || savedTheme;

  useEffect(() => {
    setMounted(true);
    // React to prop change
    if (initialTheme) {
        setSavedTheme(initialTheme);
    }
    
    // Sync from store if global
    if (!scoped && !initialTheme && storeTheme) {
        if (THEME_IDS.includes(storeTheme)) {
            setSavedTheme(storeTheme as BrandTheme);
        }
    }
  }, [initialTheme, scoped, storeTheme]);

  useEffect(() => {
    // Only update body if NOT scoped
    if (!scoped) {
        if (mounted) {
          document.body.setAttribute("data-theme", activeTheme);
        } else if (initialTheme) {
             document.body.setAttribute("data-theme", activeTheme);
        }
    }
  }, [activeTheme, mounted, initialTheme, scoped]);

  // Sync from DB if Cookie was missing (New Device / Cleared Cache)
  useEffect(() => {
      if (!scoped && !defaultTheme && user?.active_theme) {
          if (THEME_IDS.includes(user.active_theme as any)) {
              const dbTheme = user.active_theme as BrandTheme;
              setSavedTheme(dbTheme);
              setStoreTheme(dbTheme); // Sync to cookie now that we found it in DB
          }
      }
  }, [scoped, defaultTheme, user, setStoreTheme]);

  const setTheme = async (newTheme: BrandTheme) => {
      if (forcedTheme) return; // Cannot change theme when forced
      
      // 1. Optimistic UI Update
      setSavedTheme(newTheme);
      setPreviewTheme(null); // Clear preview when saving
      
      // 2. DB Update (First)
      if (!scoped && user) {
          try {
              await updateActiveTheme(user.id, newTheme);
          } catch (e) {
              console.error("Failed to sync theme to DB", e);
              // We could revert state here if strict consistency is required, 
              // but for themes, optimistic is usually better.
          }
      }

      // 3. Cookie Update (Second)
      if (!scoped) {
           setStoreTheme(newTheme);
      }
  };

  const contextValue = { 
        theme: activeTheme, 
        savedTheme,
        setTheme, 
        setPreviewTheme,
        setForcedTheme,
        isPreviewing: !!previewTheme,
        isForced: !!forcedTheme
    };

  if (scoped) {
      return (
        <BrandThemeContext.Provider value={contextValue}>
          <div data-theme={activeTheme} className="w-full bg-background text-foreground transition-colors duration-300 flex flex-col items-center">
            {children}
          </div>
        </BrandThemeContext.Provider>
      );
  }

  return (
    <BrandThemeContext.Provider value={contextValue}>
      {children}
    </BrandThemeContext.Provider>
  );
}

export function useBrandTheme() {
  const context = useContext(BrandThemeContext);
  if (context === undefined) {
    throw new Error("useBrandTheme must be used within a BrandThemeProvider");
  }
  return context;
}
