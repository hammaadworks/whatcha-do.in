import { useTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';

// Helper to convert HSL(var(--primary-hsl)) to a simple HEX or RGB string
function getCssVarColor(varName: string): string {
  if (typeof window === 'undefined') return ''; // For SSR
  const color = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return color;
}

// Helper to convert HEX to RGBA string
function hexToRgba(hex: string, alpha: number): string {
  let r = 0, g = 0, b = 0;

  // Handle cases where hex might be invalid or empty
  if (!hex || !hex.startsWith('#')) {
    // If hex is invalid, return a default transparent grey
    return `rgba(128,128,128,${alpha})`;
  }

  const cleanHex = hex.substring(1); // Remove #
  
  // Validate hex length
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    console.warn(`Invalid hex color format: ${hex}. Returning default transparent grey.`);
    return `rgba(128,128,128,${alpha})`;
  }

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  }
  else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Custom hook to generate a confetti color palette based on the current theme's primary color.
 * 
 * Returns an array of RGBA strings with varying opacities of the primary color.
 * Updates dynamically when the theme changes.
 * 
 * @returns An array of color strings (e.g., ['rgba(255, 0, 0, 1)', ...]).
 */
export function useConfettiColors(): string[] {
  const { theme } = useTheme();
  const [colors, setColors] = useState<string[]>(['rgba(128,128,128,1.0)']); // Default to opaque grey

  const updateColors = useCallback(() => {
    const primaryHex = getCssVarColor('--primary');
    let effectivePrimaryHex = '';

    // Validate fetched primary hex
    if (primaryHex.startsWith('#') && (primaryHex.length === 7 || primaryHex.length === 4)) {
      effectivePrimaryHex = primaryHex;
    } else {
      // If fetchedPrimaryHex is invalid or empty, use a neutral default
      effectivePrimaryHex = '#808080'; // Neutral grey to be converted to transparent
    }

    // Generate opacity variations from the effective primary hex
    const generatedColors = [
      hexToRgba(effectivePrimaryHex, 1.0),
      hexToRgba(effectivePrimaryHex, 0.8),
      hexToRgba(effectivePrimaryHex, 0.6),
      hexToRgba(effectivePrimaryHex, 0.4)
    ];
    setColors(generatedColors);

  }, [theme]); // updateColors depends on theme

  useEffect(() => {
    updateColors();
  }, [theme, updateColors]);

  return colors;
}