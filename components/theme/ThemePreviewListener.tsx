"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { useBrandTheme } from "@/components/theme/BrandThemeProvider";
import { THEMES } from "@/lib/themes";

export function ThemePreviewListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setPreviewTheme } = useBrandTheme();
  
  const themePreviewId = searchParams.get("theme-preview");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (themePreviewId) {
      // Validate theme ID
      const valid = THEMES.some(t => t.id === themePreviewId);
      if (valid) {
          setPreviewTheme(themePreviewId as any);
          setOpen(true);
      }
    }
  }, [themePreviewId, setPreviewTheme]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Clear URL param when closed
      // Construct new URL without theme-preview
      const params = new URLSearchParams(searchParams.toString());
      params.delete("theme-preview");
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  if (!themePreviewId) return null;

  return (
    <ThemeSelector 
        open={open} 
        onOpenChange={handleOpenChange}
        trigger={null} // Don't render a trigger button
    />
  );
}
