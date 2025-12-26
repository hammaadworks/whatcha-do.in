'use client';

import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface KeyboardShortcutProps {
  /** Array of keys to display (e.g., ["K", "Cmd"]). */
  keys: string[];
  /** Whether to automatically show the modifier key (Alt/Option) based on OS. Defaults to true. */
  showModifier?: boolean;
  className?: string;
}

/**
 * Displays a keyboard shortcut with platform-specific modifier keys.
 * Renders as a sequence of styled <kbd> elements.
 */
const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({ keys, showModifier = true, className }) => {
  const [isMac, setIsMac] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check platform
    setIsMac(typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    
    // Check if mobile to potentially hide shortcuts
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) return null;

  const modifier = isMac ? "⌥" : "Alt"; // Option for Mac, Alt for others
  const plusSign = <span className="text-muted-foreground/50 mx-0.5">+</span>;

  const kbdClass = "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100";

  return (
    <span className={cn("ml-2 inline-flex items-center text-xs text-muted-foreground", className)}>
      {showModifier && (
        <>
          <kbd className={kbdClass}>
            {modifier}
          </kbd>
          {plusSign}
        </>
      )}
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className={kbdClass}>
            {key}
          </kbd>
          {index < keys.length - 1 && plusSign}
        </React.Fragment>
      ))}
    </span>
  );
};

export default KeyboardShortcut;
