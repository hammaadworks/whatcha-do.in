"use client";

import React, { useState, useEffect } from "react";

type Theme = "light" | "dark";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light"); // Default to light

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const initialTheme: Theme = prefersDark.matches ? "dark" : "light";
    setTheme(initialTheme);

    // Listen for changes in system preference
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };
    prefersDark.addEventListener("change", handleChange);

    return () => {
      prefersDark.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    // Remove existing theme classes
    body.classList.remove("theme-zenith", "theme-monolith");

    // Apply new theme class
    if (theme === "dark") {
      body.classList.add("theme-monolith");
    } else {
      body.classList.add("theme-zenith");
    }
  }, [theme]);

  return <>{children}</>;
}
